import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IndexService } from '../index/index.service';
import { BinanceService } from '../binance/binance.service';
import { CreateIntentDto, I_AggOrder, I_Intent, I_Order } from './types';
import { searchInsert } from '../helpers';
import BigNumber from 'bignumber.js';
import * as process from 'node:process';
import { OrderService } from '../order/order.service';

@Injectable()
export class SolverService implements OnModuleInit, OnModuleDestroy {
  // symbol -> agg orders for each asset for one or several intents
  private readonly aggOrders: Map<
    string,
    { buy: I_AggOrder[]; sell: I_AggOrder[] }
  > = new Map();

  // intentId -> intent
  private readonly intents: Map<string, I_Intent> = new Map();

  private intervalId: NodeJS.Timeout;

  constructor(
    private readonly indexService: IndexService,
    private readonly binanceService: BinanceService,
    private readonly ordersService: OrderService,
  ) {}

  onModuleInit(): any {
    // start 10 sec ticker
    this.intervalId = setInterval(() => {
      process.nextTick(this.processIntents.bind(this)); // get all orders
    }, 10_000);
  }

  onModuleDestroy(): any {
    clearInterval(this.intervalId);
  }

  processIntents() {
    const pendingIntents: I_Intent[] = [];

    const indexPrice = this.indexService.getIndexPrice();

    for (const intent of this.intents.values()) {
      if (intent.status !== 'pending') {
        continue;
      }

      let shouldProceed = false;

      if (intent.direction === 'buy' && indexPrice.lte(intent.price)) {
        shouldProceed = true;
      } else if (intent.direction === 'sell' && indexPrice.gte(intent.price)) {
        shouldProceed = true;
      }

      if (shouldProceed) {
        pendingIntents.push(intent);
      }
    }

    this.processAggOrders(pendingIntents);
  }

  processAggOrders(pendingIntents: I_Intent[]) {
    this.processUnfilledAggOrders();

    // symbol -> orders
    const aggOrders: Record<string, I_AggOrder[]> = {};

    for (const intent of pendingIntents) {
      const index = this.indexService.getIndexData(intent.indexId);

      if (!index) {
        throw new Error('Index not found');
      }

      const indexPrice = this.indexService.getIndexPrice(index.id);

      if (!indexPrice) {
        throw new Error('Index price not found');
      }

      for (const asset of index.assets) {
        const aggOrdersForAsset = (aggOrders[asset.symbol] || []).find(
          (aO) => aO.direction === intent.direction,
        );

        if (!aggOrdersForAsset) {
          const aggOrderId = Symbol('aggOrderId');

          const aggOrder: I_AggOrder = {
            id: aggOrderId,
            orderId: 'replaceAfterCreate',
            clientOrderId: aggOrderId.toString(),
            indexId: index.id,
            intentIds: [intent.id],
            symbol: asset.symbol,
            direction: intent.direction,
            status: 'pending',
            aggQuantity: intent.amount
              .multipliedBy(asset.qtyPerShare)
              .toString(),
            aggPrice: 'setBeforeCreate',
            filledQuantity: '0',
            createdAt: new Date(),
          };

          this.aggOrders.get(asset.symbol)[intent.direction].push(aggOrder);
        } else {
          aggOrdersForAsset.aggQuantity = BigNumber(
            aggOrdersForAsset.aggQuantity,
          )
            .plus(intent.amount.multipliedBy(asset.qtyPerShare))
            .toString();
        }
      }
    }

    for (const [symbol, aOrders] of Object.entries(aggOrders)) {
      for (const aOrder of aOrders) {
        const assetLastPrice = this.binanceService.getPrice(aOrder.symbol);

        if (!assetLastPrice) {
          throw new Error('Asset price not found');
        }

        aOrder.aggPrice = this.ordersService.calculateOrderPrice(
          aOrder.symbol,
          aOrder.aggQuantity,
          aOrder.direction,
        );

        this.aggOrders.get(symbol)[aOrder.direction].push(aOrder);
      }
    }

    // sort by volume and take 10 orders with the highest volume
  }

  processUnfilledAggOrders() {
    let aggOrders: I_AggOrder[] = [];

    for (const assetOrders of this.aggOrders.values()) {
      aggOrders = aggOrders.concat(assetOrders.buy, assetOrders.sell);
    }

    for (const aggOrder of aggOrders) {
      const { status, aggQuantity, aggPrice, filledQuantity, direction } =
        aggOrder;

      const assetLastPrice = this.binanceService.getPrice(aggOrder.symbol);

      if (!assetLastPrice) {
        throw new Error('Asset price not found');
      }

      if (
        status === 'active' &&
        BigNumber(filledQuantity).isLessThan(aggQuantity) &&
        (direction === 'buy'
          ? BigNumber(assetLastPrice).gte(
              BigNumber(aggPrice).multipliedBy(1.001),
            )
          : BigNumber(assetLastPrice).lte(
              BigNumber(aggPrice).multipliedBy(0.999),
            ))
      ) {
        const newAggQuantity = BigNumber(aggQuantity).minus(filledQuantity);
        const newAggPrice = this.ordersService.calculateOrderPrice(
          aggOrder.symbol,
          newAggQuantity,
          direction,
        );

        const newAggOrderId = Symbol('aggOrderId');

        const newAggOrder: I_AggOrder = {
          ...aggOrder,
          id: newAggOrderId,
          status: 'pending',
          aggPrice: newAggPrice,
          aggQuantity: newAggQuantity.toString(),
          clientOrderId: newAggOrderId.toString(),
        };

        this.cancelAggOrder(aggOrder);

        this.aggOrders
          .get(aggOrder.symbol)
          [aggOrder.direction].push(newAggOrder);
      }
    }
  }

  cancelAggOrder(aggOrder: I_AggOrder) {
    const orderId = this.binanceService.cancelOrder(aggOrder.orderId);

    if (orderId) {
      aggOrder.status = 'cancelled';
      this.aggOrders.get(aggOrder.symbol)[aggOrder.direction] = this.aggOrders
        .get(aggOrder.symbol)
        [aggOrder.direction].filter((aO) => aO.id !== aggOrder.id);
    }

    return orderId;
  }
}

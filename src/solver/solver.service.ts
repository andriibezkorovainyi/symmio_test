import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IndexService } from '../index/index.service';
import { BinanceService } from '../binance/binance.service';
import { CreateIntentDto, I_AggOrder, I_Intent, I_Order } from './types';
import { searchInsert } from '../helpers';
import BigNumber from 'bignumber.js';
import * as process from 'node:process';

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
    // check active aggOrders which are not fulfilled
    // and replace them with new ones if asset price has moved more than 0,1% from the last order price
    // cancel old ones and push new to the aggOrdersQueue
    // before creating an order, check if we can match it internally, make trade and update intents
  }

  // Binance receive 10 orders per second
  // 10 assets in index

  // 1. Create intent - without indexId, since its only one index in our system
  createIntent(data: CreateIntentDto) {
    const { userId, amount, price, direction } = data;

    const intent: I_Intent = {
      id: Symbol('intentId'),
      userId,
      amount: BigNumber(amount),
      price: BigNumber(price),
      direction: direction,
      status: 'pending',
      filledAmount: BigNumber(0),
      filledPrice: BigNumber(0),
      fillLoss: BigNumber(0),
      createdAt: new Date(),
    };

    const index = this.indexService.getIndexData();

    if (!index) {
      throw new Error('Index not found');
    }

    const indexPrice = this.indexService.getIndexPrice();

    if (!indexPrice) {
      throw new Error('Index price not found');
    }

    const orders: I_Order[] = [];

    for (const asset of index.assets) {
      const quantity = BigNumber(amount)
        .multipliedBy(asset.weight)
        .dividedBy(indexPrice);

      const assetPrice = BigNumber(this.binanceService.getPrice(asset.symbol));

      const orderPrice = assetPrice.multipliedBy(
        intent.price.dividedBy(indexPrice),
      );

      const order: I_Order = {
        id: Symbol('orderId'),
        intentId: intent.id,
        symbol: asset.symbol,
        direction: direction,
        quantity: quantity.toString(),
        price: orderPrice.toString(),
        createdAt: new Date(),
      };

      orders.push(order);
    }

    this.addIntent(intent, intent.id);
    // orders.forEach((order) => this.addOrder(order, type));
  }

  private addIntent(intent: I_Intent, intentId: symbol) {
    const queue = this.intents[intentId];

    const insertIndex = searchInsert(
      queue,
      (existingIntent: I_Intent, newIntent: I_Intent) => {
        const existingIntentVolume = existingIntent.amount.multipliedBy(
          existingIntent.price,
        );

        const newIntentVolume = newIntent.amount.multipliedBy(newIntent.price);

        if (existingIntentVolume.isEqualTo(newIntentVolume)) {
          return 0;
        }

        return newIntentVolume.isGreaterThan(existingIntentVolume) ? 1 : -1;
      },
      intent,
    );

    queue.splice(insertIndex, 0, intent);
  }

  // private addOrder(order: I_Order, type: 'buy' | 'sell') {
  //   const queue = this.ordersQueue[order.symbol][type];
  //
  //   const insertIndex = searchInsert(
  //     queue,
  //     (existingOrder: I_Order, newOrder: I_Order) => {
  //       const existingOrderVolume = BigNumber(existingOrder.price).multipliedBy(
  //         existingOrder.quantity,
  //       );
  //       const newOrderVolume = BigNumber(newOrder.price).multipliedBy(
  //         newOrder.quantity,
  //       );
  //
  //       if (existingOrderVolume.isEqualTo(newOrderVolume)) {
  //         return 0;
  //       }
  //
  //       return newOrderVolume.isGreaterThan(existingOrderVolume) ? 1 : -1;
  //     },
  //     order,
  //   );
  //
  //   queue.splice(insertIndex, 0, order);
  // }

  manageQueue() {}
}

import { Injectable } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import BigNumber from 'bignumber.js';

interface I_IndexData {
  id: symbol;

  initialPrice: string;

  assets: {
    symbol: string;
    qtyPerShare: string;
  }[];
}

@Injectable()
export class IndexService {
  private indexes: Record<symbol, I_IndexData>;

  constructor(private readonly binanceService: BinanceService) {}

  // create new ETF index
  createIndex(indexData: Pick<I_IndexData, 'assets'>) {
    this.indexes = {
      id: Symbol('indexId'),
      assets: indexData.assets,
      initialPrice: '100',
    };

    return this.indexes;
  }

  // get index data
  getIndexData(indexId: symbol) {
    return this.indexes[indexId];
  }

  getIndexPrice(indexId: symbol) {
    const prices = this.binanceService.getPrices();
    let indexPrice = BigNumber(0);

    for (const asset of this.indexes[indexId].assets) {
      indexPrice = indexPrice.plus(
        BigNumber(prices[asset.symbol]).multipliedBy(asset.qtyPerShare),
      );
    }

    return indexPrice;
  }

  // calculate new balance structure
  rebalance(indexId) {}
}

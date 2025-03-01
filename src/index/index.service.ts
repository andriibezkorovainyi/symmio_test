import { Injectable } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import BigNumber from 'bignumber.js';

interface I_IndexData {
  id: symbol;

  initialPrice: string;

  assets: {
    symbol: string;
    weight: string;
  }[];
}

@Injectable()
export class IndexService {
  private indexData: I_IndexData;

  constructor(private readonly binanceService: BinanceService) {}

  // create new ETF index
  createIndex(indexData: Pick<I_IndexData, 'assets'>) {
    this.indexData = {
      id: Symbol('indexId'),
      assets: indexData.assets,
      initialPrice: '100',
    };

    return this.indexData;
  }

  // get index data
  getIndexData() {
    return this.indexData;
  }

  getIndexPrice() {
    const prices = this.binanceService.getPrices();
    let indexPrice = BigNumber(0);

    for (const asset of this.indexData.assets) {
      indexPrice = indexPrice.plus(
        BigNumber(prices[asset.symbol]).multipliedBy(asset.weight),
      );
    }

    return indexPrice;
  }

  // calculate new balance structure
  rebalance(indexId) {}
}

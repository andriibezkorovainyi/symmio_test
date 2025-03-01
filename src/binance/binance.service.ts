import { Injectable } from '@nestjs/common';

@Injectable()
export class BinanceService {
  private prices: Record<string, string> = {};

  constructor() {}

  getPrices() {
    return this.prices;
  }

  getPrice(symbol: string) {
    return this.prices[symbol];
  }

  setPrices(data: Record<string, string>) {
    this.prices = data;
  }

  setPrice(symbol: string, price: string) {
    this.prices[symbol] = price;
  }
}

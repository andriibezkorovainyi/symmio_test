import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  private orderBook: Map<
    string,
    { asks: [string, string]; bids: [string, string] }
  > = new Map();

  setOrderBook(symbol, orderBook) {
    this.orderBook.set(symbol, orderBook);
  }

  calculateOrderPrice(symbol, qty, side): string {
    // calculate order price based on liquidity
  }

  // create order process
  createOrder(orderDto) {}

  // cancel order process
  cancelOrder(orderId) {}

  // track order process
  trackOrder(orderId) {}
}

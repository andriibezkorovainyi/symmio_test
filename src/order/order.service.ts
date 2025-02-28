import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  // create order process
  createOrder(orderDto) {}

  // cancel order process
  cancelOrder(orderId) {}

  // track order process
  trackOrder(orderId) {}
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class SolverService {

  executeOrders(queue) – исполнение ордеров в соответствии с лимитами Binance.
  simulateMarketImpact(order) – оценка влияния заявки на рынок.
  manageQueue() – управление очередями ордеров.
}

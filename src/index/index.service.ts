import { Injectable } from '@nestjs/common';

@Injectable()
export class IndexService {
  // create new ETF index
  createIndex(indexData) {}

  // get index data
  getIndexData(indexId) {}

  // calculate new balance structure
  rebalance(indexId) {}
}

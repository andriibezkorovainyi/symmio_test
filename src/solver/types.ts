import BigNumber from 'bignumber.js';

export enum SymbolsEnum {
  BTC = 'BTC',
  ETH = 'ETH',
  USDC = 'USDC',
}

export interface I_Intent {
  id: symbol;

  userId: symbol;

  indexId: symbol;

  amount: BigNumber;

  price: BigNumber;

  direction: 'buy' | 'sell';

  status: 'pending' | 'active' | 'fulfilled' | 'cancelled';

  filledAmount: BigNumber;

  filledPrice: BigNumber;

  fillLoss: BigNumber;

  createdAt: Date;
}

export interface I_Order {
  id: symbol | string;

  intentId: symbol;

  symbol: string;

  direction: 'buy' | 'sell';

  quantity: string;

  // filledQuantity: string;

  // price: string;

  createdAt: Date;
}

export interface I_AggOrder {
  id: symbol;

  // from binance response
  orderId: string;

  // to match orders response with existing agg orders
  clientOrderId: string;

  indexId: symbol;

  symbol: string;

  intentIds: symbol[];

  // orderIds: symbol | string[];

  status: 'pending' | 'active' | 'fulfilled' | 'cancelled';

  direction: 'buy' | 'sell';

  aggQuantity: string;

  aggPrice: string;

  filledQuantity: string;

  createdAt: Date;
}

export type CreateIntentDto = {
  direction: 'buy' | 'sell';
  amount: string;
  price: string;
  userId: symbol;
  indexId: symbol;
};

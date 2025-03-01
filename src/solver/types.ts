import BigNumber from 'bignumber.js';

export enum SymbolsEnum {
  BTC = 'BTC',
  ETH = 'ETH',
  USDC = 'USDC',
}

export interface I_Intent {
  id: symbol;

  userId: symbol;

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

  // intentId: symbol;

  symbol: string;

  direction: 'buy' | 'sell';

  quantity: string;

  filledQuantity: string;

  price: string;

  createdAt: Date;
}

export interface I_AggOrder {
  id: symbol;

  symbol: string;

  intentIds: symbol[];

  // orderIds: symbol | string[];

  direction: 'buy' | 'sell';

  aggQuantity: string;

  aggPrice: string;

  createdAt: Date;
}

export type CreateIntentDto = {
  direction: 'buy' | 'sell';
  amount: string;
  price: string;
  userId: symbol;
};

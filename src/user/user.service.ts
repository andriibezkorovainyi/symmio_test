import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {

  // on-chain deposit process
  deposit(collateral: number, userId: string) {}

  // get current balance
  getBalance(userId: string){}

  // withdraw process
  withdraw(userId: string, amount: number) {}
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { IndexModule } from './index/index.module';
import { SolverModule } from './solver/solver.module';
import { BinanceModule } from './binance/binance.module';

@Module({
  imports: [UserModule, OrderModule, IndexModule, SolverModule, BinanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

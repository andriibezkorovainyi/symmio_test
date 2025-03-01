import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { IndexModule } from './index/index.module';
import { SolverModule } from './solver/solver.module';
import { BinanceModule } from './binance/binance.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/config.validate';
import { AppConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate }),
    UserModule,
    OrderModule,
    IndexModule,
    SolverModule,
    BinanceModule,
  ],
  controllers: [],
  providers: [AppService, AppConfigService],
  exports: [AppConfigService],
})
export class AppModule {}

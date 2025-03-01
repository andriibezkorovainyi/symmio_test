import { Module } from '@nestjs/common';
import { IndexService } from './index.service';

@Module({
  providers: [IndexService],
  exports: [IndexService],
})
export class IndexModule {}

import { Module } from '@nestjs/common';
import { IndexService } from './index.service';

@Module({
  providers: [IndexService]
})
export class IndexModule {}

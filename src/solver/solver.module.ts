import { Module } from '@nestjs/common';
import { SolverService } from './solver.service';
import { IndexModule } from '../index/index.module';

@Module({
  imports: [IndexModule],
  providers: [SolverService],
})
export class SolverModule {}

import { Module } from '@nestjs/common';
import { StallsController } from './stalls.controller';
import { StallsService } from './stalls.service';

@Module({
  controllers: [StallsController],
  providers: [StallsService],
  exports: [StallsService],
})
export class StallsModule {} 
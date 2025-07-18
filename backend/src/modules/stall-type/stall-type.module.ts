import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StallTypeService } from './stall-type.service';
import { StallTypeController } from './stall-type.controller';
import { StallType, StallTypeSchema } from '../../schemas/stall-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StallType.name, schema: StallTypeSchema },
    ]),
  ],
  controllers: [StallTypeController],
  providers: [StallTypeService],
  exports: [StallTypeService],
})
export class StallTypeModule {} 
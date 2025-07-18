import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exhibition, ExhibitionSchema } from '../../schemas/exhibition.schema';
import { StallType, StallTypeSchema } from '../../schemas/stall-type.schema';
import { ExhibitionsController } from './exhibitions.controller';
import { ExhibitionsService } from './exhibitions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: StallType.name, schema: StallTypeSchema }
    ]),
  ],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService],
  exports: [ExhibitionsService],
})
export class ExhibitionsModule {} 
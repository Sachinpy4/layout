import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LayoutController } from './layout.controller';
import { LayoutService } from './layout.service';
import { Layout, LayoutSchema } from '../../schemas/layout.schema';
import { StallType, StallTypeSchema } from '../../schemas/stall-type.schema';
import { FixtureType, FixtureTypeSchema } from '../../schemas/fixture-type.schema';
import { Exhibition, ExhibitionSchema } from '../../schemas/exhibition.schema';
import { StallTypeService } from '../stall-type/stall-type.service';
import { FixtureTypeService } from '../fixture-type/fixture-type.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Layout.name, schema: LayoutSchema },
      { name: StallType.name, schema: StallTypeSchema },
      { name: FixtureType.name, schema: FixtureTypeSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
    ]),
  ],
  controllers: [LayoutController],
  providers: [LayoutService, StallTypeService, FixtureTypeService],
  exports: [LayoutService, StallTypeService, FixtureTypeService],
})
export class LayoutModule {} 
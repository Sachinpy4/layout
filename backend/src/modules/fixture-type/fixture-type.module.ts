import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FixtureTypeService } from './fixture-type.service';
import { FixtureType, FixtureTypeSchema } from '../../schemas/fixture-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FixtureType.name, schema: FixtureTypeSchema },
    ]),
  ],
  providers: [FixtureTypeService],
  exports: [FixtureTypeService],
})
export class FixtureTypeModule {} 
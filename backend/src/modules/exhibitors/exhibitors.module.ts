import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExhibitorsController } from './exhibitors.controller';
import { ExhibitorsService } from './exhibitors.service';
import { AuthModule } from '../auth/auth.module';
import { Exhibitor, ExhibitorSchema } from '../../schemas/exhibitor.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Exhibitor.name, schema: ExhibitorSchema },
    ]),
  ],
  controllers: [ExhibitorsController],
  providers: [ExhibitorsService],
  exports: [ExhibitorsService],
})
export class ExhibitorsModule {} 
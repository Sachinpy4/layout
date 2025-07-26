import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exhibition, ExhibitionSchema } from '../../schemas/exhibition.schema';
import { StallType, StallTypeSchema } from '../../schemas/stall-type.schema';
import { ExhibitionsController } from './exhibitions.controller';
import { ExhibitionsService } from './exhibitions.service';
import { ImageHelperService } from './image-helper.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: StallType.name, schema: StallTypeSchema },
    ]),
    UploadModule, // Import UploadModule to use UploadService
  ],
  controllers: [ExhibitionsController],
  providers: [ExhibitionsService, ImageHelperService],
  exports: [ExhibitionsService, ImageHelperService],
})
export class ExhibitionsModule {} 
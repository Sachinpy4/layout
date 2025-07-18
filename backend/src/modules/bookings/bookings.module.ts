import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { AuthModule } from '../auth/auth.module';

// Import all required schemas
import { Booking, BookingSchema } from '../../schemas/booking.schema';
import { Exhibition, ExhibitionSchema } from '../../schemas/exhibition.schema';
import { Stall, StallSchema } from '../../schemas/stall.schema';
import { StallType, StallTypeSchema } from '../../schemas/stall-type.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Exhibitor, ExhibitorSchema } from '../../schemas/exhibitor.schema';
import { Layout, LayoutSchema } from '../../schemas/layout.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: Stall.name, schema: StallSchema },
      { name: StallType.name, schema: StallTypeSchema },
      { name: User.name, schema: UserSchema },
      { name: Exhibitor.name, schema: ExhibitorSchema },
      { name: Layout.name, schema: LayoutSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {} 
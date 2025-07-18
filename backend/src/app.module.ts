import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StallsModule } from './modules/stalls/stalls.module';
import { StallTypeModule } from './modules/stall-type/stall-type.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExhibitionsModule } from './modules/exhibitions/exhibitions.module';
import { LayoutModule } from './modules/layout/layout.module';
import { ExhibitorsModule } from './modules/exhibitors/exhibitors.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';

// Import all schemas
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from './schemas/role.schema';
import { Exhibition, ExhibitionSchema } from './schemas/exhibition.schema';
import { Stall, StallSchema } from './schemas/stall.schema';
import { Hall, HallSchema } from './schemas/hall.schema';
import { StallType, StallTypeSchema } from './schemas/stall-type.schema';
import { Exhibitor, ExhibitorSchema } from './schemas/exhibitor.schema';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Layout, LayoutSchema } from './schemas/layout.schema';
import { FixtureType, FixtureTypeSchema } from './schemas/fixture-type.schema';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database configuration
    MongooseModule.forRootAsync(databaseConfig),
    
    // Register all schemas globally
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Exhibition.name, schema: ExhibitionSchema },
      { name: Stall.name, schema: StallSchema },
      { name: Hall.name, schema: HallSchema },
      { name: StallType.name, schema: StallTypeSchema },
      { name: Exhibitor.name, schema: ExhibitorSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Layout.name, schema: LayoutSchema },
      { name: FixtureType.name, schema: FixtureTypeSchema },
    ]),
    
    // Feature modules
    AuthModule,
    UsersModule,
    ExhibitionsModule,
    StallsModule,
    StallTypeModule,
    BookingsModule,
    PaymentsModule,
    LayoutModule,
    ExhibitorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 
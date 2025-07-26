import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class SystemSettings extends Document {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
    default: 'Stall Booking Admin',
  })
  siteName: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  headerLogo?: string;

  @Prop({
    required: true,
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'],
    default: 'USD',
  })
  defaultCurrency: string;

  @Prop({
    required: true,
    type: String,
    enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
    default: 'MM/DD/YYYY',
  })
  dateFormat: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  maintenanceMode: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  registrationEnabled: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  emailNotifications: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  newBookingAlerts: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  paymentNotifications: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  systemAlerts: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  updatedBy?: Types.ObjectId;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings); 
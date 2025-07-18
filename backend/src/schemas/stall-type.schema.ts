import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StallTypeDocument = StallType & Document;

@Schema({ _id: false })
export class StallSize {
  @Prop({ required: true, type: Number, min: 1 })
  width: number;

  @Prop({ required: true, type: Number, min: 1 })
  height: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class StallType {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
    index: true,
  })
  name: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  description?: string;

  @Prop({
    required: true,
    type: String,
    enum: ['standard', 'premium', 'corner', 'island', 'custom'],
    default: 'standard',
    index: true,
  })
  category: string;

  @Prop({ required: true, type: StallSize })
  defaultSize: StallSize;

  @Prop({ 
    required: true, 
    type: String, 
    match: /^#[0-9A-F]{6}$/i,
    default: '#52c41a'
  })
  color: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
    default: 100,
  })
  defaultRate: number;

  @Prop({
    type: String,
    enum: ['per_sqm', 'per_stall', 'per_day'],
    default: 'per_sqm',
  })
  rateType: string;

  @Prop({
    type: [String],
    default: [],
  })
  includedAmenities: string[];

  @Prop({
    type: [String],
    default: [],
  })
  availableAmenities: string[];

  @Prop({
    type: Number,
    min: 1,
    default: 1,
  })
  minimumBookingDuration: number;

  @Prop({
    type: Number,
    min: 1,
    default: 365,
  })
  maximumBookingDuration: number;

  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  sortOrder: number;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    index: true,
  })
  updatedBy?: Types.ObjectId;
}

export const StallTypeSchema = SchemaFactory.createForClass(StallType);

// Indexes for performance
StallTypeSchema.index({ name: 1 });
StallTypeSchema.index({ category: 1, isActive: 1 });
StallTypeSchema.index({ sortOrder: 1 });
StallTypeSchema.index({ createdAt: -1 }); 
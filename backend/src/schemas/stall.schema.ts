import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Interface for virtual fields
export interface StallVirtuals {
  area: number;
  basePrice: number;
}

export type StallDocument = Stall & Document & StallVirtuals;

@Schema({ _id: false })
export class StallDimensions {
  @Prop({ required: true, min: 0 })
  x: number;

  @Prop({ required: true, min: 0 })
  y: number;

  @Prop({ required: true, min: 1, max: 1000 })
  width: number;

  @Prop({ required: true, min: 1, max: 1000 })
  height: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Stall {
  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
    index: true,
  })
  number: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Hall',
    required: true,
    index: true,
  })
  hallId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Exhibition',
    required: true,
    index: true,
  })
  exhibitionId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'StallType',
    required: true,
    index: true,
  })
  stallTypeId: Types.ObjectId;

  @Prop({
    type: StallDimensions,
    required: true,
  })
  dimensions: StallDimensions;

  @Prop({
    required: true,
    min: 0,
    get: (v: number) => Math.round(v * 100) / 100, // Round to 2 decimal places
  })
  ratePerSqm: number;

  @Prop({
    type: String,
    enum: ['available', 'reserved', 'booked', 'maintenance'],
    default: 'available',
    index: true,
  })
  status: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  description?: string;

  @Prop({
    type: [String],
    default: [],
  })
  features: string[];

  // Note: area and basePrice are defined as virtual fields below
}

export const StallSchema = SchemaFactory.createForClass(Stall);

// Indexes for performance
StallSchema.index({ exhibitionId: 1, hallId: 1 });
StallSchema.index({ number: 1, exhibitionId: 1 }, { unique: true });
StallSchema.index({ status: 1, exhibitionId: 1 });
StallSchema.index({ stallTypeId: 1, status: 1 });
StallSchema.index({ createdAt: -1 });

// Compound index for spatial queries (if needed for layout positioning)
StallSchema.index({ 
  exhibitionId: 1, 
  'dimensions.x': 1, 
  'dimensions.y': 1 
});

// Virtual for area calculation
StallSchema.virtual('area').get(function() {
  return this.dimensions ? this.dimensions.width * this.dimensions.height : 0;
});

// Virtual for base price calculation
StallSchema.virtual('basePrice').get(function() {
  const area = this.dimensions ? this.dimensions.width * this.dimensions.height : 0;
  return area * this.ratePerSqm;
});

// Ensure virtuals are included when converting to JSON
StallSchema.set('toJSON', { virtuals: true });
StallSchema.set('toObject', { virtuals: true }); 
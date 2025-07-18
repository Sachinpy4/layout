import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HallDocument = Hall & Document;

@Schema({ _id: false })
export class HallDimensions {
  @Prop({ required: true, min: 0 })
  x: number;

  @Prop({ required: true, min: 0 })
  y: number;

  @Prop({ required: true, min: 1, max: 10000 })
  width: number;

  @Prop({ required: true, min: 1, max: 10000 })
  height: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Hall {
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
    index: true,
  })
  name: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Exhibition',
    required: true,
    index: true,
  })
  exhibitionId: Types.ObjectId;

  @Prop({
    type: HallDimensions,
    required: true,
  })
  dimensions: HallDimensions;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  description?: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({
    type: [String],
    default: [],
  })
  facilities: string[];

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  capacity: number;

  @Prop({
    trim: true,
    maxlength: 100,
  })
  location?: string;

  @Prop({
    type: Number,
    default: 1,
    min: 1,
  })
  floor: number;

  // Virtual for area calculation
  get area(): number {
    return this.dimensions ? this.dimensions.width * this.dimensions.height : 0;
  }
}

export const HallSchema = SchemaFactory.createForClass(Hall);

// Indexes for performance
HallSchema.index({ exhibitionId: 1 });
HallSchema.index({ name: 1, exhibitionId: 1 }, { unique: true });
HallSchema.index({ status: 1, exhibitionId: 1 });
HallSchema.index({ createdAt: -1 });

// Virtual for area calculation
HallSchema.virtual('area').get(function() {
  return this.dimensions ? this.dimensions.width * this.dimensions.height : 0;
});

// Ensure virtuals are included when converting to JSON
HallSchema.set('toJSON', { virtuals: true });
HallSchema.set('toObject', { virtuals: true }); 
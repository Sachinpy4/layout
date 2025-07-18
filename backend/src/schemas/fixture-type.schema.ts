import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FixtureTypeDocument = FixtureType & Document;

@Schema({ _id: false })
export class FixtureSize {
  @Prop({ required: true, type: Number, min: 1 })
  width: number;

  @Prop({ required: true, type: Number, min: 1 })
  height: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class FixtureType {
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
    enum: ['infrastructure', 'decoration', 'service', 'security', 'utility'],
    index: true,
  })
  category: string;

  @Prop({ required: true, type: FixtureSize })
  defaultSize: FixtureSize;

  @Prop({ 
    required: true, 
    type: String, 
    match: /^#[0-9A-F]{6}$/i,
    default: '#fa8c16'
  })
  color: string;

  @Prop({
    type: String,
    maxlength: 10,
    default: '🔧',
  })
  icon?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isMovable: boolean;

  @Prop({
    type: Boolean,
    default: true,
  })
  isResizable: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isRotatable: boolean;

  @Prop({
    type: [String],
    default: [],
  })
  requiredProperties: string[];

  @Prop({
    type: [String],
    default: [],
  })
  optionalProperties: string[];

  @Prop({
    type: Object,
    default: {},
  })
  defaultProperties: Record<string, any>;

  @Prop({
    type: Number,
    min: 0,
    default: 0,
  })
  cost: number;

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

export const FixtureTypeSchema = SchemaFactory.createForClass(FixtureType);

// Indexes for performance
FixtureTypeSchema.index({ name: 1 });
FixtureTypeSchema.index({ category: 1, isActive: 1 });
FixtureTypeSchema.index({ sortOrder: 1 });
FixtureTypeSchema.index({ createdAt: -1 }); 
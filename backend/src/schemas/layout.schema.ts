import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LayoutDocument = Layout & Document;

// Sub-schemas for complex nested objects
@Schema({ _id: false })
export class Point {
  @Prop({ required: true, type: Number })
  x: number;

  @Prop({ required: true, type: Number })
  y: number;
}

@Schema({ _id: false })
export class Size {
  @Prop({ required: true, type: Number, min: 1 })
  width: number;

  @Prop({ required: true, type: Number, min: 1 })
  height: number;
}

@Schema({ _id: false })
export class Transform {
  @Prop({ required: true, type: Number })
  x: number;

  @Prop({ required: true, type: Number })
  y: number;

  @Prop({ required: true, type: Number, default: 0 })
  rotation: number;

  @Prop({ type: Number, default: 1 })
  scaleX?: number;

  @Prop({ type: Number, default: 1 })
  scaleY?: number;
}

@Schema({ _id: false })
export class ZoomSettings {
  @Prop({ required: true, type: Number, min: 0.1, max: 10 })
  min: number;

  @Prop({ required: true, type: Number, min: 0.1, max: 10 })
  max: number;

  @Prop({ required: true, type: Number, min: 0.1, max: 10 })
  default: number;

  @Prop({ required: true, type: Number, min: 0.1, max: 10 })
  current: number;
}

@Schema({ _id: false })
export class GridSettings {
  @Prop({ required: true, type: Boolean, default: true })
  enabled: boolean;

  @Prop({ required: true, type: Number, min: 1, max: 100 })
  size: number;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  color: string;

  @Prop({ required: true, type: Number, min: 0, max: 1 })
  opacity: number;
}

@Schema({ _id: false })
export class CanvasSettings {
  @Prop({ required: true, type: Size })
  size: Size;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  backgroundColor: string;

  @Prop({ required: true, type: GridSettings })
  grid: GridSettings;

  @Prop({ required: true, type: ZoomSettings })
  zoom: ZoomSettings;
}

@Schema({ _id: false })
export class LayoutSettings {
  @Prop({ required: true, type: Boolean, default: true })
  snapToGrid: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  showGuides: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  autoSave: boolean;
}

@Schema({ _id: false })
export class StallReference {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  number: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ required: true, type: Transform })
  transform: Transform;

  @Prop({ required: true, type: Size })
  size: Size;

  @Prop({ required: true, type: Types.ObjectId, ref: 'StallType' })
  stallType: Types.ObjectId;

  @Prop({ 
    required: true, 
    type: String, 
    enum: ['available', 'booked', 'blocked', 'maintenance'],
    default: 'available'
  })
  status: string;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  color: string;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  borderColor: string;

  @Prop({ required: true, type: Number, min: 0, max: 10 })
  borderWidth: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Booking' })
  bookingId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  amenities: string[];

  @Prop({ type: String, default: () => new Date().toISOString() })
  createdAt: string;

  @Prop({ type: String, default: () => new Date().toISOString() })
  updatedAt: string;
}

@Schema({ _id: false })
export class HallReference {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String, maxlength: 100 })
  name: string;

  @Prop({ type: String, maxlength: 500 })
  description?: string;

  @Prop({ required: true, type: Transform })
  transform: Transform;

  @Prop({ required: true, type: Size })
  size: Size;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  color: string;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  borderColor: string;

  @Prop({ required: true, type: Number, min: 0, max: 10 })
  borderWidth: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: [StallReference], default: [] })
  stalls: StallReference[];

  @Prop({ type: String, default: () => new Date().toISOString() })
  createdAt: string;

  @Prop({ type: String, default: () => new Date().toISOString() })
  updatedAt: string;
}

@Schema({ _id: false })
export class SpaceReference {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String, maxlength: 100 })
  name: string;

  @Prop({ type: String, maxlength: 500 })
  description?: string;

  @Prop({ required: true, type: Transform })
  transform: Transform;

  @Prop({ required: true, type: Size })
  size: Size;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  color: string;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  borderColor: string;

  @Prop({ required: true, type: Number, min: 0, max: 10 })
  borderWidth: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: [HallReference], default: [] })
  halls: HallReference[];

  @Prop({ type: String, default: () => new Date().toISOString() })
  createdAt: string;

  @Prop({ type: String, default: () => new Date().toISOString() })
  updatedAt: string;
}

@Schema({ _id: false })
export class FixtureReference {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String, maxlength: 100 })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'FixtureType' })
  fixtureType: Types.ObjectId;

  @Prop({ required: true, type: Transform })
  transform: Transform;

  @Prop({ required: true, type: Size })
  size: Size;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  color: string;

  @Prop({ required: true, type: String, match: /^#[0-9A-F]{6}$/i })
  borderColor: string;

  @Prop({ required: true, type: Number, min: 0, max: 10 })
  borderWidth: number;

  @Prop({ required: true, type: Boolean, default: false })
  isLocked: boolean;

  @Prop({ required: true, type: Boolean, default: true })
  isVisible: boolean;

  @Prop({ type: Object, default: {} })
  properties: Record<string, any>;

  @Prop({ type: String, default: () => new Date().toISOString() })
  createdAt: string;

  @Prop({ type: String, default: () => new Date().toISOString() })
  updatedAt: string;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Layout {
  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'Exhibition',
    unique: true,
    index: true,
  })
  exhibitionId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    maxlength: 200,
    default: 'Main Layout',
  })
  name: string;

  @Prop({ required: true, type: CanvasSettings })
  canvas: CanvasSettings;

  @Prop({ type: [SpaceReference], default: [] })
  spaces: SpaceReference[];

  @Prop({ type: [FixtureReference], default: [] })
  fixtures: FixtureReference[];

  @Prop({ required: true, type: LayoutSettings })
  settings: LayoutSettings;

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

  @Prop({
    type: Number,
    default: 1,
    min: 1,
  })
  version: number;

  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;
}

export const LayoutSchema = SchemaFactory.createForClass(Layout);

// Indexes for performance
LayoutSchema.index({ exhibitionId: 1 }, { unique: true });
LayoutSchema.index({ createdBy: 1 });
LayoutSchema.index({ isActive: 1 });
LayoutSchema.index({ updatedAt: -1 }); 
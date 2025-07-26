import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ExhibitionDocument = Exhibition & Document;

// Sub-schemas for complex nested objects
@Schema({ _id: false })
export class Dimensions {
  @Prop({ required: true, min: 10, max: 1000 })
  width: number;

  @Prop({ required: true, min: 10, max: 1000 })
  height: number;
}

@Schema({ _id: false })
export class StallRate {
  @Prop({ type: Types.ObjectId, ref: 'StallType', required: true })
  stallTypeId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  rate: number;
}

@Schema({ _id: false })
export class TaxConfig {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, min: 0, max: 100 })
  rate: number;

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ _id: false })
export class DiscountConfig {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  type: string;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ _id: false })
export class FooterLink {
  @Prop({ required: true, trim: true, maxlength: 100 })
  label: string;

  @Prop({ required: true, trim: true })
  url: string;
}

@Schema({ _id: false })
export class Amenity {
  @Prop({ required: true, enum: ['facility', 'service', 'equipment', 'other'] })
  type: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ required: true, min: 0 })
  rate: number;
}

@Schema({ _id: false })
export class BasicAmenity {
  @Prop({ required: true, enum: ['facility', 'service', 'equipment', 'other'] })
  type: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ required: true, min: 0 })
  perSqm: number;

  @Prop({ required: true, min: 0 })
  quantity: number;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Exhibition {
  // Basic Information
  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  })
  name: string;

  @Prop({
    unique: true,
    lowercase: true,
    trim: true,
    sparse: true,
    index: true,
  })
  slug?: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 2000,
  })
  description: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  venue: string;

  @Prop({
    required: true,
    index: true,
  })
  startDate: Date;

  @Prop({
    required: true,
    index: true,
  })
  endDate: Date;

  @Prop({
    index: true,
  })
  registrationDeadline?: Date;

  @Prop({
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft',
    index: true,
  })
  status: string;

  @Prop({
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  createdBy: Types.ObjectId;

  @Prop({
    trim: true,
    maxlength: 10,
    match: /^[A-Za-z0-9-]*$/,
  })
  invoicePrefix?: string;

  @Prop({ type: Dimensions })
  dimensions?: Dimensions;

  @Prop({ type: [StallRate] })
  stallRates?: StallRate[];

  // Tax and Discount Configuration
  @Prop({ type: [TaxConfig] })
  taxConfig?: TaxConfig[];

  @Prop({ type: [DiscountConfig] })
  discountConfig?: DiscountConfig[];

  @Prop({ type: [DiscountConfig] })
  publicDiscountConfig?: DiscountConfig[];

  @Prop({ trim: true })
  theme?: string;

  // Company Details
  @Prop({ trim: true, maxlength: 200 })
  companyName?: string;

  @Prop({ trim: true, maxlength: 20 })
  companyContactNo?: string;

  @Prop({ trim: true, lowercase: true })
  companyEmail?: string;

  @Prop({ trim: true, maxlength: 500 })
  companyAddress?: string;

  @Prop({ trim: true })
  companyWebsite?: string;

  @Prop({ 
    trim: true, 
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  })
  companyPAN?: string;

  @Prop({ 
    trim: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  })
  companyGST?: string;

  @Prop({ trim: true })
  companySAC?: string;

  @Prop({ trim: true })
  companyCIN?: string;

  @Prop({ trim: true, maxlength: 5000 })
  termsAndConditions?: string;

  @Prop({ trim: true, maxlength: 2000 })
  piInstructions?: string;

  // Bank Details
  @Prop({ trim: true, maxlength: 100 })
  bankName?: string;

  @Prop({ trim: true, maxlength: 100 })
  bankBranch?: string;

  @Prop({ trim: true, maxlength: 11 })
  bankIFSC?: string;

  @Prop({ trim: true, maxlength: 100 })
  bankAccountName?: string;

  @Prop({ trim: true, maxlength: 20 })
  bankAccount?: string;

  // Header Settings
  @Prop({ trim: true, maxlength: 200 })
  headerTitle?: string;

  @Prop({ trim: true, maxlength: 300 })
  headerSubtitle?: string;

  @Prop({ trim: true, maxlength: 1000 })
  headerDescription?: string;

  @Prop({ trim: true })
  headerLogo?: string;

  @Prop({ type: [String] })
  sponsorLogos?: string[];

  // Footer Settings
  @Prop({ trim: true, maxlength: 1000 })
  footerText?: string;

  @Prop({ trim: true })
  footerLogo?: string;

  @Prop({ trim: true, lowercase: true })
  contactEmail?: string;

  @Prop({ trim: true })
  contactPhone?: string;

  @Prop({ type: [FooterLink] })
  footerLinks?: FooterLink[];

  // Amenities
  @Prop({ type: [Amenity] })
  amenities?: Amenity[];

  @Prop({ type: [BasicAmenity] })
  basicAmenities?: BasicAmenity[];

  @Prop({ trim: true, maxlength: 1000 })
  specialRequirements?: string;
}

export const ExhibitionSchema = SchemaFactory.createForClass(Exhibition);

// Indexes for performance
ExhibitionSchema.index({ name: 1 });
ExhibitionSchema.index({ slug: 1 }, { unique: true, sparse: true });
ExhibitionSchema.index({ createdBy: 1, status: 1 });
ExhibitionSchema.index({ startDate: 1, endDate: 1 });
ExhibitionSchema.index({ isActive: 1, status: 1 });
ExhibitionSchema.index({ createdAt: -1 });

// Text search index
ExhibitionSchema.index({
  name: 'text',
  description: 'text',
  venue: 'text',
});

// Generate slug before saving
ExhibitionSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Validate date range
ExhibitionSchema.pre('save', function (next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
}); 
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ _id: false })
export class BookingDiscount {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, enum: ['percentage', 'fixed'] })
  type: string;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ required: true, min: 0 })
  amount: number;
}

@Schema({ _id: false })
export class StallCalculation {
  @Prop({ required: true, type: String })
  stallId: string;

  @Prop({ required: true, trim: true })
  number: string;

  @Prop({ required: true, min: 0 })
  baseAmount: number;

  @Prop({ type: BookingDiscount })
  discount?: BookingDiscount;

  @Prop({ required: true, min: 0 })
  amountAfterDiscount: number;

  @Prop({ 
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      shapeType: { type: String, required: true }
    },
    required: false 
  })
  dimensions?: {
    width: number;
    height: number;
    shapeType: string;
  };
}

@Schema({ _id: false })
export class TaxCalculation {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0, max: 100 })
  rate: number;

  @Prop({ required: true, min: 0 })
  amount: number;
}

@Schema({ _id: false })
export class BookingCalculations {
  @Prop({ type: [StallCalculation], required: true })
  stalls: StallCalculation[];

  @Prop({ required: true, min: 0 })
  totalBaseAmount: number;

  @Prop({ required: true, min: 0 })
  totalDiscountAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmountAfterDiscount: number;

  @Prop({ type: [TaxCalculation], default: [] })
  taxes: TaxCalculation[];

  @Prop({ required: true, min: 0 })
  totalTaxAmount: number;

  @Prop({ required: true, min: 0 })
  totalAmount: number;
}

@Schema({ _id: false })
export class BasicAmenityBooking {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, min: 0 })
  perSqm: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  calculatedQuantity: number;

  @Prop({ trim: true })
  description?: string;
}

@Schema({ _id: false })
export class ExtraAmenityBooking {
  @Prop({ type: Types.ObjectId, required: true })
  id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  type: string;

  @Prop({ required: true, min: 0 })
  rate: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, min: 0 })
  get totalAmount(): number {
    return this.rate * this.quantity;
  }
}

@Schema({ _id: false })
export class PaymentDetails {
  @Prop({ required: true, trim: true })
  method: string;

  @Prop({ trim: true })
  transactionId?: string;

  @Prop({ required: true })
  paidAt: Date;

  @Prop({ trim: true })
  gateway?: string;

  @Prop({ trim: true })
  reference?: string;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'Exhibition',
    required: true,
    index: true,
  })
  exhibitionId: Types.ObjectId;

  @Prop({
    type: [String],
    required: true,
    validate: [arrayMinSize, 'At least one stall must be selected']
  })
  stallIds: string[];

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Exhibitor',
    index: true,
  })
  exhibitorId?: Types.ObjectId;

  // Customer Information
  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  customerName: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true,
  })
  customerEmail: string;

  @Prop({
    required: true,
    trim: true,
    match: /^[\+]?[0-9][\d]{0,15}$/,
  })
  customerPhone: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 500,
  })
  customerAddress: string;

  @Prop({
    trim: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  })
  customerGSTIN?: string;

  @Prop({
    trim: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  })
  customerPAN?: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  companyName: string;

  @Prop({
    required: true,
    min: 0,
    get: (v: number) => Math.round(v * 100) / 100,
  })
  amount: number;

  // Amenities
  @Prop({
    type: [BasicAmenityBooking],
    default: [],
  })
  basicAmenities: BasicAmenityBooking[];

  @Prop({
    type: [ExtraAmenityBooking],
    default: [],
  })
  extraAmenities: ExtraAmenityBooking[];

  // Pricing Calculations
  @Prop({
    type: BookingCalculations,
    required: true,
  })
  calculations: BookingCalculations;

  // Status Management
  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  rejectionReason?: string;

  @Prop({
    type: String,
    enum: ['pending', 'paid', 'refunded', 'partial'],
    default: 'pending',
    index: true,
  })
  paymentStatus: string;

  @Prop({ type: PaymentDetails })
  paymentDetails?: PaymentDetails;

  @Prop({
    type: String,
    enum: ['admin', 'exhibitor', 'public'],
    default: 'public',
    index: true,
  })
  bookingSource: string;

  // Additional Information
  @Prop({
    trim: true,
    maxlength: 1000,
  })
  notes?: string;

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  specialRequirements?: string;

  // Invoice Information
  @Prop({
    trim: true,
    unique: true,
    sparse: true,
  })
  invoiceNumber?: string;

  @Prop()
  invoiceGeneratedAt?: Date;

  // Approval workflow
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  approvedBy?: Types.ObjectId;

  @Prop()
  approvedAt?: Date;

  // Cancellation
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  cancellationReason?: string;
}

// Custom validator for array minimum size
function arrayMinSize(val: any[]) {
  return val && val.length >= 1;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

// Indexes for performance
BookingSchema.index({ exhibitionId: 1, status: 1 });
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ exhibitorId: 1, status: 1 });
BookingSchema.index({ customerEmail: 1 });
BookingSchema.index({ paymentStatus: 1, status: 1 });
BookingSchema.index({ bookingSource: 1, status: 1 });
BookingSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
BookingSchema.index({ createdAt: -1 });

// Compound indexes for complex queries
BookingSchema.index({ 
  exhibitionId: 1, 
  paymentStatus: 1, 
  status: 1 
});

// Text search for customer information
BookingSchema.index({
  customerName: 'text',
  customerEmail: 'text',
  companyName: 'text',
});

// Generate invoice number before saving
BookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    // Generate invoice number based on exhibition prefix and timestamp
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    this.invoiceNumber = `INV-${timestamp}-${random}`;
  }
  next();
});

// Calculate total amount for extra amenities
BookingSchema.virtual('extraAmenitiesTotal').get(function() {
  return this.extraAmenities.reduce((total, amenity) => {
    return total + (amenity.rate * amenity.quantity);
  }, 0);
});

// Virtual for booking reference
BookingSchema.virtual('bookingReference').get(function() {
  return `BK-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Ensure virtuals are included when converting to JSON
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true }); 
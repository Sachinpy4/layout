import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type ExhibitorDocument = Exhibitor & Document;

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc: any, ret: any) => {
      delete ret.password;
      return ret;
    },
  },
})
export class Exhibitor {
  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  })
  companyName: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  contactPerson: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/,
  })
  phone: string;

  @Prop({
    required: true,
    minlength: 6,
    select: false, // Don't include in queries by default
  })
  password: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  address?: string;

  @Prop({
    trim: true,
    maxlength: 100,
  })
  city?: string;

  @Prop({
    trim: true,
    maxlength: 100,
  })
  state?: string;

  @Prop({
    trim: true,
    match: /^[0-9]{6}$/,
  })
  pinCode?: string;

  @Prop({
    trim: true,
    match: /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/,
  })
  website?: string;

  @Prop({
    trim: true,
  })
  logo?: string;

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  description?: string;

  @Prop({
    trim: true,
    uppercase: true,
    match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  })
  panNumber?: string;

  @Prop({
    trim: true,
    uppercase: true,
    match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  })
  gstNumber?: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
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
    type: Boolean,
    default: true,
    index: true,
  })
  isActive: boolean;

  @Prop({
    type: [String],
    default: [],
  })
  businessCategories: string[];

  @Prop({
    type: [String],
    default: [],
  })
  products: string[];

  @Prop({
    type: [String],
    default: [],
  })
  services: string[];

  @Prop({
    type: Number,
    min: 0,
  })
  yearEstablished?: number;

  @Prop({
    type: Number,
    min: 0,
  })
  employeeCount?: number;

  @Prop({
    type: String,
    enum: ['small', 'medium', 'large', 'enterprise'],
  })
  companySize?: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;

  @Prop({
    type: Date,
  })
  approvedAt?: Date;

  @Prop({
    type: Date,
  })
  rejectedAt?: Date;

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Method to update last login
  async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
  }
}

export const ExhibitorSchema = SchemaFactory.createForClass(Exhibitor);

// Note: Password hashing is handled in the service layer to avoid conflicts
// with admin-created accounts and other operations that may pass pre-hashed passwords

// Add the instance methods
ExhibitorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

ExhibitorSchema.methods.updateLastLogin = async function(): Promise<void> {
  this.lastLoginAt = new Date();
  await this.save();
};

// Add indexes for better performance
ExhibitorSchema.index({ email: 1 });
ExhibitorSchema.index({ status: 1 });
ExhibitorSchema.index({ isActive: 1 });
ExhibitorSchema.index({ companyName: 1 });
ExhibitorSchema.index({ contactPerson: 1 });
ExhibitorSchema.index({ createdAt: -1 });
ExhibitorSchema.index({ updatedAt: -1 });

// Text index for search functionality
ExhibitorSchema.index({
  companyName: 'text',
  contactPerson: 'text',
  email: 'text',
  description: 'text',
});

// Compound indexes for common queries
ExhibitorSchema.index({ status: 1, isActive: 1 });
ExhibitorSchema.index({ status: 1, createdAt: -1 });
ExhibitorSchema.index({ isActive: 1, createdAt: -1 }); 
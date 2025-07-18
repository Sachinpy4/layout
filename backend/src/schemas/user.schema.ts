import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

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
export class User {
  @Prop({
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    index: true,
  })
  name: string;

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
    minlength: 6,
    select: false, // Don't include in queries by default
  })
  password: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Role',
    required: true,
    index: true,
  })
  role: Types.ObjectId;

  @Prop({
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/,
  })
  phone?: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
    index: true,
  })
  status: string;

  @Prop({
    trim: true,
    maxlength: 500,
  })
  address?: string;

  @Prop({
    type: String,
    trim: true,
  })
  avatar?: string;

  @Prop({
    type: Date,
    default: null,
  })
  lastLoginAt?: Date;

  @Prop({
    type: [String],
    default: [],
  })
  permissions: string[];

  // Virtual for full name or display name
  get displayName(): string {
    return this.name;
  }

  // Method to compare password
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Method to update last login
  async updateLastLogin(): Promise<void> {
    this.lastLoginAt = new Date();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance methods
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.updateLastLogin = async function (): Promise<void> {
  this.lastLoginAt = new Date();
  await this.save();
}; 
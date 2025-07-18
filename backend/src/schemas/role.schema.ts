import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Role {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    index: true,
  })
  name: string;

  @Prop({
    trim: true,
    maxlength: 200,
  })
  description?: string;

  @Prop({
    type: [String],
    default: [],
    index: true,
  })
  permissions: string[];

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
    max: 100,
  })
  priority: number; // Higher number = higher priority
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// Indexes for performance
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ isActive: 1, priority: -1 });
RoleSchema.index({ permissions: 1 }); 
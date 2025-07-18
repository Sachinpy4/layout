import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  ValidateNested,
  Min,
  Max,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class StallSizeDto {
  @ApiProperty({ description: 'Default width in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Default height in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  height: number;
}

export class CreateStallTypeDto {
  @ApiProperty({ description: 'Stall type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Stall type description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Stall type category', enum: ['standard', 'premium', 'corner', 'island', 'custom'] })
  @IsEnum(['standard', 'premium', 'corner', 'island', 'custom'])
  category: string;

  @ApiProperty({ description: 'Default size for this stall type' })
  @ValidateNested()
  @Type(() => StallSizeDto)
  defaultSize: StallSizeDto;

  @ApiPropertyOptional({ description: 'Default color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Default rate amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  defaultRate: number;

  @ApiPropertyOptional({ description: 'Rate type', enum: ['per_sqm', 'per_stall', 'per_day'] })
  @IsEnum(['per_sqm', 'per_stall', 'per_day'])
  @IsOptional()
  rateType?: string;

  @ApiPropertyOptional({ description: 'Amenities included by default' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedAmenities?: string[];

  @ApiPropertyOptional({ description: 'Amenities available for selection' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableAmenities?: string[];

  @ApiPropertyOptional({ description: 'Minimum booking duration in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumBookingDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum booking duration in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maximumBookingDuration?: number;

  @ApiPropertyOptional({ description: 'Sort order for display', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateStallTypeDto {
  @ApiPropertyOptional({ description: 'Stall type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Stall type description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Stall type category', enum: ['standard', 'premium', 'corner', 'island', 'custom'] })
  @IsEnum(['standard', 'premium', 'corner', 'island', 'custom'])
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Default size for this stall type' })
  @ValidateNested()
  @Type(() => StallSizeDto)
  @IsOptional()
  defaultSize?: StallSizeDto;

  @ApiPropertyOptional({ description: 'Default color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Default rate amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultRate?: number;

  @ApiPropertyOptional({ description: 'Rate type', enum: ['per_sqm', 'per_stall', 'per_day'] })
  @IsEnum(['per_sqm', 'per_stall', 'per_day'])
  @IsOptional()
  rateType?: string;

  @ApiPropertyOptional({ description: 'Amenities included by default' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includedAmenities?: string[];

  @ApiPropertyOptional({ description: 'Amenities available for selection' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  availableAmenities?: string[];

  @ApiPropertyOptional({ description: 'Minimum booking duration in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  minimumBookingDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum booking duration in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maximumBookingDuration?: number;

  @ApiPropertyOptional({ description: 'Is stall type active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class StallTypeResponseDto {
  @ApiProperty({ description: 'Stall type ID' })
  id: string;

  @ApiProperty({ description: 'Stall type name' })
  name: string;

  @ApiPropertyOptional({ description: 'Stall type description' })
  description?: string;

  @ApiProperty({ description: 'Stall type category' })
  category: string;

  @ApiProperty({ description: 'Default size for this stall type' })
  defaultSize: StallSizeDto;

  @ApiProperty({ description: 'Default color in hex format' })
  color: string;

  @ApiProperty({ description: 'Default rate amount' })
  defaultRate: number;

  @ApiProperty({ description: 'Rate type' })
  rateType: string;

  @ApiProperty({ description: 'Amenities included by default' })
  includedAmenities: string[];

  @ApiProperty({ description: 'Amenities available for selection' })
  availableAmenities: string[];

  @ApiProperty({ description: 'Minimum booking duration in days' })
  minimumBookingDuration: number;

  @ApiProperty({ description: 'Maximum booking duration in days' })
  maximumBookingDuration: number;

  @ApiProperty({ description: 'Is stall type active' })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  sortOrder: number;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: string;
} 
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  ValidateNested,
  IsObject,
  Min,
  Max,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class FixtureSizeDto {
  @ApiProperty({ description: 'Default width in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Default height in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  height: number;
}

export class CreateFixtureTypeDto {
  @ApiProperty({ description: 'Fixture type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Fixture type description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Fixture type category', enum: ['infrastructure', 'decoration', 'service', 'security', 'utility'] })
  @IsEnum(['infrastructure', 'decoration', 'service', 'security', 'utility'])
  category: string;

  @ApiProperty({ description: 'Default size for this fixture type' })
  @ValidateNested()
  @Type(() => FixtureSizeDto)
  defaultSize: FixtureSizeDto;

  @ApiPropertyOptional({ description: 'Default color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Icon character or emoji', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Can fixture be moved' })
  @IsBoolean()
  @IsOptional()
  isMovable?: boolean;

  @ApiPropertyOptional({ description: 'Can fixture be resized' })
  @IsBoolean()
  @IsOptional()
  isResizable?: boolean;

  @ApiPropertyOptional({ description: 'Can fixture be rotated' })
  @IsBoolean()
  @IsOptional()
  isRotatable?: boolean;

  @ApiPropertyOptional({ description: 'Required properties for this fixture type' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredProperties?: string[];

  @ApiPropertyOptional({ description: 'Optional properties for this fixture type' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  optionalProperties?: string[];

  @ApiPropertyOptional({ description: 'Default property values' })
  @IsObject()
  @IsOptional()
  defaultProperties?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Cost for this fixture type', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ description: 'Sort order for display', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateFixtureTypeDto {
  @ApiPropertyOptional({ description: 'Fixture type name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Fixture type description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Fixture type category', enum: ['infrastructure', 'decoration', 'service', 'security', 'utility'] })
  @IsEnum(['infrastructure', 'decoration', 'service', 'security', 'utility'])
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Default size for this fixture type' })
  @ValidateNested()
  @Type(() => FixtureSizeDto)
  @IsOptional()
  defaultSize?: FixtureSizeDto;

  @ApiPropertyOptional({ description: 'Default color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Icon character or emoji', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Can fixture be moved' })
  @IsBoolean()
  @IsOptional()
  isMovable?: boolean;

  @ApiPropertyOptional({ description: 'Can fixture be resized' })
  @IsBoolean()
  @IsOptional()
  isResizable?: boolean;

  @ApiPropertyOptional({ description: 'Can fixture be rotated' })
  @IsBoolean()
  @IsOptional()
  isRotatable?: boolean;

  @ApiPropertyOptional({ description: 'Required properties for this fixture type' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredProperties?: string[];

  @ApiPropertyOptional({ description: 'Optional properties for this fixture type' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  optionalProperties?: string[];

  @ApiPropertyOptional({ description: 'Default property values' })
  @IsObject()
  @IsOptional()
  defaultProperties?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Cost for this fixture type', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ description: 'Is fixture type active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class FixtureTypeResponseDto {
  @ApiProperty({ description: 'Fixture type ID' })
  id: string;

  @ApiProperty({ description: 'Fixture type name' })
  name: string;

  @ApiPropertyOptional({ description: 'Fixture type description' })
  description?: string;

  @ApiProperty({ description: 'Fixture type category' })
  category: string;

  @ApiProperty({ description: 'Default size for this fixture type' })
  defaultSize: FixtureSizeDto;

  @ApiProperty({ description: 'Default color in hex format' })
  color: string;

  @ApiPropertyOptional({ description: 'Icon character or emoji' })
  icon?: string;

  @ApiProperty({ description: 'Can fixture be moved' })
  isMovable: boolean;

  @ApiProperty({ description: 'Can fixture be resized' })
  isResizable: boolean;

  @ApiProperty({ description: 'Can fixture be rotated' })
  isRotatable: boolean;

  @ApiProperty({ description: 'Required properties for this fixture type' })
  requiredProperties: string[];

  @ApiProperty({ description: 'Optional properties for this fixture type' })
  optionalProperties: string[];

  @ApiProperty({ description: 'Default property values' })
  defaultProperties: Record<string, any>;

  @ApiProperty({ description: 'Cost for this fixture type' })
  cost: number;

  @ApiProperty({ description: 'Is fixture type active' })
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
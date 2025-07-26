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

// Base DTOs
export class PointDto {
  @ApiProperty({ description: 'X coordinate' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: 'Y coordinate' })
  @IsNumber()
  y: number;
}

export class SizeDto {
  @ApiProperty({ description: 'Width in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Height in pixels', minimum: 1 })
  @IsNumber()
  @Min(1)
  height: number;
}

export class TransformDto {
  @ApiProperty({ description: 'X position' })
  @IsNumber()
  x: number;

  @ApiProperty({ description: 'Y position' })
  @IsNumber()
  y: number;

  @ApiProperty({ description: 'Rotation in degrees', default: 0 })
  @IsNumber()
  @IsOptional()
  rotation?: number;

  @ApiPropertyOptional({ description: 'Scale X factor', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(10)
  scaleX?: number;

  @ApiPropertyOptional({ description: 'Scale Y factor', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0.1)
  @Max(10)
  scaleY?: number;
}

export class ZoomSettingsDto {
  @ApiProperty({ description: 'Minimum zoom level', minimum: 0.1, maximum: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  min: number;

  @ApiProperty({ description: 'Maximum zoom level', minimum: 0.1, maximum: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  max: number;

  @ApiProperty({ description: 'Default zoom level', minimum: 0.1, maximum: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  default: number;

  @ApiProperty({ description: 'Current zoom level', minimum: 0.1, maximum: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  current: number;
}

export class GridSettingsDto {
  @ApiProperty({ description: 'Enable grid display' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Grid size in pixels', minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  size: number;

  @ApiProperty({ description: 'Grid color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  color: string;

  @ApiProperty({ description: 'Grid opacity', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  opacity: number;
}

export class CanvasSettingsDto {
  @ApiProperty({ description: 'Canvas size' })
  @ValidateNested()
  @Type(() => SizeDto)
  size: SizeDto;

  @ApiProperty({ description: 'Canvas background color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  backgroundColor: string;

  @ApiProperty({ description: 'Grid settings' })
  @ValidateNested()
  @Type(() => GridSettingsDto)
  grid: GridSettingsDto;

  @ApiProperty({ description: 'Zoom settings' })
  @ValidateNested()
  @Type(() => ZoomSettingsDto)
  zoom: ZoomSettingsDto;
}

export class LayoutSettingsDto {
  @ApiProperty({ description: 'Enable snap to grid' })
  @IsBoolean()
  snapToGrid: boolean;

  @ApiProperty({ description: 'Show alignment guides' })
  @IsBoolean()
  showGuides: boolean;

  @ApiProperty({ description: 'Enable auto-save' })
  @IsBoolean()
  autoSave: boolean;
}

// Stall DTOs
export class CreateStallDto {
  @ApiPropertyOptional({ description: 'Stall ID (optional for updates)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Stall number' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  number: string;

  @ApiPropertyOptional({ description: 'Stall name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Stall transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  transform: TransformDto;

  @ApiProperty({ description: 'Stall size' })
  @ValidateNested()
  @Type(() => SizeDto)
  size: SizeDto;

  @ApiPropertyOptional({ description: 'Stall type ID' })
  @IsString()
  @IsOptional()
  stallTypeId?: string;

  @ApiPropertyOptional({ description: 'Stall status', enum: ['available', 'reserved', 'booked', 'blocked', 'maintenance'] })
  @IsEnum(['available', 'reserved', 'booked', 'blocked', 'maintenance'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Stall color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock stall position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show stall in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Stall amenities' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}

export class UpdateStallDto {
  @ApiPropertyOptional({ description: 'Stall number' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({ description: 'Stall name' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Stall transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  @IsOptional()
  transform?: TransformDto;

  @ApiPropertyOptional({ description: 'Stall size' })
  @ValidateNested()
  @Type(() => SizeDto)
  @IsOptional()
  size?: SizeDto;

  @ApiPropertyOptional({ description: 'Stall type ID' })
  @IsString()
  @IsOptional()
  stallTypeId?: string;

  @ApiPropertyOptional({ description: 'Stall status', enum: ['available', 'reserved', 'booked', 'blocked', 'maintenance'] })
  @IsEnum(['available', 'reserved', 'booked', 'blocked', 'maintenance'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Stall color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock stall position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show stall in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Stall amenities' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}

// Hall DTOs
export class CreateHallDto {
  @ApiPropertyOptional({ description: 'Hall ID (optional for updates)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Hall name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Hall description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Hall transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  transform: TransformDto;

  @ApiProperty({ description: 'Hall size' })
  @ValidateNested()
  @Type(() => SizeDto)
  size: SizeDto;

  @ApiPropertyOptional({ description: 'Hall color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock hall position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show hall in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Stalls within hall' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStallDto)
  @IsOptional()
  stalls?: CreateStallDto[];
}

export class UpdateHallDto {
  @ApiPropertyOptional({ description: 'Hall name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Hall description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Hall transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  @IsOptional()
  transform?: TransformDto;

  @ApiPropertyOptional({ description: 'Hall size' })
  @ValidateNested()
  @Type(() => SizeDto)
  @IsOptional()
  size?: SizeDto;

  @ApiPropertyOptional({ description: 'Hall color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock hall position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show hall in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

// Space DTOs
export class CreateSpaceDto {
  @ApiPropertyOptional({ description: 'Space ID (optional for updates)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Space name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Space description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Space transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  transform: TransformDto;

  @ApiProperty({ description: 'Space size' })
  @ValidateNested()
  @Type(() => SizeDto)
  size: SizeDto;

  @ApiPropertyOptional({ description: 'Space color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock space position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show space in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Halls within space' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHallDto)
  @IsOptional()
  halls?: CreateHallDto[];
}

export class UpdateSpaceDto {
  @ApiPropertyOptional({ description: 'Space name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Space description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Space transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  @IsOptional()
  transform?: TransformDto;

  @ApiPropertyOptional({ description: 'Space size' })
  @ValidateNested()
  @Type(() => SizeDto)
  @IsOptional()
  size?: SizeDto;

  @ApiPropertyOptional({ description: 'Space color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock space position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show space in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

// Fixture DTOs
export class CreateFixtureDto {
  @ApiPropertyOptional({ description: 'Fixture ID (optional for updates)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Fixture name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Fixture type ID' })
  @IsString()
  @IsOptional()
  fixtureTypeId?: string;

  @ApiProperty({ description: 'Fixture transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  transform: TransformDto;

  @ApiProperty({ description: 'Fixture size' })
  @ValidateNested()
  @Type(() => SizeDto)
  size: SizeDto;

  @ApiPropertyOptional({ description: 'Fixture color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock fixture position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show fixture in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Fixture properties' })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}

export class UpdateFixtureDto {
  @ApiPropertyOptional({ description: 'Fixture name' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Fixture type ID' })
  @IsString()
  @IsOptional()
  fixtureTypeId?: string;

  @ApiPropertyOptional({ description: 'Fixture transform' })
  @ValidateNested()
  @Type(() => TransformDto)
  @IsOptional()
  transform?: TransformDto;

  @ApiPropertyOptional({ description: 'Fixture size' })
  @ValidateNested()
  @Type(() => SizeDto)
  @IsOptional()
  size?: SizeDto;

  @ApiPropertyOptional({ description: 'Fixture color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Border color in hex format' })
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  @IsOptional()
  borderColor?: string;

  @ApiPropertyOptional({ description: 'Border width in pixels', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Lock fixture position' })
  @IsBoolean()
  @IsOptional()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Show fixture in layout' })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Fixture properties' })
  @IsObject()
  @IsOptional()
  properties?: Record<string, any>;
}

// Main Layout DTOs
export class CreateLayoutDto {
  @ApiProperty({ description: 'Exhibition ID' })
  @IsString()
  exhibitionId: string;

  @ApiPropertyOptional({ description: 'Layout name' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Canvas settings' })
  @ValidateNested()
  @Type(() => CanvasSettingsDto)
  canvas: CanvasSettingsDto;

  @ApiPropertyOptional({ description: 'Exhibition spaces' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpaceDto)
  @IsOptional()
  spaces?: CreateSpaceDto[];

  @ApiPropertyOptional({ description: 'Fixtures' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFixtureDto)
  @IsOptional()
  fixtures?: CreateFixtureDto[];

  @ApiPropertyOptional({ description: 'Layout settings' })
  @ValidateNested()
  @Type(() => LayoutSettingsDto)
  @IsOptional()
  settings?: LayoutSettingsDto;
}

export class UpdateLayoutDto {
  @ApiPropertyOptional({ description: 'Layout name' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Canvas settings' })
  @ValidateNested()
  @Type(() => CanvasSettingsDto)
  @IsOptional()
  canvas?: CanvasSettingsDto;

  @ApiPropertyOptional({ description: 'Exhibition spaces' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSpaceDto)
  @IsOptional()
  spaces?: CreateSpaceDto[];

  @ApiPropertyOptional({ description: 'Fixtures' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFixtureDto)
  @IsOptional()
  fixtures?: CreateFixtureDto[];

  @ApiPropertyOptional({ description: 'Layout settings' })
  @ValidateNested()
  @Type(() => LayoutSettingsDto)
  @IsOptional()
  settings?: LayoutSettingsDto;
}

// Bulk operations DTOs
export class BulkCreateStallsDto {
  @ApiProperty({ description: 'Array of stalls to create' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStallDto)
  stalls: CreateStallDto[];
}

export class BulkUpdateStallsDto {
  @ApiProperty({ description: 'Array of stall updates' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStallDto)
  stalls: (UpdateStallDto & { id: string })[];
}

// Response DTOs
export class LayoutResponseDto {
  @ApiProperty({ description: 'Layout ID' })
  id: string;

  @ApiProperty({ description: 'Exhibition ID' })
  exhibitionId: string;

  @ApiProperty({ description: 'Layout name' })
  name: string;

  @ApiProperty({ description: 'Canvas settings' })
  canvas: CanvasSettingsDto;

  @ApiProperty({ description: 'Exhibition spaces' })
  spaces: any[];

  @ApiProperty({ description: 'Fixtures' })
  fixtures: any[];

  @ApiProperty({ description: 'Layout settings' })
  settings: LayoutSettingsDto;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Updated by user ID' })
  updatedBy?: string;

  @ApiProperty({ description: 'Version number' })
  version: number;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: string;
} 
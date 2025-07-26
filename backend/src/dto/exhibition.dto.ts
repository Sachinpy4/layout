import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsBoolean, IsNumber, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class DimensionsDto {
  @ApiProperty({ description: 'Width in meters' })
  @IsNumber()
  width: number;

  @ApiProperty({ description: 'Height in meters' })
  @IsNumber()
  height: number;
}

export class StallRateDto {
  @ApiProperty({ description: 'Stall type ID' })
  @IsString()
  stallTypeId: string;

  @ApiProperty({ description: 'Rate amount' })
  @IsNumber()
  rate: number;
}

export class TaxConfigDto {
  @ApiProperty({ description: 'Tax name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tax rate percentage' })
  @IsNumber()
  rate: number;

  @ApiProperty({ description: 'Is tax active' })
  @IsBoolean()
  isActive: boolean;
}

export class DiscountConfigDto {
  @ApiProperty({ description: 'Discount name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Discount type', enum: ['percentage', 'fixed'] })
  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @ApiProperty({ description: 'Discount value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Is discount active' })
  @IsBoolean()
  isActive: boolean;
}

export class FooterLinkDto {
  @ApiProperty({ description: 'Link label' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Link URL' })
  @IsString()
  url: string;
}

export class AmenityDto {
  @ApiProperty({ description: 'Amenity type', enum: ['facility', 'service', 'equipment', 'other'] })
  @IsEnum(['facility', 'service', 'equipment', 'other'])
  type: 'facility' | 'service' | 'equipment' | 'other';

  @ApiProperty({ description: 'Amenity name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Amenity description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Amenity rate' })
  @IsNumber()
  rate: number;
}

export class BasicAmenityDto {
  @ApiProperty({ description: 'Amenity type', enum: ['facility', 'service', 'equipment', 'other'] })
  @IsEnum(['facility', 'service', 'equipment', 'other'])
  type: 'facility' | 'service' | 'equipment' | 'other';

  @ApiProperty({ description: 'Amenity name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Amenity description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Rate per square meter' })
  @IsNumber()
  perSqm: number;

  @ApiProperty({ description: 'Quantity included' })
  @IsNumber()
  quantity: number;
}

export class CreateExhibitionDto {
  @ApiProperty({ description: 'Exhibition name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Exhibition description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Exhibition venue' })
  @IsString()
  venue: string;

  @ApiProperty({ description: 'Start date' })
  @IsString()
  startDate: string;

  @ApiProperty({ description: 'End date' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Registration deadline' })
  @IsOptional()
  @IsString()
  registrationDeadline?: string;

  @ApiPropertyOptional({ description: 'Exhibition status', enum: ['draft', 'published', 'completed'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'completed'])
  status?: 'draft' | 'published' | 'completed';

  @ApiPropertyOptional({ description: 'Is exhibition active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Invoice prefix' })
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional({ description: 'Exhibition slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Layout dimensions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({ description: 'Stall rates configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StallRateDto)
  stallRates?: StallRateDto[];

  @ApiPropertyOptional({ description: 'Tax configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxConfigDto)
  taxConfig?: TaxConfigDto[];

  @ApiPropertyOptional({ description: 'Discount configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountConfigDto)
  discountConfig?: DiscountConfigDto[];

  @ApiPropertyOptional({ description: 'Public discount configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountConfigDto)
  publicDiscountConfig?: DiscountConfigDto[];

  @ApiPropertyOptional({ description: 'Exhibition theme' })
  @IsOptional()
  @IsString()
  theme?: string;

  // Company Details
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Company contact number' })
  @IsOptional()
  @IsString()
  companyContactNo?: string;

  @ApiPropertyOptional({ description: 'Company email' })
  @IsOptional()
  @IsString()
  companyEmail?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional({ description: 'Company PAN' })
  @IsOptional()
  @IsString()
  companyPAN?: string;

  @ApiPropertyOptional({ description: 'Company GST' })
  @IsOptional()
  @IsString()
  companyGST?: string;

  @ApiPropertyOptional({ description: 'Company SAC' })
  @IsOptional()
  @IsString()
  companySAC?: string;

  @ApiPropertyOptional({ description: 'Company CIN' })
  @IsOptional()
  @IsString()
  companyCIN?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Payment instructions' })
  @IsOptional()
  @IsString()
  piInstructions?: string;

  // Bank Details
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank branch' })
  @IsOptional()
  @IsString()
  bankBranch?: string;

  @ApiPropertyOptional({ description: 'Bank IFSC code' })
  @IsOptional()
  @IsString()
  bankIFSC?: string;

  @ApiPropertyOptional({ description: 'Bank account name' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  // Header settings
  @ApiPropertyOptional({ description: 'Header title' })
  @IsOptional()
  @IsString()
  headerTitle?: string;

  @ApiPropertyOptional({ description: 'Header subtitle' })
  @IsOptional()
  @IsString()
  headerSubtitle?: string;

  @ApiPropertyOptional({ description: 'Header description' })
  @IsOptional()
  @IsString()
  headerDescription?: string;

  @ApiPropertyOptional({ description: 'Header logo URL' })
  @IsOptional()
  @IsString()
  headerLogo?: string;

  @ApiPropertyOptional({ description: 'Sponsor logos URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sponsorLogos?: string[];

  // Footer settings
  @ApiPropertyOptional({ description: 'Footer text' })
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiPropertyOptional({ description: 'Footer logo URL' })
  @IsOptional()
  @IsString()
  footerLogo?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Footer links' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  footerLinks?: FooterLinkDto[];

  // Amenities settings
  @ApiPropertyOptional({ description: 'Available amenities' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities?: AmenityDto[];

  @ApiPropertyOptional({ description: 'Basic amenities included' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasicAmenityDto)
  basicAmenities?: BasicAmenityDto[];

  @ApiPropertyOptional({ description: 'Special requirements' })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class UpdateExhibitionDto {
  @ApiPropertyOptional({ description: 'Exhibition name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Exhibition description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Exhibition venue' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Registration deadline' })
  @IsOptional()
  @IsString()
  registrationDeadline?: string;

  @ApiPropertyOptional({ description: 'Exhibition status', enum: ['draft', 'published', 'completed'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'completed'])
  status?: 'draft' | 'published' | 'completed';

  @ApiPropertyOptional({ description: 'Is exhibition active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Invoice prefix' })
  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @ApiPropertyOptional({ description: 'Exhibition slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Layout dimensions' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({ description: 'Stall rates configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StallRateDto)
  stallRates?: StallRateDto[];

  @ApiPropertyOptional({ description: 'Tax configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxConfigDto)
  taxConfig?: TaxConfigDto[];

  @ApiPropertyOptional({ description: 'Discount configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountConfigDto)
  discountConfig?: DiscountConfigDto[];

  @ApiPropertyOptional({ description: 'Public discount configuration' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiscountConfigDto)
  publicDiscountConfig?: DiscountConfigDto[];

  @ApiPropertyOptional({ description: 'Exhibition theme' })
  @IsOptional()
  @IsString()
  theme?: string;

  // Company Details - ALL MISSING FIELDS ADDED
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ description: 'Company contact number' })
  @IsOptional()
  @IsString()
  companyContactNo?: string;

  @ApiPropertyOptional({ description: 'Company email' })
  @IsOptional()
  @IsString()
  companyEmail?: string;

  @ApiPropertyOptional({ description: 'Company address' })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @ApiPropertyOptional({ description: 'Company website' })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiPropertyOptional({ description: 'Company PAN' })
  @IsOptional()
  @IsString()
  companyPAN?: string;

  @ApiPropertyOptional({ description: 'Company GST' })
  @IsOptional()
  @IsString()
  companyGST?: string;

  @ApiPropertyOptional({ description: 'Company SAC' })
  @IsOptional()
  @IsString()
  companySAC?: string;

  @ApiPropertyOptional({ description: 'Company CIN' })
  @IsOptional()
  @IsString()
  companyCIN?: string;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Payment instructions' })
  @IsOptional()
  @IsString()
  piInstructions?: string;

  // Bank Details - ALL MISSING FIELDS ADDED
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: 'Bank branch' })
  @IsOptional()
  @IsString()
  bankBranch?: string;

  @ApiPropertyOptional({ description: 'Bank IFSC code' })
  @IsOptional()
  @IsString()
  bankIFSC?: string;

  @ApiPropertyOptional({ description: 'Bank account name' })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @ApiPropertyOptional({ description: 'Bank account number' })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  // Header settings - ALL MISSING FIELDS ADDED
  @ApiPropertyOptional({ description: 'Header title' })
  @IsOptional()
  @IsString()
  headerTitle?: string;

  @ApiPropertyOptional({ description: 'Header subtitle' })
  @IsOptional()
  @IsString()
  headerSubtitle?: string;

  @ApiPropertyOptional({ description: 'Header description' })
  @IsOptional()
  @IsString()
  headerDescription?: string;

  @ApiPropertyOptional({ description: 'Header logo URL' })
  @IsOptional()
  @IsString()
  headerLogo?: string;

  @ApiPropertyOptional({ description: 'Sponsor logos URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sponsorLogos?: string[];

  // Footer settings - ALL MISSING FIELDS ADDED
  @ApiPropertyOptional({ description: 'Footer text' })
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiPropertyOptional({ description: 'Footer logo URL' })
  @IsOptional()
  @IsString()
  footerLogo?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Footer links' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FooterLinkDto)
  footerLinks?: FooterLinkDto[];

  // Amenities settings
  @ApiPropertyOptional({ description: 'Available amenities' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AmenityDto)
  amenities?: AmenityDto[];

  @ApiPropertyOptional({ description: 'Basic amenities included' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasicAmenityDto)
  basicAmenities?: BasicAmenityDto[];

  @ApiPropertyOptional({ description: 'Special requirements' })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

export class ExhibitionResponseDto {
  @ApiProperty({ description: 'Exhibition ID' })
  id: string;

  @ApiProperty({ description: 'Exhibition name' })
  name: string;

  @ApiProperty({ description: 'Exhibition description' })
  description: string;

  @ApiProperty({ description: 'Exhibition venue' })
  venue: string;

  @ApiProperty({ description: 'Start date' })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  endDate: string;

  @ApiProperty({ description: 'Exhibition status' })
  status: string;

  @ApiProperty({ description: 'Is exhibition active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: string;
} 
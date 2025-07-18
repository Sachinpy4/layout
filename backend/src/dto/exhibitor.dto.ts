import { IsString, IsEmail, IsPhoneNumber, IsOptional, IsBoolean, IsEnum, IsArray, IsNumber, IsUrl, Length, Matches, IsNotEmpty, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExhibitorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum CompanySize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise'
}

export class CreateExhibitorDto {
  @ApiProperty({ description: 'Company name', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  companyName: string;

  @ApiProperty({ description: 'Contact person name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  contactPerson: string;

  @ApiProperty({ description: 'Email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\+]?[1-9][\d]{9,15}$/, { message: 'Please enter a valid phone number' })
  phone: string;

  @ApiPropertyOptional({ description: 'Password', minLength: 6 })
  @IsOptional()
  @IsString()
  @Length(6, 100)
  password?: string;

  @ApiPropertyOptional({ description: 'Company address', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @ApiPropertyOptional({ description: 'PIN code', pattern: '^[0-9]{6}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Please enter a valid 6-digit PIN code' })
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Company description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'PAN number', pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Please enter a valid PAN number (e.g., ABCDE1234F)' })
  panNumber?: string;

  @ApiPropertyOptional({ description: 'GST number', pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Please enter a valid GST number' })
  gstNumber?: string;

  @ApiPropertyOptional({ description: 'Business categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessCategories?: string[];

  @ApiPropertyOptional({ description: 'Products offered' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @ApiPropertyOptional({ description: 'Services offered' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Year established', minimum: 1800 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  yearEstablished?: number;

  @ApiPropertyOptional({ description: 'Employee count', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Company size', enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateExhibitorDto {
  @ApiPropertyOptional({ description: 'Company name', maxLength: 200 })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  companyName?: string;

  @ApiPropertyOptional({ description: 'Contact person name', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Email address', format: 'email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Company address', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;

  @ApiPropertyOptional({ description: 'City', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', maxLength: 100 })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  state?: string;

  @ApiPropertyOptional({ description: 'PIN code', pattern: '^[0-9]{6}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: 'Please enter a valid 6-digit PIN code' })
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: 'Company description', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @ApiPropertyOptional({ description: 'PAN number', pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: 'Please enter a valid PAN number' })
  panNumber?: string;

  @ApiPropertyOptional({ description: 'GST number', pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Please enter a valid GST number' })
  gstNumber?: string;

  @ApiPropertyOptional({ description: 'Business categories', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessCategories?: string[];

  @ApiPropertyOptional({ description: 'Products offered', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @ApiPropertyOptional({ description: 'Services offered', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({ description: 'Year established', minimum: 1800, maximum: 2024 })
  @IsOptional()
  @IsNumber()
  yearEstablished?: number;

  @ApiPropertyOptional({ description: 'Employee count', minimum: 0 })
  @IsOptional()
  @IsNumber()
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Company size', enum: CompanySize })
  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;

  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateExhibitorStatusDto {
  @ApiProperty({ description: 'New status', enum: ExhibitorStatus })
  @IsEnum(ExhibitorStatus)
  @IsNotEmpty()
  status: ExhibitorStatus;

  @ApiPropertyOptional({ description: 'Rejection reason (required when status is rejected)', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  rejectionReason?: string;
}

export class ExhibitorQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ExhibitorStatus })
  @IsOptional()
  @IsEnum(ExhibitorStatus)
  status?: ExhibitorStatus;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Search in company name, contact person, or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['createdAt', 'companyName', 'status', 'contactPerson', 'updatedAt'] })
  @IsOptional()
  @IsIn(['createdAt', 'companyName', 'status', 'contactPerson', 'updatedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ExhibitorLoginDto {
  @ApiProperty({ description: 'Email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;
}

export class ExhibitorFlexibleLoginDto {
  @ApiProperty({ 
    description: 'Email address or phone number',
    example: 'contact@company.com or 9876543210'
  })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;
}

export class ExhibitorRegisterDto {
  @ApiProperty({ description: 'Company name', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  companyName: string;

  @ApiProperty({ description: 'Contact person name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  contactPerson: string;

  @ApiProperty({ description: 'Email address', format: 'email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Please enter a valid phone number' })
  phone: string;

  @ApiProperty({ description: 'Password', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @ApiPropertyOptional({ description: 'Company address', maxLength: 500 })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  address?: string;
}

export class ExhibitorResponseDto {
  @ApiProperty({ description: 'Exhibitor ID' })
  id: string;

  @ApiProperty({ description: 'Company name' })
  companyName: string;

  @ApiProperty({ description: 'Contact person name' })
  contactPerson: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  phone: string;

  @ApiPropertyOptional({ description: 'Company address' })
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  state?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  pinCode?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  website?: string;

  @ApiPropertyOptional({ description: 'Company logo URL' })
  logo?: string;

  @ApiPropertyOptional({ description: 'Company description' })
  description?: string;

  @ApiPropertyOptional({ description: 'PAN number' })
  panNumber?: string;

  @ApiPropertyOptional({ description: 'GST number' })
  gstNumber?: string;

  @ApiProperty({ description: 'Status', enum: ExhibitorStatus })
  status: ExhibitorStatus;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejectionReason?: string;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Business categories' })
  businessCategories?: string[];

  @ApiPropertyOptional({ description: 'Products offered' })
  products?: string[];

  @ApiPropertyOptional({ description: 'Services offered' })
  services?: string[];

  @ApiPropertyOptional({ description: 'Year established' })
  yearEstablished?: number;

  @ApiPropertyOptional({ description: 'Employee count' })
  employeeCount?: number;

  @ApiPropertyOptional({ description: 'Company size' })
  companySize?: CompanySize;

  @ApiPropertyOptional({ description: 'Last login date' })
  lastLoginAt?: Date;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'Rejection date' })
  rejectedAt?: Date;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class ExhibitorListResponseDto {
  @ApiProperty({ description: 'List of exhibitors', type: [ExhibitorResponseDto] })
  data: ExhibitorResponseDto[];

  @ApiProperty({ description: 'Total number of exhibitors' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}

export class ExhibitorStatsDto {
  @ApiProperty({ description: 'Total exhibitors' })
  total: number;

  @ApiProperty({ description: 'Pending exhibitors' })
  pending: number;

  @ApiProperty({ description: 'Approved exhibitors' })
  approved: number;

  @ApiProperty({ description: 'Rejected exhibitors' })
  rejected: number;

  @ApiProperty({ description: 'Suspended exhibitors' })
  suspended: number;

  @ApiProperty({ description: 'Active exhibitors' })
  active: number;

  @ApiProperty({ description: 'Inactive exhibitors' })
  inactive: number;
} 
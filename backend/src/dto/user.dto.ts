import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsEnum,
  IsMongoId,
  IsPhoneNumber,
  IsArray,
  IsBoolean,
  Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'john.doe@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Password (minimum 6 characters)',
    example: 'SecurePassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ 
    description: 'Role ID (MongoDB ObjectId)',
    example: '60f1b2b3c4d5e6f7a8b9c0d1'
  })
  @IsMongoId({ message: 'Invalid role ID format' })
  role: string;

  @ApiPropertyOptional({ 
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'User status',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'User address',
    example: '123 Main St, City, Country',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ 
    description: 'User permissions',
    example: ['read:users', 'write:exhibitions']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateUserDto {
  @ApiPropertyOptional({ 
    description: 'Full name of the user',
    example: 'John Doe Updated',
    minLength: 3,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Email address',
    example: 'john.updated@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Role ID (MongoDB ObjectId)',
    example: '60f1b2b3c4d5e6f7a8b9c0d2'
  })
  @IsOptional()
  @IsMongoId({ message: 'Invalid role ID format' })
  role?: string;

  @ApiPropertyOptional({ 
    description: 'Phone number',
    example: '+1234567890'
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'User status',
    enum: ['active', 'inactive', 'suspended']
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'User address',
    example: '123 Updated St, City, Country',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Avatar URL',
    example: 'https://example.com/new-avatar.jpg'
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ 
    description: 'User permissions',
    example: ['read:users', 'write:exhibitions', 'admin:all']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'CurrentPassword123'
  })
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: string;

  @ApiProperty({ description: 'Full name' })
  name: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'Role information' })
  role: {
    id: string;
    name: string;
    permissions: string[];
  };

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiProperty({ description: 'User status' })
  status: string;

  @ApiPropertyOptional({ description: 'Address' })
  address?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatar?: string;

  @ApiProperty({ description: 'User permissions' })
  permissions: string[];

  @ApiPropertyOptional({ description: 'Last login timestamp' })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class UserQueryDto {
  @ApiPropertyOptional({ 
    description: 'Search term for name or email',
    example: 'john'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by status',
    enum: ['active', 'inactive', 'suspended']
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'])
  status?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by role ID',
    example: '60f1b2b3c4d5e6f7a8b9c0d1'
  })
  @IsOptional()
  @IsMongoId()
  role?: string;

  @ApiPropertyOptional({ 
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Sort field',
    example: 'createdAt'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc'
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
} 
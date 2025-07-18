import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, MaxLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email address',
    example: 'admin@example.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Password',
    example: 'password123'
  })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'Full name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'john.doe@example.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Password (minimum 6 characters)',
    example: 'SecurePassword123'
  })
  password: string;

  @ApiPropertyOptional({ 
    description: 'Phone number',
    example: '+1234567890'
  })
  phone?: string;
}

export class ExhibitorRegisterDto {
  @ApiProperty({ 
    description: 'Company name',
    example: 'ABC Technologies Ltd.'
  })
  companyName: string;

  @ApiProperty({ 
    description: 'Contact person name',
    example: 'John Smith'
  })
  contactPerson: string;

  @ApiProperty({ 
    description: 'Email address',
    example: 'contact@abctech.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Phone number',
    example: '+1234567890'
  })
  phone: string;

  @ApiProperty({ 
    description: 'Password (minimum 6 characters)',
    example: 'SecurePassword123'
  })
  password: string;

  @ApiPropertyOptional({ 
    description: 'Company address',
    example: '123 Business Park, Tech City'
  })
  address?: string;

  @ApiPropertyOptional({ 
    description: 'Company website',
    example: 'https://www.abctech.com'
  })
  website?: string;

  @ApiPropertyOptional({ 
    description: 'Company description',
    example: 'Leading technology solutions provider'
  })
  description?: string;
}

export class ExhibitorLoginDto {
  @ApiProperty({ 
    description: 'Email address',
    example: 'contact@abctech.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ 
    description: 'Password',
    example: 'password123'
  })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    description: 'Email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    description: 'Reset token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @MinLength(1, { message: 'Reset token is required' })
  token: string;

  @ApiProperty({ 
    description: 'New password (minimum 6 characters)',
    example: 'NewSecurePassword123',
    minLength: 6
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;
}

// Response DTOs
export class AuthResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'User information' })
  user: {
    id: string;
    name: string;
    email: string;
    role: {
      id: string;
      name: string;
      permissions: string[];
    };
  };
}

export class ExhibitorAuthResponseDto {
  @ApiProperty({ description: 'Access token' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token' })
  refreshToken: string;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expiresIn: number;

  @ApiProperty({ description: 'Exhibitor information' })
  exhibitor: {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    status: string;
  };
}

export class TokenPayloadDto {
  @ApiProperty({ description: 'User ID' })
  sub: string;

  @ApiProperty({ description: 'Email address' })
  email: string;

  @ApiProperty({ description: 'User role' })
  role: string;

  @ApiProperty({ description: 'User type', enum: ['user', 'exhibitor'] })
  @IsEnum(['user', 'exhibitor'])
  type: 'user' | 'exhibitor';

  @ApiProperty({ description: 'Token issued at timestamp' })
  iat: number;

  @ApiProperty({ description: 'Token expiration timestamp' })
  exp: number;
} 
import { IsString, IsBoolean, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSystemSettingsDto {
  @ApiProperty({ description: 'Site name' })
  @IsString()
  @MaxLength(100)
  siteName: string;

  @ApiPropertyOptional({ description: 'Header logo file path' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  headerLogo?: string;

  @ApiProperty({ description: 'Default currency', enum: ['USD', 'EUR', 'GBP', 'JPY', 'INR'] })
  @IsEnum(['USD', 'EUR', 'GBP', 'JPY', 'INR'])
  defaultCurrency: string;

  @ApiProperty({ description: 'Date format', enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] })
  @IsEnum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'])
  dateFormat: string;

  @ApiProperty({ description: 'Maintenance mode enabled' })
  @IsBoolean()
  maintenanceMode: boolean;

  @ApiProperty({ description: 'User registration enabled' })
  @IsBoolean()
  registrationEnabled: boolean;

  @ApiPropertyOptional({ description: 'Email notifications enabled' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'New booking alerts enabled' })
  @IsOptional()
  @IsBoolean()
  newBookingAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Payment notifications enabled' })
  @IsOptional()
  @IsBoolean()
  paymentNotifications?: boolean;

  @ApiPropertyOptional({ description: 'System alerts enabled' })
  @IsOptional()
  @IsBoolean()
  systemAlerts?: boolean;
} 
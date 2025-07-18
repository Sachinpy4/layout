import { Type, Transform } from 'class-transformer';
import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsNumber, 
  IsObject, 
  ValidateNested, 
  ArrayMinSize,
  Min,
  Max,
  Matches,
  IsBoolean,
  IsMongoId
} from 'class-validator';
import { Types } from 'mongoose';

export class BookingDiscountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['percentage', 'fixed'])
  type: 'percentage' | 'fixed';

  @IsNumber()
  @Min(0)
  value: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class StallCalculationDto {
  @IsString()
  stallId: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsNumber()
  @Min(0)
  baseAmount: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BookingDiscountDto)
  discount?: BookingDiscountDto;

  @IsNumber()
  @Min(0)
  amountAfterDiscount: number;

  @IsOptional()
  dimensions?: {
    width: number;
    height: number;
    shapeType: string;
  };
}

export class TaxCalculationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsNumber()
  @Min(0)
  amount: number;
}

export class BookingCalculationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StallCalculationDto)
  @ArrayMinSize(1)
  stalls: StallCalculationDto[];

  @IsNumber()
  @Min(0)
  totalBaseAmount: number;

  @IsNumber()
  @Min(0)
  totalDiscountAmount: number;

  @IsNumber()
  @Min(0)
  totalAmountAfterDiscount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaxCalculationDto)
  taxes: TaxCalculationDto[];

  @IsNumber()
  @Min(0)
  totalTaxAmount: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;
}

export class BasicAmenityBookingDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['facility', 'service', 'equipment', 'other', 'furniture'])
  type: string;

  @IsNumber()
  @Min(0)
  perSqm: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  calculatedQuantity: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ExtraAmenityBookingDto {
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['facility', 'service', 'equipment', 'other', 'furniture'])
  type: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class PaymentDetailsDto {
  @IsString()
  @IsNotEmpty()
  method: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  gateway?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}

export class CreateBookingDto {
  @IsMongoId()
  exhibitionId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one stall must be selected' })
  @IsString({ each: true })
  stallIds: string[];

  @IsOptional()
  @IsMongoId()
  exhibitorId?: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[\+]?[1-9][\d]{0,15}$/, { message: 'Invalid phone number format' })
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  customerAddress: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { 
    message: 'Invalid GSTIN format' 
  })
  customerGSTIN?: string;

  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { 
    message: 'Invalid PAN format' 
  })
  customerPAN?: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BasicAmenityBookingDto)
  basicAmenities?: BasicAmenityBookingDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraAmenityBookingDto)
  extraAmenities?: ExtraAmenityBookingDto[];

  @ValidateNested()
  @Type(() => BookingCalculationsDto)
  calculations: BookingCalculationsDto;

  @IsOptional()
  @IsEnum(['admin', 'exhibitor', 'public'])
  bookingSource?: 'admin' | 'exhibitor' | 'public';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialRequirements?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => BookingDiscountDto)
  selectedDiscount?: BookingDiscountDto;
}

export class UpdateBookingStatusDto {
  @IsEnum(['pending', 'confirmed', 'cancelled', 'approved', 'rejected'])
  status: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(['pending', 'paid', 'refunded', 'partial'])
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partial';

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails?: PaymentDetailsDto;
}

export class BookingQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'cancelled', 'approved', 'rejected'])
  status?: 'pending' | 'confirmed' | 'cancelled' | 'approved' | 'rejected';

  @IsOptional()
  @IsEnum(['pending', 'paid', 'refunded', 'partial'])
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'partial';

  @IsOptional()
  @IsMongoId()
  exhibitionId?: string;

  @IsOptional()
  @IsMongoId()
  exhibitorId?: string;

  @IsOptional()
  @IsEnum(['admin', 'exhibitor', 'public'])
  bookingSource?: 'admin' | 'exhibitor' | 'public';

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'amount', 'customerName'])
  sortBy?: 'createdAt' | 'amount' | 'customerName';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class BookingStatsDto {
  @IsOptional()
  @IsMongoId()
  exhibitionId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

// Response DTOs
export class BookingResponseDto {
  id: string;
  exhibitionId: string;
  stallIds: string[];
  userId: string;
  exhibitorId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerGSTIN?: string;
  customerPAN?: string;
  companyName: string;
  amount: number;
  basicAmenities: BasicAmenityBookingDto[];
  extraAmenities: ExtraAmenityBookingDto[];
  calculations: BookingCalculationsDto;
  status: string;
  rejectionReason?: string;
  paymentStatus: string;
  paymentDetails?: PaymentDetailsDto;
  bookingSource: string;
  notes?: string;
  specialRequirements?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  cancelledBy?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingStatsResponseDto {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  approved: number;
  rejected: number;
  totalAmount: number;
  totalStalls: number;
  averageBookingValue: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
  bySource: Record<string, number>;
  recentBookings: BookingResponseDto[];
} 
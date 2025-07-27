import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
    Delete,
  Query,
  UseGuards,
  Request,
  Patch,
  HttpCode,
  HttpStatus,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards';
import { 
  CreateBookingDto, 
  UpdateBookingStatusDto, 
  UpdatePaymentStatusDto,
  BookingQueryDto,
  BookingStatsDto,
  BookingResponseDto,
  BookingStatsResponseDto
} from '../../dto/booking.dto';
import { SuccessResponse } from '../../dto/common.dto';
import { InvoiceService } from './invoice.service';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly invoiceService: InvoiceService
  ) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new booking',
    description: 'Create a new stall booking with calculations and amenities'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Booking created successfully',
    type: BookingResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation errors' })
  @ApiResponse({ status: 404, description: 'Exhibition or stalls not found' })
  @ApiResponse({ status: 403, description: 'Exhibition not available for booking' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: any
  ): Promise<SuccessResponse<BookingResponseDto>> {
    const booking = await this.bookingsService.create(createBookingDto, req.user.id);
    
    return {
      success: true,
      message: 'Booking created successfully',
      data: booking.toObject() as BookingResponseDto
    };
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all bookings',
    description: 'Retrieve all bookings with filtering, pagination, and search'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'cancelled', 'approved', 'rejected'] })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['pending', 'paid', 'refunded', 'partial'] })
  @ApiQuery({ name: 'exhibitionId', required: false, type: String, description: 'Filter by exhibition' })
  @ApiQuery({ name: 'exhibitorId', required: false, type: String, description: 'Filter by exhibitor' })
  @ApiQuery({ name: 'bookingSource', required: false, enum: ['admin', 'exhibitor', 'public'] })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO string)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'amount', 'customerName'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'Bookings retrieved successfully' 
  })
  async findAll(
    @Query() query: BookingQueryDto
  ): Promise<SuccessResponse<{
    bookings: BookingResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const result = await this.bookingsService.findAll(query);
    
    return {
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings: result.bookings as unknown as BookingResponseDto[],
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    };
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get booking statistics',
    description: 'Retrieve comprehensive booking statistics and analytics'
  })
  @ApiQuery({ name: 'exhibitionId', required: false, type: String, description: 'Filter by exhibition' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter' })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully',
    type: BookingStatsResponseDto
  })
  async getStats(
    @Query() query: BookingStatsDto
  ): Promise<SuccessResponse<BookingStatsResponseDto>> {
    const stats = await this.bookingsService.getStats(query);
    
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    };
  }

  @Get('exhibition/:exhibitionId')
  @ApiOperation({ 
    summary: 'Get bookings by exhibition',
    description: 'Retrieve all bookings for a specific exhibition'
  })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 200, description: 'Exhibition bookings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async findByExhibition(
    @Param('exhibitionId') exhibitionId: string,
    @Query() query: BookingQueryDto
  ): Promise<SuccessResponse<{
    bookings: BookingResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const result = await this.bookingsService.findByExhibitionId(exhibitionId, query);
    
    return {
      success: true,
      message: 'Exhibition bookings retrieved successfully',
      data: {
        bookings: result.bookings as unknown as BookingResponseDto[],
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    };
  }

  @Get('exhibitor/:exhibitorId')
  @ApiOperation({ 
    summary: 'Get bookings by exhibitor',
    description: 'Retrieve all bookings for a specific exhibitor'
  })
  @ApiParam({ name: 'exhibitorId', description: 'Exhibitor ID' })
  @ApiResponse({ status: 200, description: 'Exhibitor bookings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Exhibitor not found' })
  async findByExhibitor(
    @Param('exhibitorId') exhibitorId: string,
    @Query() query: BookingQueryDto
  ): Promise<SuccessResponse<{
    bookings: BookingResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    const result = await this.bookingsService.findByExhibitorId(exhibitorId, query);
    
    return {
      success: true,
      message: 'Exhibitor bookings retrieved successfully',
      data: {
        bookings: result.bookings as unknown as BookingResponseDto[],
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    };
  }

  @Get('me')
  @ApiOperation({ 
    summary: 'Get my bookings',
    description: 'Retrieve all bookings for the current authenticated user'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'confirmed', 'cancelled', 'approved', 'rejected'] })
  @ApiQuery({ name: 'paymentStatus', required: false, enum: ['pending', 'paid', 'refunded', 'partial'] })
  @ApiQuery({ name: 'exhibitionId', required: false, type: String, description: 'Filter by exhibition' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'amount', 'customerName'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ 
    status: 200, 
    description: 'My bookings retrieved successfully' 
  })
  async getMyBookings(
    @Query() query: BookingQueryDto,
    @Request() req: any
  ): Promise<SuccessResponse<{
    bookings: BookingResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>> {
    if (!req.user || !req.user.sub) {
      throw new Error('User not authenticated');
    }
    
    const result = await this.bookingsService.findByUserId(req.user.sub, query);
    
    return {
      success: true,
      message: 'My bookings retrieved successfully',
      data: {
        bookings: result.bookings as unknown as BookingResponseDto[],
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    };
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get booking by ID',
    description: 'Retrieve detailed information about a specific booking'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Booking retrieved successfully',
    type: BookingResponseDto
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid booking ID' })
  async findOne(
    @Param('id') id: string
  ): Promise<SuccessResponse<BookingResponseDto>> {
    const booking = await this.bookingsService.findOne(id);
    
    return {
      success: true,
      message: 'Booking retrieved successfully',
      data: booking as unknown as BookingResponseDto
    };
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Update booking status',
    description: 'Update the status of a booking (approve, reject, confirm, cancel)'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Booking status updated successfully',
    type: BookingResponseDto
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @Request() req: any
  ): Promise<SuccessResponse<BookingResponseDto>> {
    const userId = req.user?.id || req.user?._id || null;
    
    const booking = await this.bookingsService.updateStatus(
      id, 
      updateStatusDto, 
      userId
    );
    
    return {
      success: true,
      message: 'Booking status updated successfully',
      data: booking.toObject() as BookingResponseDto
    };
  }

  @Patch(':id/payment')
  @ApiOperation({ 
    summary: 'Update payment status',
    description: 'Update the payment status and details of a booking'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment status updated successfully',
    type: BookingResponseDto
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentStatusDto
  ): Promise<SuccessResponse<BookingResponseDto>> {
    const booking = await this.bookingsService.updatePaymentStatus(id, updatePaymentDto);
    
    return {
      success: true,
      message: 'Payment status updated successfully',
      data: booking.toObject() as BookingResponseDto
    };
  }

  @Get(':id/invoice')
  @ApiOperation({ 
    summary: 'Download booking invoice',
    description: 'Generate and download PDF invoice for a booking'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoice PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invoice generation failed' })
  async downloadInvoice(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      // Get booking details to set filename
      const booking = await this.bookingsService.findOne(id);
      
      // Generate PDF
      const pdfBuffer = await this.invoiceService.generateInvoicePDF(id);
      
      // Set response headers
      const filename = `invoice-${booking.invoiceNumber || id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      throw error; // Let NestJS handle the error formatting
    }
  }

  @Get(':id/invoice/preview')
  @ApiOperation({ 
    summary: 'Preview booking invoice',
    description: 'Preview PDF invoice for a booking in browser'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Invoice PDF preview generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiResponse({ status: 400, description: 'Invoice generation failed' })
  async previewInvoice(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      // Get booking details to set filename
      const booking = await this.bookingsService.findOne(id);
      
      // Generate PDF
      const pdfBuffer = await this.invoiceService.generateInvoicePDF(id);
      
      // Set response headers for inline viewing
      const filename = `invoice-${booking.invoiceNumber || id}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      throw error; // Let NestJS handle the error formatting
    }
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete booking',
    description: 'Delete a booking regardless of its status'
  })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string
  ): Promise<SuccessResponse<null>> {
    await this.bookingsService.remove(id);
    
    return {
      success: true,
      message: 'Booking deleted successfully',
      data: null
    };
  }
} 
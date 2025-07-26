import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException,
  ForbiddenException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../../schemas/booking.schema';
import { Exhibition, ExhibitionDocument } from '../../schemas/exhibition.schema';
import { Stall, StallDocument } from '../../schemas/stall.schema';
import { StallType, StallTypeDocument } from '../../schemas/stall-type.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Exhibitor, ExhibitorDocument } from '../../schemas/exhibitor.schema';
import { Layout, LayoutDocument } from '../../schemas/layout.schema';
import { 
  CreateBookingDto, 
  UpdateBookingStatusDto, 
  UpdatePaymentStatusDto,
  BookingQueryDto,
  BookingStatsDto,
  BookingResponseDto,
  BookingStatsResponseDto
} from '../../dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Exhibition.name) private exhibitionModel: Model<ExhibitionDocument>,
    @InjectModel(Stall.name) private stallModel: Model<StallDocument>,
    @InjectModel(StallType.name) private stallTypeModel: Model<StallTypeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Exhibitor.name) private exhibitorModel: Model<ExhibitorDocument>,
    @InjectModel(Layout.name) private layoutModel: Model<LayoutDocument>,
  ) {}

  /**
   * Calculate stall area supporting both rectangle and L-shaped stalls
   */
  private calculateStallArea(dimensions: any): number {
    if (!dimensions) return 0;
    
    const shapeType = dimensions.shapeType || 'rectangle';
    
    if (shapeType === 'rectangle') {
      return dimensions.width * dimensions.height;
    }
    
    if (shapeType === 'l-shape' && dimensions.lShape) {
      const { rect1Width, rect1Height, rect2Width, rect2Height } = dimensions.lShape;
      return (rect1Width * rect1Height) + (rect2Width * rect2Height);
    }
    
    // Fallback to rectangle calculation
    return dimensions.width * dimensions.height;
  }

  /**
   * Calculate discount amount based on type and value
   */
  private calculateDiscount(
    baseAmount: number, 
    totalBaseAmount: number, 
    discount: any
  ): number {
    if (!discount || !discount.isActive) return 0;
    
    let amount = 0;
    if (discount.type === 'percentage') {
      const percentage = Math.min(Math.max(0, discount.value), 100);
      amount = Math.round((baseAmount * percentage / 100) * 100) / 100;
    } else if (discount.type === 'fixed') {
      const proportionalAmount = (baseAmount / totalBaseAmount) * discount.value;
      amount = Math.round(Math.min(proportionalAmount, baseAmount) * 100) / 100;
    }
    return amount;
  }

  /**
   * Calculate basic amenities quantities based on total stall area
   */
  private calculateBasicAmenitiesQuantities(
    basicAmenities: any[], 
    totalStallArea: number
  ): any[] {
    return basicAmenities.map(amenity => ({
      name: amenity.name,
      type: amenity.type,
      perSqm: amenity.perSqm,
      quantity: amenity.quantity,
      calculatedQuantity: Math.round((totalStallArea * amenity.perSqm) * 100) / 100,
      description: amenity.description
    }));
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(exhibition: any): Promise<string> {
    const prefix = exhibition.invoicePrefix || 'INV';
    const year = new Date().getFullYear();
    
    // Find the count of existing bookings with invoice numbers for this exhibition in this year
    const invoiceCount = await this.bookingModel.countDocuments({
      exhibitionId: exhibition._id,
      invoiceNumber: new RegExp(`^${prefix}/${year}/`)
    });
    
    // Generate sequence number (1-based, padded to 4 digits)
    const sequence = (invoiceCount + 1).toString().padStart(4, '0');
    
    return `${prefix}/${year}/${sequence}`;
  }

  /**
   * Find stalls from layout system
   */
  private async findStallsFromLayout(
    exhibitionId: string, 
    stallIds: string[]
  ): Promise<any[]> {
    // Get layout and exhibition data
    const [layout, exhibition] = await Promise.all([
      this.layoutModel.findOne({ 
        exhibitionId: new Types.ObjectId(exhibitionId) 
      }),
      this.exhibitionModel.findById(exhibitionId).populate('stallRates.stallTypeId')
    ]);
    
    if (!layout) {
      throw new NotFoundException('Exhibition layout not found');
    }

    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    const foundStalls = [];
    
    // Create a map of stallType to rate for quick lookup
    const stallRateMap = new Map();
    
    if (exhibition.stallRates) {
      exhibition.stallRates.forEach((stallRate: any) => {
        // Handle both populated and non-populated stallTypeId
        const stallTypeIdKey = typeof stallRate.stallTypeId === 'object' && stallRate.stallTypeId._id
          ? stallRate.stallTypeId._id.toString()  // If populated, use the _id
          : stallRate.stallTypeId.toString();     // If not populated, use as-is
        
        stallRateMap.set(stallTypeIdKey, stallRate.rate);
      });
    }

    // Also get all unique stallType IDs to fetch default rates
    const stallTypeIds = new Set();
    
    // First pass: collect all stallType IDs
    for (const space of layout.spaces || []) {
      for (const hall of space.halls || []) {
        for (const stall of hall.stalls || []) {
          if (stallIds.includes(stall.id)) {
            stallTypeIds.add(stall.stallType.toString());
          }
        }
      }
    }

    // Fetch stallTypes for default rates
    const stallTypes = await this.stallTypeModel.find({
      _id: { $in: Array.from(stallTypeIds) }
    }).select('_id defaultRate');

    const stallTypeDefaultRates = new Map();
    stallTypes.forEach((stallType: any) => {
      stallTypeDefaultRates.set(stallType._id.toString(), stallType.defaultRate || 100);
    });
    
    // Second pass: build stall data with correct rates
    for (const space of layout.spaces || []) {
      for (const hall of space.halls || []) {
        for (const stall of hall.stalls || []) {
          if (stallIds.includes(stall.id)) {
            const stallTypeId = stall.stallType.toString();
            // Use exhibition-specific rate if available, otherwise use default rate
            const ratePerSqm = stallRateMap.get(stallTypeId) || 
                              stallTypeDefaultRates.get(stallTypeId) || 
                              100;

            // CRITICAL FIX: Convert pixels to meters (following frontend pattern)
            // Frontend: stall.size (pixels) → stall.dimensions (meters)
            // Backend must do the same conversion: pixels ÷ 50 = meters
            const dimensionsInMeters = (stall as any).dimensions || {
              width: (stall.size?.width || 50) / 50, // Convert pixels to meters
              height: (stall.size?.height || 50) / 50, // Convert pixels to meters
              shapeType: (stall as any).shapeType || 'rectangle'
            };

            foundStalls.push({
              _id: stall.id,
              number: stall.number,
              status: stall.status,
              stallType: stall.stallType,
              transform: stall.transform,
              size: stall.size,
              ratePerSqm: ratePerSqm,
              dimensions: dimensionsInMeters // Use meter dimensions, not pixel sizes
            });
          }
        }
      }
    }

    if (foundStalls.length !== stallIds.length) {
      const missingStalls = stallIds.filter(id => !foundStalls.find(s => s._id === id));
      throw new NotFoundException(`Stalls not found: ${missingStalls.join(', ')}`);
    }

    return foundStalls;
  }

  /**
   * Create a new booking
   */
  async create(createBookingDto: CreateBookingDto, userId: string): Promise<BookingDocument> {
    // Validate exhibition
    const exhibition = await this.exhibitionModel.findById(createBookingDto.exhibitionId);
    if (!exhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    // Check if exhibition is bookable
    if (exhibition.status !== 'published' || !exhibition.isActive) {
      throw new ForbiddenException(
        `Cannot create booking for this exhibition. Status: ${exhibition.status}, Active: ${exhibition.isActive}`
      );
    }

    // Validate exhibitor if provided
    if (createBookingDto.exhibitorId) {
      const exhibitor = await this.exhibitorModel.findById(createBookingDto.exhibitorId);
      if (!exhibitor) {
        throw new NotFoundException('Exhibitor not found');
      }
    }

    // Find and validate stalls
    const stalls = await this.findStallsFromLayout(
      createBookingDto.exhibitionId,
      createBookingDto.stallIds
    );

    // Check stall availability
    const unavailableStalls = stalls.filter(stall => stall.status !== 'available');
    if (unavailableStalls.length > 0) {
      throw new BadRequestException(
        `Some stalls are not available: ${unavailableStalls.map(s => s.number).join(', ')}`
      );
    }

    // Calculate base amounts for verification
    const stallsWithBase = stalls.map(stall => {
      const area = this.calculateStallArea(stall.dimensions);
      const baseAmount = Math.round(stall.ratePerSqm * area * 100) / 100;
      return {
        stall,
        baseAmount
      };
    });

    const totalBaseAmount = stallsWithBase.reduce((sum, s) => sum + s.baseAmount, 0);
    
    // Verify calculations match frontend calculations
    const calculatedTotal = createBookingDto.calculations.totalBaseAmount;
    const tolerance = 0.01; // Allow 1 cent tolerance for rounding differences
    
    if (Math.abs(totalBaseAmount - calculatedTotal) > tolerance) {
      throw new BadRequestException(
        `Calculation mismatch. Expected: ${totalBaseAmount}, Received: ${calculatedTotal}`
      );
    }

    // Calculate total stall area for basic amenities
    const totalStallArea = stallsWithBase.reduce(
      (sum, s) => sum + this.calculateStallArea(s.stall.dimensions), 
      0
    );

    // Process basic amenities if provided
    let processedBasicAmenities = [];
    if (exhibition.basicAmenities && exhibition.basicAmenities.length > 0) {
      processedBasicAmenities = this.calculateBasicAmenitiesQuantities(
        exhibition.basicAmenities,
        totalStallArea
      );
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(exhibition);

    // Set booking source
    const bookingSource = createBookingDto.bookingSource || 'admin';

    // Create booking
    const booking = new this.bookingModel({
      exhibitionId: new Types.ObjectId(createBookingDto.exhibitionId),
      stallIds: createBookingDto.stallIds, // Keep as string IDs since they're custom
      userId: new Types.ObjectId(userId),
      exhibitorId: createBookingDto.exhibitorId ? new Types.ObjectId(createBookingDto.exhibitorId) : undefined,
      customerName: createBookingDto.customerName,
      customerEmail: createBookingDto.customerEmail,
      customerPhone: createBookingDto.customerPhone,
      customerAddress: createBookingDto.customerAddress,
      customerGSTIN: createBookingDto.customerGSTIN,
      customerPAN: createBookingDto.customerPAN,
      companyName: createBookingDto.companyName,
      amount: createBookingDto.amount,
      basicAmenities: processedBasicAmenities,
      extraAmenities: createBookingDto.extraAmenities || [],
      calculations: createBookingDto.calculations,
      status: bookingSource === 'admin' ? 'confirmed' : 'pending',
      paymentStatus: 'pending',
      bookingSource,
      notes: createBookingDto.notes,
      specialRequirements: createBookingDto.specialRequirements,
      invoiceNumber,
      invoiceGeneratedAt: new Date(),
    });

    const savedBooking = await booking.save();

    // Update stall statuses in layout based on booking source and status
    const stallStatus = bookingSource === 'admin' ? 'booked' : 'reserved';
    await this.updateStallStatusesInLayout(
      createBookingDto.exhibitionId,
      createBookingDto.stallIds,
      stallStatus
    );

    return savedBooking;
  }

  /**
   * Update stall statuses in the layout system
   */
  private async updateStallStatusesInLayout(
    exhibitionId: string,
    stallIds: string[],
    status: string
  ): Promise<void> {
    const layout = await this.layoutModel.findOne({ 
      exhibitionId: new Types.ObjectId(exhibitionId) 
    });
    
    if (!layout) return;

    let updated = false;

    // Update stall statuses in layout
    for (const space of layout.spaces || []) {
      for (const hall of space.halls || []) {
        for (const stall of hall.stalls || []) {
          if (stallIds.includes(stall.id)) {
            stall.status = status;
            updated = true;
          }
        }
      }
    }

    if (updated) {
      await layout.save();
    }
  }

  /**
   * Find all bookings with filtering and pagination
   */
  async findAll(query: BookingQueryDto): Promise<{
    bookings: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      exhibitionId,
      exhibitorId,
      bookingSource,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, 'i') },
        { customerEmail: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { invoiceNumber: new RegExp(search, 'i') }
      ];
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (exhibitionId) filter.exhibitionId = new Types.ObjectId(exhibitionId);
    if (exhibitorId) filter.exhibitorId = new Types.ObjectId(exhibitorId);
    if (bookingSource) filter.bookingSource = bookingSource;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('exhibitionId', 'name venue startDate endDate')
        .populate('userId', 'name email')
        .populate('exhibitorId', 'companyName contactPerson email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter)
    ]);

    // Enhance bookings with stall dimensions and types
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const enhancedBooking = booking.toObject();
        
        // Debug initial booking state
        console.log('Processing booking:', booking._id, 'with', booking.stallIds.length, 'stalls');
        
        // Get stall dimensions and types from layout
        try {
          const [layout, stallTypes, exhibition] = await Promise.all([
            this.layoutModel.findOne({ 
              exhibitionId: new Types.ObjectId(booking.exhibitionId),
              isActive: true 
            }),
            this.stallTypeModel.find({}).select('_id name'),
            this.exhibitionModel.findById(booking.exhibitionId).populate('stallRates.stallTypeId')
          ]);
          
          console.log('Layout found for exhibition', booking.exhibitionId, ':', !!layout);
          
          if (layout) {
            const stallDataMap = new Map();
            const stallTypeMap = new Map();
            let totalLayoutStalls = 0;
            
            // Build stall type map
            stallTypes.forEach(stallType => {
              stallTypeMap.set(stallType._id.toString(), stallType);
            });
            
            // Create stallRate map for recalculating rates
            const stallRateMap = new Map();
            if (exhibition?.stallRates) {
              exhibition.stallRates.forEach((stallRate: any) => {
                const stallTypeIdKey = typeof stallRate.stallTypeId === 'object' && stallRate.stallTypeId._id
                  ? stallRate.stallTypeId._id.toString()
                  : stallRate.stallTypeId.toString();
                stallRateMap.set(stallTypeIdKey, stallRate.rate);
              });
            }
            
            // Build stall data map with dimensions, stall type, and recalculated rates
            for (const space of layout.spaces || []) {
              for (const hall of space.halls || []) {
                for (const stall of hall.stalls || []) {
                  totalLayoutStalls++;
                  const dimensionsInMeters = (stall as any).dimensions || {
                    width: (stall.size?.width || 50) / 50,
                    height: (stall.size?.height || 50) / 50,
                    shapeType: (stall as any).shapeType || 'rectangle'
                  };
                  
                  const stallType = stallTypeMap.get(stall.stallType?.toString());
                  
                  // Calculate correct rate per sqm
                  const stallTypeId = stall.stallType?.toString();
                  let ratePerSqm = 0;
                  
                  if (stallRateMap.has(stallTypeId)) {
                    // Use exhibition-specific rate
                    ratePerSqm = stallRateMap.get(stallTypeId);
                  } else if (stallType) {
                    // Fallback to stall type default rate
                    const stallArea = dimensionsInMeters.width * dimensionsInMeters.height;
                    const rate = stallType.basePrice || stallType.defaultRate || 0;
                    const rateType = stallType.rateType || 'per_stall';
                    
                    if (rateType === 'per_sqm') {
                      ratePerSqm = rate;
                    } else if (rateType === 'per_stall' && stallArea > 0) {
                      ratePerSqm = rate / stallArea;
                    } else {
                      ratePerSqm = rate;
                    }
                  }
                  
                  stallDataMap.set(stall.id, {
                    dimensions: dimensionsInMeters,
                    stallType: stallType ? { _id: stallType._id, name: stallType.name } : null,
                    stallTypeName: stallType?.name || 'Standard Stall',
                    ratePerSqm: Math.round(ratePerSqm * 100) / 100
                  });
                }
              }
            }
            
            console.log('Layout has', totalLayoutStalls, 'stalls, found', stallDataMap.size, 'with data');
            
            // Add dimensions, stall type, and corrected rates to booking
            if (enhancedBooking.calculations?.stalls) {
              enhancedBooking.calculations.stalls = enhancedBooking.calculations.stalls.map((stall: any) => {
                const stallData = stallDataMap.get(stall.stallId);
                
                // Use recalculated rate if original is invalid (NaN, undefined, or 0)
                const originalRate = stall.ratePerSqm;
                const isValidRate = originalRate && !isNaN(originalRate) && originalRate > 0;
                const finalRate = isValidRate ? originalRate : (stallData?.ratePerSqm || 0);
                
                return {
                  ...stall,
                  dimensions: stallData?.dimensions || null,
                  stallType: stallData?.stallType || null,
                  stallTypeName: stallData?.stallTypeName || 'Standard Stall',
                  ratePerSqm: finalRate
                };
              });
              
              console.log('Enhanced', enhancedBooking.calculations.stalls.length, 'stalls in booking', booking._id);
            }
          }
        } catch (error) {
          console.warn(`Failed to get stall data for booking ${booking._id}:`, error);
        }
        
        return enhancedBooking;
      })
    );

    return {
      bookings: enhancedBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Find booking by ID
   */
  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid booking ID');
    }

    const booking = await this.bookingModel
      .findById(id)
      .populate('exhibitionId', 'name venue startDate endDate companyName')
      .populate('userId', 'name email')
      .populate('exhibitorId', 'companyName contactPerson email phone')
      .populate('approvedBy', 'name email')
      .populate('cancelledBy', 'name email')
      .exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Enhance booking with stall dimensions and types
    const enhancedBooking = booking.toObject();
    
    try {
      const [layout, stallTypes, exhibition] = await Promise.all([
        this.layoutModel.findOne({ 
          exhibitionId: new Types.ObjectId(booking.exhibitionId),
          isActive: true 
        }),
        this.stallTypeModel.find({}).select('_id name'),
        this.exhibitionModel.findById(booking.exhibitionId).populate('stallRates.stallTypeId')
      ]);
      
      if (layout && enhancedBooking.calculations?.stalls) {
        const stallDataMap = new Map();
        const stallTypeMap = new Map();
        
        // Build stall type map
        stallTypes.forEach(stallType => {
          stallTypeMap.set(stallType._id.toString(), stallType);
        });
        
        // Create stallRate map for recalculating rates
        const stallRateMap = new Map();
        if (exhibition?.stallRates) {
          exhibition.stallRates.forEach((stallRate: any) => {
            const stallTypeIdKey = typeof stallRate.stallTypeId === 'object' && stallRate.stallTypeId._id
              ? stallRate.stallTypeId._id.toString()
              : stallRate.stallTypeId.toString();
            stallRateMap.set(stallTypeIdKey, stallRate.rate);
          });
        }
        
        // Build stall data map with dimensions, stall type, and recalculated rates
        for (const space of layout.spaces || []) {
          for (const hall of space.halls || []) {
            for (const stall of hall.stalls || []) {
              const dimensionsInMeters = (stall as any).dimensions || {
                width: (stall.size?.width || 50) / 50,
                height: (stall.size?.height || 50) / 50,
                shapeType: (stall as any).shapeType || 'rectangle'
              };
              
              const stallType = stallTypeMap.get(stall.stallType?.toString());
              
              // Calculate correct rate per sqm
              const stallTypeId = stall.stallType?.toString();
              let ratePerSqm = 0;
              
              if (stallRateMap.has(stallTypeId)) {
                // Use exhibition-specific rate
                ratePerSqm = stallRateMap.get(stallTypeId);
              } else if (stallType) {
                // Fallback to stall type default rate
                const stallArea = dimensionsInMeters.width * dimensionsInMeters.height;
                const rate = stallType.basePrice || stallType.defaultRate || 0;
                const rateType = stallType.rateType || 'per_stall';
                
                if (rateType === 'per_sqm') {
                  ratePerSqm = rate;
                } else if (rateType === 'per_stall' && stallArea > 0) {
                  ratePerSqm = rate / stallArea;
                } else {
                  ratePerSqm = rate;
                }
              }
              
              stallDataMap.set(stall.id, {
                dimensions: dimensionsInMeters,
                stallType: stallType ? { _id: stallType._id, name: stallType.name } : null,
                stallTypeName: stallType?.name || 'Standard Stall',
                ratePerSqm: Math.round(ratePerSqm * 100) / 100
              });
            }
          }
        }
        
        // Debug logging
        console.log('Enhanced booking', booking._id, 'with dimensions, stall types, and recalculated rates for', enhancedBooking.calculations.stalls.length, 'stalls');
        
        // Add dimensions, stall type, and corrected rates to stall calculations
        enhancedBooking.calculations.stalls = enhancedBooking.calculations.stalls.map((stall: any) => {
          const stallData = stallDataMap.get(stall.stallId);
          
          // Use recalculated rate if original is invalid (NaN, undefined, or 0)
          const originalRate = stall.ratePerSqm;
          const isValidRate = originalRate && !isNaN(originalRate) && originalRate > 0;
          const finalRate = isValidRate ? originalRate : (stallData?.ratePerSqm || 0);
          
          return {
            ...stall,
            dimensions: stallData?.dimensions || null,
            stallType: stallData?.stallType || null,
            stallTypeName: stallData?.stallTypeName || 'Standard Stall',
            ratePerSqm: finalRate
          };
        });
      }
    } catch (error) {
      // If we can't get dimensions and stall types, continue without them
      console.warn(`Failed to get stall data for booking ${booking._id}:`, error);
    }

    return enhancedBooking;
  }

  /**
   * Update booking status
   */
  async updateStatus(
    id: string, 
    updateStatusDto: UpdateBookingStatusDto,
    userId: string
  ): Promise<BookingDocument> {
    // Get the actual Mongoose document for updating
    const booking = await this.bookingModel
      .findById(id)
      .populate('exhibitionId', 'name venue')
      .populate('exhibitorId', 'companyName contactPerson email')
      .exec();
    
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    
    const { status, rejectionReason, cancellationReason } = updateStatusDto;

    // Validate status transitions
    if (booking.status === 'cancelled' && status !== 'cancelled') {
      throw new BadRequestException('Cannot change status of cancelled booking');
    }

    if (booking.status === 'confirmed' && status === 'pending') {
      throw new BadRequestException('Cannot revert confirmed booking to pending');
    }

    // Update booking status
    booking.status = status;
    
    if (status === 'approved') {
      if (userId) {
        booking.approvedBy = new Types.ObjectId(userId);
        booking.approvedAt = new Date();
      }
    }

    if (status === 'cancelled') {
      if (userId) {
        booking.cancelledBy = new Types.ObjectId(userId);
      }
      booking.cancelledAt = new Date();
      booking.cancellationReason = cancellationReason;
      
      // Free up stalls
      const exhibitionId = booking.exhibitionId._id || booking.exhibitionId;
      await this.updateStallStatusesInLayout(
        exhibitionId.toString(),
        booking.stallIds.map(id => id.toString()),
        'available'
      );
    }

    if (status === 'rejected') {
      booking.rejectionReason = rejectionReason;
      
      // Free up stalls
      const exhibitionId = booking.exhibitionId._id || booking.exhibitionId;
      await this.updateStallStatusesInLayout(
        exhibitionId.toString(),
        booking.stallIds.map(id => id.toString()),
        'available'
      );
    }

    if (status === 'confirmed') {
      // Mark stalls as booked (final status)
      const exhibitionId = booking.exhibitionId._id || booking.exhibitionId;
      await this.updateStallStatusesInLayout(
        exhibitionId.toString(),
        booking.stallIds.map(id => id.toString()),
        'booked'
      );
    }

    // Handle approved status - stalls remain reserved until confirmed
    if (status === 'approved') {
      // Stalls remain in 'reserved' status - no change needed
      console.log(`Booking ${booking._id} approved - stalls remain reserved`);
    }

    return booking.save();
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    id: string,
    updatePaymentDto: UpdatePaymentStatusDto
  ): Promise<BookingDocument> {
    const booking = await this.findOne(id);

    booking.paymentStatus = updatePaymentDto.paymentStatus;
    
    if (updatePaymentDto.paymentDetails) {
      booking.paymentDetails = {
        ...updatePaymentDto.paymentDetails,
        paidAt: new Date()
      };
    }

    return booking.save();
  }

  /**
   * Delete booking
   */
  async remove(id: string): Promise<void> {
    const booking = await this.findOne(id);

    // Free up stalls if they were booked or reserved
    if (['pending', 'confirmed', 'approved'].includes(booking.status)) {
      await this.updateStallStatusesInLayout(
        booking.exhibitionId._id.toString(),
        booking.stallIds.map(id => id.toString()),
        'available'
      );
    }

    await this.bookingModel.findByIdAndDelete(id);
  }

  /**
   * Get booking statistics
   */
  async getStats(query: BookingStatsDto): Promise<BookingStatsResponseDto> {
    const { exhibitionId, startDate, endDate } = query;

    // Build filter for stats
    const filter: any = {};
    
    if (exhibitionId) {
      filter.exhibitionId = new Types.ObjectId(exhibitionId);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate statistics
    const [
      statusStats,
      paymentStats,
      sourceStats,
      totalStats,
      recentBookings
    ] = await Promise.all([
      this.bookingModel.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      this.bookingModel.aggregate([
        { $match: filter },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]),
      this.bookingModel.aggregate([
        { $match: filter },
        { $group: { _id: '$bookingSource', count: { $sum: 1 } } }
      ]),
      this.bookingModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            totalStalls: { $sum: { $size: '$stallIds' } }
          }
        }
      ]),
      this.bookingModel
        .find(filter)
        .populate('exhibitionId', 'name venue')
        .sort({ createdAt: -1 })
        .limit(5)
        .exec()
    ]);

    // Process results
    const byStatus = statusStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const byPaymentStatus = paymentStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const bySource = sourceStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const totals = totalStats[0] || { total: 0, totalAmount: 0, totalStalls: 0 };

    return {
      total: totals.total,
      pending: byStatus.pending || 0,
      confirmed: byStatus.confirmed || 0,
      cancelled: byStatus.cancelled || 0,
      approved: byStatus.approved || 0,
      rejected: byStatus.rejected || 0,
      totalAmount: totals.totalAmount,
      totalStalls: totals.totalStalls,
      averageBookingValue: totals.total > 0 ? totals.totalAmount / totals.total : 0,
      byStatus,
      byPaymentStatus,
      bySource,
      recentBookings: recentBookings as any[]
    };
  }

  /**
   * Get bookings by exhibition ID
   */
  async findByExhibitionId(exhibitionId: string, query: BookingQueryDto) {
    return this.findAll({ ...query, exhibitionId });
  }

  /**
   * Get bookings by exhibitor ID
   */
  async findByExhibitorId(exhibitorId: string, query: BookingQueryDto) {
    return this.findAll({ ...query, exhibitorId });
  }

  /**
   * Get bookings by user ID
   */
  async findByUserId(userId: string, query: BookingQueryDto): Promise<{
    bookings: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      exhibitionId,
      bookingSource,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Build filter query with userId OR exhibitorId since the frontend user might be stored as either
    const filter: any = {
      $or: [
        { userId: new Types.ObjectId(userId) },
        { exhibitorId: new Types.ObjectId(userId) }
      ]
    };
    

    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, 'i') },
        { customerEmail: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') },
        { invoiceNumber: new RegExp(search, 'i') }
      ];
    }

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (exhibitionId) filter.exhibitionId = new Types.ObjectId(exhibitionId);
    if (bookingSource) filter.bookingSource = bookingSource;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('exhibitionId', 'name venue startDate endDate')
        .populate('userId', 'name email')
        .populate('exhibitorId', 'companyName contactPerson email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(filter)
    ]);

    // Enhance bookings with stall dimensions and types
    const enhancedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const enhancedBooking = booking.toObject();
        
        // Get stall dimensions and types from layout
        try {
          const [layout, stallTypes, exhibition] = await Promise.all([
            this.layoutModel.findOne({ 
              exhibitionId: new Types.ObjectId(booking.exhibitionId),
              isActive: true 
            }),
            this.stallTypeModel.find({}).select('_id name'),
            this.exhibitionModel.findById(booking.exhibitionId).populate('stallRates.stallTypeId')
          ]);
          
          if (layout && enhancedBooking.calculations?.stalls) {
            const stallDataMap = new Map();
            const stallTypeMap = new Map();
            
            // Build stall type map
            stallTypes.forEach(stallType => {
              stallTypeMap.set(stallType._id.toString(), stallType);
            });
            
            // Create stallRate map for recalculating rates
            const stallRateMap = new Map();
            if (exhibition?.stallRates) {
              exhibition.stallRates.forEach((stallRate: any) => {
                const stallTypeIdKey = typeof stallRate.stallTypeId === 'object' && stallRate.stallTypeId._id
                  ? stallRate.stallTypeId._id.toString()
                  : stallRate.stallTypeId.toString();
                stallRateMap.set(stallTypeIdKey, stallRate.rate);
              });
            }
            
            // Build stall data map with dimensions, stall type, and recalculated rates
            for (const space of layout.spaces || []) {
              for (const hall of space.halls || []) {
                for (const stall of hall.stalls || []) {
                  const dimensionsInMeters = (stall as any).dimensions || {
                    width: (stall.size?.width || 50) / 50,
                    height: (stall.size?.height || 50) / 50,
                    shapeType: (stall as any).shapeType || 'rectangle'
                  };
                  
                  const stallType = stallTypeMap.get(stall.stallType?.toString());
                  
                  // Calculate correct rate per sqm
                  const stallTypeId = stall.stallType?.toString();
                  let ratePerSqm = 0;
                  
                  if (stallRateMap.has(stallTypeId)) {
                    // Use exhibition-specific rate
                    ratePerSqm = stallRateMap.get(stallTypeId);
                  } else if (stallType) {
                    // Fallback to stall type default rate
                    const stallArea = dimensionsInMeters.width * dimensionsInMeters.height;
                    const rate = stallType.basePrice || stallType.defaultRate || 0;
                    const rateType = stallType.rateType || 'per_stall';
                    
                    if (rateType === 'per_sqm') {
                      ratePerSqm = rate;
                    } else if (rateType === 'per_stall' && stallArea > 0) {
                      ratePerSqm = rate / stallArea;
                    } else {
                      ratePerSqm = rate;
                    }
                  }
                  
                  stallDataMap.set(stall.id, {
                    dimensions: dimensionsInMeters,
                    stallType: stallType ? { _id: stallType._id, name: stallType.name } : null,
                    stallTypeName: stallType?.name || 'Standard Stall',
                    ratePerSqm: Math.round(ratePerSqm * 100) / 100
                  });
                }
              }
            }
            
            // Debug logging
            console.log('Enhanced user booking', booking._id, 'with dimensions, stall types, and recalculated rates');
            
            // Add dimensions, stall type, and corrected rates to stall calculations
            enhancedBooking.calculations.stalls = enhancedBooking.calculations.stalls.map((stall: any) => {
              const stallData = stallDataMap.get(stall.stallId);
              
              // Use recalculated rate if original is invalid (NaN, undefined, or 0)
              const originalRate = stall.ratePerSqm;
              const isValidRate = originalRate && !isNaN(originalRate) && originalRate > 0;
              const finalRate = isValidRate ? originalRate : (stallData?.ratePerSqm || 0);
              
              return {
                ...stall,
                dimensions: stallData?.dimensions || null,
                stallType: stallData?.stallType || null,
                stallTypeName: stallData?.stallTypeName || 'Standard Stall',
                ratePerSqm: finalRate
              };
            });
          }
        } catch (error) {
          // If we can't get dimensions and stall types, continue without them
          console.warn(`Failed to get stall data for booking ${booking._id}:`, error);
        }
        
        return enhancedBooking;
      })
    );

    return {
      bookings: enhancedBookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
} 
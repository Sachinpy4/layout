import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Booking } from '../../schemas/booking.schema';
import { Exhibition } from '../../schemas/exhibition.schema';
import { Layout } from '../../schemas/layout.schema';
import { StallType } from '../../schemas/stall-type.schema';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  private static browserInstance: Browser;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Exhibition.name) private exhibitionModel: Model<Exhibition>,
    @InjectModel(Layout.name) private layoutModel: Model<Layout>,
    @InjectModel(StallType.name) private stallTypeModel: Model<StallType>,
  ) {
    this.registerHandlebarsHelpers();
  }

  /**
   * Generate PDF invoice for a booking
   */
  async generateInvoicePDF(bookingId: string): Promise<Buffer> {
    try {
      this.logger.log(`Generating invoice PDF for booking: ${bookingId}`);
      
      // 1. Fetch booking with all populated data
      const booking = await this.getBookingWithDetails(bookingId);
      
      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      if (!booking.invoiceNumber) {
        this.logger.warn(`Booking ${bookingId} does not have an invoice number, generating...`);
        // You might want to generate an invoice number here if missing
      }
      
      // 2. Prepare template data
      const templateData = this.prepareTemplateData(booking);
      
      // 3. Render HTML from template
      const html = await this.renderInvoiceHTML(templateData);
      
      // 4. Generate PDF
      const pdfBuffer = await this.generatePDFFromHTML(html, booking.invoiceNumber);
      
      this.logger.log(`Invoice PDF generated successfully for booking: ${bookingId}, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      this.logger.error(`Failed to generate invoice for booking ${bookingId}:`, {
        error: error.message,
        stack: error.stack,
        bookingId
      });
      
      // Categorize errors for better handling
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error.message.includes('Chrome') || error.message.includes('Puppeteer')) {
        throw new Error(`PDF generation service unavailable: ${error.message}`);
      } else if (error.message.includes('template') || error.message.includes('Handlebars')) {
        throw new Error(`Invoice template error: ${error.message}`);
      } else {
        throw new Error(`Failed to generate invoice: ${error.message}`);
      }
    }
  }

  /**
   * Get booking with all related data populated and enhanced with stall details
   */
  private async getBookingWithDetails(bookingId: string): Promise<any> {
    try {
      const booking = await this.bookingModel
        .findById(bookingId)
        .populate({
          path: 'exhibitionId',
          select: 'name venue startDate endDate companyName companyAddress companyEmail companyContactNo invoicePrefix'
        })
        .populate({
          path: 'userId',
          select: 'name email'
        })
        .populate({
          path: 'exhibitorId',
          select: 'companyName contactPerson email phone address'
        })
        .lean() // Use lean() to get plain objects and avoid validation issues
        .exec();

      if (!booking) {
        throw new NotFoundException(`Booking with ID ${bookingId} not found`);
      }

      // Sanitize phone numbers to prevent validation issues during template processing
      if (booking.customerPhone) {
        booking.customerPhone = this.sanitizePhoneNumber(booking.customerPhone);
      }
      
      if (booking.exhibitorId && typeof booking.exhibitorId === 'object' && 'phone' in booking.exhibitorId && booking.exhibitorId.phone) {
        booking.exhibitorId.phone = this.sanitizePhoneNumber(booking.exhibitorId.phone as string);
      }

      // Enhance booking with stall details (same logic as BookingsService.findOne)
      return await this.enhanceBookingWithStallDetails(booking);
    } catch (error) {
      this.logger.error(`Error fetching booking details for invoice:`, {
        bookingId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Sanitize phone number for display purposes
   */
  private sanitizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Remove any non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Ensure it's a valid format for display
    if (cleaned.length >= 10) {
      return cleaned;
    }
    
    return phone; // Return original if we can't clean it properly
  }

  /**
   * Prepare data for template rendering
   */
  private prepareTemplateData(booking: any): any {
    const exhibition = booking.exhibitionId;
    const exhibitor = booking.exhibitorId;
    
    // Calculate due date (30 days from invoice generation)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);


    
    return {
      // Invoice metadata
      invoiceNumber: booking.invoiceNumber,
      invoiceGeneratedAt: booking.invoiceGeneratedAt || booking.createdAt,
      dueDate: dueDate,
      
      // Customer information
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      customerGSTIN: booking.customerGSTIN,
      customerPAN: booking.customerPAN,
      companyName: booking.companyName,
      
      // Exhibition information
      exhibition: {
        name: exhibition?.name || 'N/A',
        venue: exhibition?.venue || 'N/A',
        startDate: exhibition?.startDate,
        endDate: exhibition?.endDate,
        companyName: exhibition?.companyName || 'ExpoTrack',
        companyAddress: exhibition?.companyAddress || 'Exhibition Organizer Address',
        companyEmail: exhibition?.companyEmail || 'contact@expotrack.com',
        companyContactNo: exhibition?.companyContactNo || '+1-000-000-0000'
      },
      
      // Exhibitor information (if available)
      exhibitor: exhibitor ? {
        companyName: exhibitor.companyName,
        contactPerson: exhibitor.contactPerson,
        email: exhibitor.email,
        phone: exhibitor.phone,
        address: exhibitor.address
      } : null,
      
      // Booking details
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      bookingSource: booking.bookingSource,
      notes: booking.notes,
      specialRequirements: booking.specialRequirements,
      
      // Financial calculations - Keep enhanced data (already converted to plain object in enhancement)
      calculations: booking.calculations || null,
      amount: booking.amount,
      
      // Amenities
      basicAmenities: booking.basicAmenities || [],
      extraAmenities: booking.extraAmenities || [],
      
      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }



  /**
   * Calculate stall area from dimensions
   */
  private calculateStallArea(dimensions: any): number {
    if (!dimensions || typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
      return 0;
    }
    return Math.round(dimensions.width * dimensions.height * 100) / 100;
  }

  /**
   * Enhance booking with stall details from layout (same logic as BookingsService.findOne)
   */
  private async enhanceBookingWithStallDetails(booking: any): Promise<any> {
    // Handle both Mongoose documents and plain objects (from lean() queries)
    const enhancedBooking = typeof booking.toObject === 'function' 
      ? booking.toObject() 
      : { ...booking }; // Clone the plain object
    
    try {
      // Extract exhibition ID - it might be populated or just an ObjectId
      const exhibitionId = booking.exhibitionId._id || booking.exhibitionId;
      
      const [layout, stallTypes, exhibition] = await Promise.all([
        this.layoutModel.findOne({ 
          exhibitionId: exhibitionId
        }).sort({ createdAt: -1 }),
        this.stallTypeModel.find({}).select('_id name'),
        this.exhibitionModel.findById(exhibitionId).populate('stallRates.stallTypeId')
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
              
              const stallData = {
                dimensions: dimensionsInMeters,
                stallType: stallType ? { _id: stallType._id, name: stallType.name } : null,
                stallTypeName: stallType?.name || 'Standard Stall',
                ratePerSqm: Math.round(ratePerSqm * 100) / 100
              };
              
              stallDataMap.set(stall.id, stallData);
            }
          }
        }
        
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
        console.warn(`Failed to enhance booking with stall details for booking ${booking._id}:`, error.message);
      }

    return enhancedBooking;
  }

  /**
   * Render HTML from Handlebars template
   */
  private async renderInvoiceHTML(data: any): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', 'invoice.hbs');
    
    let template = this.templateCache.get('invoice');
    if (!template) {
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      template = Handlebars.compile(templateSource);
      this.templateCache.set('invoice', template);
    }
    
    return template(data);
  }

  /**
   * Generate PDF from HTML using Puppeteer
   */
  private async generatePDFFromHTML(html: string, invoiceNumber: string): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 });

      // Load HTML content
      await page.setContent(html, {
        waitUntil: ['networkidle0', 'domcontentloaded'],
        timeout: 30000
      });

      // Generate PDF with optimized settings
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width: 100%; font-size: 10px; color: #666; text-align: right; margin-right: 1cm;">
            Invoice: ${invoiceNumber || 'N/A'}
          </div>
        `,
        footerTemplate: `
          <div style="width: 100%; font-size: 10px; color: #666; text-align: center;">
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            <span style="margin-left: 2cm;">Generated on ${new Date().toLocaleDateString()}</span>
          </div>
        `
      });

      return pdfBuffer;
    } finally {
      await page.close();
    }
  }

  /**
   * Get browser instance (reuse for performance)
   */
  private async getBrowser(): Promise<Browser> {
    if (!InvoiceService.browserInstance || !InvoiceService.browserInstance.connected) {
      try {
        // Production vs Development configuration
        const isProduction = process.env.NODE_ENV === 'production';
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                              (isProduction ? '/usr/bin/chromium-browser' : undefined);

        this.logger.log(`Launching browser in ${isProduction ? 'production' : 'development'} mode`);
        
        InvoiceService.browserInstance = await puppeteer.launch({
          headless: 'new',
          executablePath: executablePath,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--run-all-compositor-stages-before-draw',
            '--memory-pressure-off',
            ...(isProduction ? [
              '--single-process', // Important for containerized environments
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding'
            ] : [])
          ],
          timeout: 60000, // Increased timeout for production
        });

        this.logger.log('Browser launched successfully');
      } catch (error) {
        this.logger.error('Failed to launch browser:', {
          error: error.message,
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
          nodeEnv: process.env.NODE_ENV
        });
        throw new Error(`Browser launch failed: ${error.message}`);
      }
    }
    return InvoiceService.browserInstance;
  }

  /**
   * Register Handlebars helpers for template rendering
   */
  private registerHandlebarsHelpers(): void {
    // Format number with commas
    Handlebars.registerHelper('formatNumber', (number: number) => {
      if (typeof number !== 'number') return '0';
      return number.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });

    // Format date
    Handlebars.registerHelper('formatDate', (date: Date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    });

    // Format date range
    Handlebars.registerHelper('formatDateRange', (startDate: Date, endDate: Date) => {
      if (!startDate || !endDate) return 'N/A';
      const start = new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const end = new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    });

    // Format dimensions
    Handlebars.registerHelper('formatDimensions', (dimensions: any) => {
      if (!dimensions || typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
        return 'N/A';
      }
      return `${dimensions.width}m × ${dimensions.height}m`;
    });

    // Calculate area
    Handlebars.registerHelper('calculateArea', (dimensions: any) => {
      const area = this.calculateStallArea(dimensions);
      return area.toFixed(2);
    });

    // Uppercase helper
    Handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Conditional helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    // Add helper for incrementing index (for S/N)
    Handlebars.registerHelper('add', (a: number, b: number) => {
      return a + b;
    });

    // Multiply helper for area calculation
    Handlebars.registerHelper('multiply', (a: number, b: number) => {
      if (!a || !b) return 0;
      return Math.round(a * b * 100) / 100;
    });

    // Calculate discount percentage
    Handlebars.registerHelper('getDiscountPercentage', (discountAmount: number, baseAmount: number) => {
      if (!discountAmount || !baseAmount || baseAmount === 0) return '0';
      const percentage = (discountAmount / baseAmount) * 100;
      return Math.round(percentage);
    });

    // Get tax percentage from taxes array
    Handlebars.registerHelper('getTaxPercentage', (taxes: any[]) => {
      if (!taxes || !Array.isArray(taxes) || taxes.length === 0) return '0';
      // Return the rate of the first tax (usually GST)
      return taxes[0].rate || '0';
    });

    // Greater than helper
    Handlebars.registerHelper('gt', (a: any, b: any) => {
      return a > b;
    });

    // Divide helper (for calculating rate per sqm)
    Handlebars.registerHelper('divide', (a: number, b: number) => {
      if (!a || !b || b === 0) return 0;
      return Math.round((a / b) * 100) / 100;
    });
  }

  /**
   * Close browser instance (call on module destroy)
   */
  async onModuleDestroy(): Promise<void> {
    if (InvoiceService.browserInstance && InvoiceService.browserInstance.connected) {
      await InvoiceService.browserInstance.close();
    }
  }
} 
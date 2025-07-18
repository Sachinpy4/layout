import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Exhibitor } from '../../schemas/exhibitor.schema';
import {
  CreateExhibitorDto,
  UpdateExhibitorDto,
  UpdateExhibitorStatusDto,
  ExhibitorQueryDto,
  ExhibitorLoginDto,
  ExhibitorRegisterDto,
  ExhibitorResponseDto,
  ExhibitorListResponseDto,
  ExhibitorStatsDto,
  ExhibitorStatus,
} from '../../dto/exhibitor.dto';

@Injectable()
export class ExhibitorsService {
  constructor(
    @InjectModel(Exhibitor.name) private exhibitorModel: Model<Exhibitor>,
    private jwtService: JwtService,
  ) {}

  // Public methods for exhibitor authentication
  async register(registerDto: ExhibitorRegisterDto): Promise<ExhibitorResponseDto> {
    const { password, ...exhibitorData } = registerDto;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create exhibitor with pending status
    const exhibitor = await this.exhibitorModel.create({
      ...exhibitorData,
      password: hashedPassword,
      status: ExhibitorStatus.PENDING,
      isActive: true,
    });

    return this.toResponseDto(exhibitor);
  }

  async login(loginDto: ExhibitorLoginDto): Promise<{ access_token: string; exhibitor: ExhibitorResponseDto }> {
    const { email, password } = loginDto;

    // Find exhibitor by email and include password
    const exhibitor = await this.exhibitorModel.findOne({ email }).select('+password');
    
    if (!exhibitor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if exhibitor is active
    if (!exhibitor.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if exhibitor is approved
    if (exhibitor.status !== ExhibitorStatus.APPROVED) {
      throw new UnauthorizedException('Account not approved');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, exhibitor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.exhibitorModel.findByIdAndUpdate(exhibitor._id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload = { sub: exhibitor._id, email: exhibitor.email, type: 'exhibitor' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      exhibitor: this.toResponseDto(exhibitor),
    };
  }

  async getProfile(id: string): Promise<ExhibitorResponseDto> {
    const exhibitor = await this.exhibitorModel.findById(id);
    
    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found');
    }

    return this.toResponseDto(exhibitor);
  }

  async updateProfile(id: string, updateDto: UpdateExhibitorDto): Promise<ExhibitorResponseDto> {
    const exhibitor = await this.exhibitorModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true }
    );

    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found');
    }

    return this.toResponseDto(exhibitor);
  }

  // Admin methods for exhibitor management
  async findAll(query: ExhibitorQueryDto): Promise<ExhibitorListResponseDto> {
    const {
      page = 1,
      limit = 10,
      status,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    // Build filter conditions
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    
    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort options
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [exhibitors, total] = await Promise.all([
      this.exhibitorModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.exhibitorModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: exhibitors.map(exhibitor => this.toResponseDto(exhibitor)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<ExhibitorResponseDto | null> {
    const exhibitor = await this.exhibitorModel.findById(id);
    
    if (!exhibitor) {
      return null;
    }

    return this.toResponseDto(exhibitor);
  }

  /**
   * Generate a temporary password for admin-created exhibitors
   */
  private generateTempPassword(): string {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    
    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%'[Math.floor(Math.random() * 5)]; // special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Send login credentials via email and SMS
   */
  private async sendCredentials(
    email: string, 
    phone: string, 
    tempPassword: string, 
    companyName: string, 
    contactPerson: string
  ): Promise<void> {
    try {
      // Email notification
      const emailContent = `
        Dear ${contactPerson},

        Welcome to our Stall Booking System! Your exhibitor account has been created successfully.

        Login Details:
        - Website: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
        - Email/Phone: ${email} or ${phone}
        - Temporary Password: ${tempPassword}

        Important Notes:
        - Your account is pre-approved and ready to use
        - Please change your password after first login for security
        - You can login with either your email address or phone number
        - You can now book stalls for upcoming exhibitions

        Company: ${companyName}
        
        For support, please contact our admin team.

        Best regards,
        Stall Booking Team
      `;

      // SMS content (shorter version)
      const smsContent = `Welcome ${contactPerson}! Your exhibitor account is ready. Login: ${email} | Password: ${tempPassword} | Change password after first login. ${process.env.FRONTEND_URL || 'http://localhost:3000'}`;

      // Log the credentials for now (in production, this should use actual email/SMS services)
      console.log('📧 Email Credentials Sent:');
      console.log(`To: ${email}`);
      console.log(`Subject: Exhibitor Account Created - Login Credentials`);
      console.log(`Content: ${emailContent}`);
      console.log('\n📱 SMS Credentials Sent:');
      console.log(`To: ${phone}`);
      console.log(`Content: ${smsContent}`);

      // TODO: Implement actual email service (NodeMailer, SendGrid, etc.)
      // await this.emailService.sendEmail({
      //   to: email,
      //   subject: 'Exhibitor Account Created - Login Credentials',
      //   text: emailContent
      // });

      // TODO: Implement actual SMS service (Twilio, AWS SNS, etc.)
      // await this.smsService.sendSMS({
      //   to: phone,
      //   message: smsContent
      // });

    } catch (error) {
      console.error('Failed to send credentials:', error);
      // Don't throw error to prevent blocking account creation
    }
  }

  async create(createDto: CreateExhibitorDto): Promise<ExhibitorResponseDto> {
    // Generate temporary password if not provided
    const tempPassword = createDto.password || this.generateTempPassword();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // Create exhibitor with approved status (admin created)
    const exhibitor = await this.exhibitorModel.create({
      ...createDto,
      password: hashedPassword,
      status: ExhibitorStatus.APPROVED,
      approvedAt: new Date(),
      isActive: createDto.isActive !== undefined ? createDto.isActive : true,
    });

    // Send credentials via email and SMS
    await this.sendCredentials(
      exhibitor.email,
      exhibitor.phone,
      tempPassword,
      exhibitor.companyName,
      exhibitor.contactPerson
    );

    return this.toResponseDto(exhibitor);
  }

  /**
   * Login with email or phone number
   */
  async loginWithEmailOrPhone(identifier: string, password: string): Promise<{ access_token: string; exhibitor: ExhibitorResponseDto }> {
    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');
    const searchQuery = isEmail ? { email: identifier } : { phone: identifier };

    // Find exhibitor by email or phone and include password
    const exhibitor = await this.exhibitorModel.findOne(searchQuery).select('+password');
    
    if (!exhibitor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if exhibitor is active
    if (!exhibitor.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if exhibitor is approved
    if (exhibitor.status !== ExhibitorStatus.APPROVED) {
      if (exhibitor.status === ExhibitorStatus.PENDING) {
        throw new UnauthorizedException('Your account is pending approval. Please wait for admin approval to login and book stalls.');
      } else if (exhibitor.status === ExhibitorStatus.REJECTED) {
        throw new UnauthorizedException('Your account has been rejected. Please contact admin for more information.');
      } else if (exhibitor.status === ExhibitorStatus.SUSPENDED) {
        throw new UnauthorizedException('Your account has been suspended. Please contact admin for more information.');
      } else {
        throw new UnauthorizedException('Account not approved');
      }
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, exhibitor.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.exhibitorModel.findByIdAndUpdate(exhibitor._id, {
      lastLoginAt: new Date(),
    });

    // Generate JWT token
    const payload = { sub: exhibitor._id, email: exhibitor.email, phone: exhibitor.phone, type: 'exhibitor' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      exhibitor: this.toResponseDto(exhibitor),
    };
  }

  async update(id: string, updateDto: UpdateExhibitorDto): Promise<ExhibitorResponseDto | null> {
    const exhibitor = await this.exhibitorModel.findByIdAndUpdate(
      id,
      updateDto,
      { new: true, runValidators: true }
    );

    if (!exhibitor) {
      return null;
    }

    return this.toResponseDto(exhibitor);
  }

  async updateStatus(id: string, updateStatusDto: UpdateExhibitorStatusDto): Promise<ExhibitorResponseDto | null> {
    const { status, rejectionReason } = updateStatusDto;
    
    const updateData: any = { status };
    
    if (status === ExhibitorStatus.APPROVED) {
      updateData.approvedAt = new Date();
      updateData.rejectionReason = undefined;
    } else if (status === ExhibitorStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    const exhibitor = await this.exhibitorModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!exhibitor) {
      return null;
    }

    // TODO: Send email notification about status change
    // await this.sendStatusChangeEmail(exhibitor);

    return this.toResponseDto(exhibitor);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.exhibitorModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStats(): Promise<ExhibitorStatsDto> {
    const [stats] = await this.exhibitorModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          suspended: {
            $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
        }
      }
    ]);

    return stats || {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0,
      active: 0,
      inactive: 0,
    };
  }

  // Bulk operations
  async bulkUpdateStatus(ids: string[], status: string, rejectionReason?: string): Promise<any> {
    const updateData: any = { status };
    
    if (status === ExhibitorStatus.APPROVED) {
      updateData.approvedAt = new Date();
      updateData.rejectionReason = undefined;
    } else if (status === ExhibitorStatus.REJECTED) {
      updateData.rejectedAt = new Date();
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    return await this.exhibitorModel.updateMany(
      { _id: { $in: ids } },
      updateData
    );
  }

  async bulkDelete(ids: string[]): Promise<any> {
    return await this.exhibitorModel.deleteMany({ _id: { $in: ids } });
  }



  // Helper methods
  private toResponseDto(exhibitor: any): ExhibitorResponseDto {
    return {
      id: exhibitor._id.toString(),
      companyName: exhibitor.companyName,
      contactPerson: exhibitor.contactPerson,
      email: exhibitor.email,
      phone: exhibitor.phone,
      address: exhibitor.address,
      city: exhibitor.city,
      state: exhibitor.state,
      pinCode: exhibitor.pinCode,
      website: exhibitor.website,
      logo: exhibitor.logo,
      description: exhibitor.description,
      panNumber: exhibitor.panNumber,
      gstNumber: exhibitor.gstNumber,
      status: exhibitor.status,
      rejectionReason: exhibitor.rejectionReason,
      isActive: exhibitor.isActive,
      businessCategories: exhibitor.businessCategories,
      products: exhibitor.products,
      services: exhibitor.services,
      yearEstablished: exhibitor.yearEstablished,
      employeeCount: exhibitor.employeeCount,
      companySize: exhibitor.companySize,
      lastLoginAt: exhibitor.lastLoginAt,
      approvedAt: exhibitor.approvedAt,
      rejectedAt: exhibitor.rejectedAt,
      createdAt: exhibitor.createdAt,
      updatedAt: exhibitor.updatedAt,
    };
  }

  // TODO: Implement email services
  // private async sendCredentialsEmail(exhibitor: any, password: string): Promise<void> {
  //   // Send email with login credentials
  // }

  // private async sendStatusChangeEmail(exhibitor: any): Promise<void> {
  //   // Send email notification about status change
  // }
} 
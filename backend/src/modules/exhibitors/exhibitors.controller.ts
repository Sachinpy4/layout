import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ExhibitorsService } from './exhibitors.service';
import {
  CreateExhibitorDto,
  UpdateExhibitorDto,
  UpdateExhibitorStatusDto,
  ExhibitorQueryDto,
  ExhibitorLoginDto,
  ExhibitorFlexibleLoginDto,
  ExhibitorRegisterDto,
  ExhibitorResponseDto,
  ExhibitorListResponseDto,
  ExhibitorStatsDto,
} from '../../dto/exhibitor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('exhibitors')
@Controller('exhibitors')
export class ExhibitorsController {
  constructor(private readonly exhibitorsService: ExhibitorsService) {}

  // Public endpoints for exhibitor authentication
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new exhibitor' })
  @ApiResponse({
    status: 201,
    description: 'Exhibitor registered successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Exhibitor already exists' })
  async register(@Body() registerDto: ExhibitorRegisterDto) {
    try {
      return await this.exhibitorsService.register(registerDto);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Exhibitor with this email already exists');
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login exhibitor' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        exhibitor: { $ref: '#/components/schemas/ExhibitorResponseDto' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account not approved' })
  async login(@Body() loginDto: ExhibitorLoginDto) {
    try {
      return await this.exhibitorsService.login(loginDto);
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (error.message.includes('password')) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (error.message.includes('not approved')) {
        throw new ForbiddenException('Account not approved');
      }
      throw error;
    }
  }

  @Public()
  @Post('login-flexible')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login exhibitor with email or phone' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        exhibitor: { $ref: '#/components/schemas/ExhibitorResponseDto' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account not approved' })
  @ApiResponse({ status: 403, description: 'Account deactivated' })
  async loginFlexible(@Body() loginDto: ExhibitorFlexibleLoginDto) {
    try {
      return await this.exhibitorsService.loginWithEmailOrPhone(
        loginDto.identifier,
        loginDto.password
      );
    } catch (error) {
      // Re-throw UnauthorizedException as-is for proper error messages
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }



  // Protected endpoints for exhibitor profile management
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exhibitor profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return await this.exhibitorsService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update exhibitor profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() updateDto: UpdateExhibitorDto) {
    try {
      return await this.exhibitorsService.updateProfile(req.user.sub, updateDto);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  // Admin endpoints for exhibitor management
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Manager')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all exhibitors with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected', 'suspended'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['createdAt', 'companyName', 'status', 'contactPerson', 'updatedAt'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'Exhibitors retrieved successfully',
    type: ExhibitorListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: ExhibitorQueryDto) {
    return await this.exhibitorsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Manager')
  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exhibitor statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: ExhibitorStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getStats() {
    return await this.exhibitorsService.getStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Manager')
  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get exhibitor by ID' })
  @ApiParam({ name: 'id', description: 'Exhibitor ID' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitor retrieved successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Exhibitor not found' })
  async findOne(@Param('id') id: string) {
    const exhibitor = await this.exhibitorsService.findOne(id);
    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found');
    }
    return exhibitor;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new exhibitor (admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Exhibitor created successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Exhibitor already exists' })
  async create(@Body() createDto: CreateExhibitorDto) {
    try {
      return await this.exhibitorsService.create(createDto);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Exhibitor with this email already exists');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update exhibitor details (admin only)' })
  @ApiParam({ name: 'id', description: 'Exhibitor ID' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitor updated successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Exhibitor not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateExhibitorDto) {
    try {
      const exhibitor = await this.exhibitorsService.update(id, updateDto);
      if (!exhibitor) {
        throw new NotFoundException('Exhibitor not found');
      }
      return exhibitor;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin', 'Manager')
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update exhibitor status (approve/reject/suspend)' })
  @ApiParam({ name: 'id', description: 'Exhibitor ID' })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: ExhibitorResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Exhibitor not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateExhibitorStatusDto,
  ) {
    // Validate rejection reason
    if (updateStatusDto.status === 'rejected' && !updateStatusDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting an exhibitor');
    }

    const exhibitor = await this.exhibitorsService.updateStatus(id, updateStatusDto);
    if (!exhibitor) {
      throw new NotFoundException('Exhibitor not found');
    }
    return exhibitor;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete exhibitor (admin only)' })
  @ApiParam({ name: 'id', description: 'Exhibitor ID' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitor deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Exhibitor not found' })
  async remove(@Param('id') id: string) {
    const result = await this.exhibitorsService.remove(id);
    if (!result) {
      throw new NotFoundException('Exhibitor not found');
    }
    return { message: 'Exhibitor deleted successfully' };
  }

  // Bulk operations for admin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('bulk/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve multiple exhibitors (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitors approved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkApprove(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }
    
    const result = await this.exhibitorsService.bulkUpdateStatus(body.ids, 'approved');
    return {
      message: 'Exhibitors approved successfully',
      count: result.modifiedCount,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post('bulk/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject multiple exhibitors (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitors rejected successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkReject(@Body() body: { ids: string[]; rejectionReason?: string }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }
    
    const result = await this.exhibitorsService.bulkUpdateStatus(
      body.ids,
      'rejected',
      body.rejectionReason,
    );
    return {
      message: 'Exhibitors rejected successfully',
      count: result.modifiedCount,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete('bulk')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete multiple exhibitors (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Exhibitors deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async bulkDelete(@Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('IDs array is required');
    }
    
    const result = await this.exhibitorsService.bulkDelete(body.ids);
    return {
      message: 'Exhibitors deleted successfully',
      count: result.deletedCount,
    };
  }
} 
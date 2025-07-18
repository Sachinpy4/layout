import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto, UpdateExhibitionDto, ExhibitionResponseDto } from '../../dto/exhibition.dto';

@ApiTags('exhibitions')
@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exhibition' })
  @ApiResponse({
    status: 201,
    description: 'Exhibition created successfully',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Exhibition name already exists' })
  async create(@Body() createExhibitionDto: CreateExhibitionDto, @Request() req) {
    // TODO: Extract user ID from JWT token when auth is implemented
    // Using a valid ObjectId format for temporary admin user
    const userId = req.user?.sub || '507f1f77bcf86cd799439011';
    return this.exhibitionsService.create(createExhibitionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exhibitions' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in name or description' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of exhibitions',
  })
  async findAll(@Query() query: any) {
    // Parse numeric parameters
    if (query.page) query.page = parseInt(query.page, 10);
    if (query.limit) query.limit = parseInt(query.limit, 10);
    if (query.isActive !== undefined) query.isActive = query.isActive === 'true';
    
    return this.exhibitionsService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active published exhibitions' })
  @ApiResponse({
    status: 200,
    description: 'List of active exhibitions',
    type: [ExhibitionResponseDto],
  })
  async findActive() {
    return this.exhibitionsService.findActive();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get exhibition statistics' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition statistics',
  })
  async getStats() {
    return this.exhibitionsService.getStats();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get exhibition by slug' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition found',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.exhibitionsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exhibition by ID' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition found',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async findOne(@Param('id') id: string) {
    return this.exhibitionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update exhibition' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition updated successfully',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async update(@Param('id') id: string, @Body() updateExhibitionDto: UpdateExhibitionDto) {
    return this.exhibitionsService.update(id, updateExhibitionDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update exhibition status' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition status updated successfully',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'draft' | 'published' | 'completed',
  ) {
    return this.exhibitionsService.updateStatus(id, status);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle exhibition active status' })
  @ApiResponse({
    status: 200,
    description: 'Exhibition active status toggled successfully',
    type: ExhibitionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async toggleActive(@Param('id') id: string) {
    return this.exhibitionsService.toggleActive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an exhibition' })
  @ApiResponse({ status: 204, description: 'Exhibition deleted successfully' })
  @ApiResponse({ status: 404, description: 'Exhibition not found' })
  async remove(@Param('id') id: string) {
    return this.exhibitionsService.remove(id);
  }

  // Data integrity and repair endpoints
  @Get('utils/check-integrity')
  @ApiOperation({ summary: 'Check data integrity for exhibitions' })
  @ApiResponse({ status: 200, description: 'Data integrity check completed' })
  async checkDataIntegrity() {
    return this.exhibitionsService.checkDataIntegrity();
  }

  @Post('utils/fix-corrupted-stall-rates')
  @ApiOperation({ summary: 'Fix corrupted stallRates data in exhibitions' })
  @ApiResponse({ status: 200, description: 'Corrupted data repair completed' })
  async fixCorruptedStallRates() {
    return this.exhibitionsService.fixCorruptedStallRates();
  }
} 
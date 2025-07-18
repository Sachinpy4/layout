import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StallTypeService } from './stall-type.service';
import { CreateStallTypeDto, UpdateStallTypeDto } from '../../dto/stall-type.dto';

@ApiTags('Stall Types')
@Controller('stall-types')
export class StallTypeController {
  constructor(private readonly stallTypeService: StallTypeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stall type' })
  @ApiResponse({ status: 201, description: 'Stall type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Stall type with this name already exists' })
  async create(@Body() createStallTypeDto: CreateStallTypeDto) {
    // TODO: Add user ID when auth is properly implemented
    const defaultUserId = '507f1f77bcf86cd799439011';
    return await this.stallTypeService.create(createStallTypeDto, defaultUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stall types' })
  @ApiResponse({ status: 200, description: 'List of stall types retrieved successfully' })
  async findAll(@Query() query: any) {
    return await this.stallTypeService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get stall type statistics' })
  @ApiResponse({ status: 200, description: 'Stall type statistics retrieved successfully' })
  async getStats() {
    return await this.stallTypeService.getStats();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all stall type categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    return await this.stallTypeService.getCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stall type by ID' })
  @ApiResponse({ status: 200, description: 'Stall type retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Stall type not found' })
  async findOne(@Param('id') id: string) {
    return await this.stallTypeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a stall type' })
  @ApiResponse({ status: 200, description: 'Stall type updated successfully' })
  @ApiResponse({ status: 404, description: 'Stall type not found' })
  @ApiResponse({ status: 409, description: 'Stall type with this name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateStallTypeDto: UpdateStallTypeDto
  ) {
    // TODO: Add user ID when auth is properly implemented
    const defaultUserId = '507f1f77bcf86cd799439011';
    return await this.stallTypeService.update(id, updateStallTypeDto, defaultUserId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stall type' })
  @ApiResponse({ status: 200, description: 'Stall type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stall type not found' })
  async remove(@Param('id') id: string) {
    await this.stallTypeService.remove(id);
    return { message: 'Stall type deleted successfully' };
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get stall types by category' })
  @ApiResponse({ status: 200, description: 'Stall types retrieved successfully' })
  async findByCategory(@Param('category') category: string) {
    return await this.stallTypeService.findByCategory(category);
  }

  @Patch('sort-order/update')
  @ApiOperation({ summary: 'Update sort order for multiple stall types' })
  @ApiResponse({ status: 200, description: 'Sort order updated successfully' })
  async updateSortOrder(
    @Body() updates: { id: string; sortOrder: number }[]
  ) {
    // TODO: Add user ID when auth is properly implemented
    const defaultUserId = '507f1f77bcf86cd799439011';
    await this.stallTypeService.updateSortOrder(updates, defaultUserId);
    return { message: 'Sort order updated successfully' };
  }
} 
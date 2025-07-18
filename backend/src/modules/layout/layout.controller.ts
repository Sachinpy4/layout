import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Header
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes, ApiProduces } from '@nestjs/swagger';
// TODO: Implement authentication guards and decorators
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';
import { LayoutService } from './layout.service';
import { StallTypeService } from '../stall-type/stall-type.service';
import { FixtureTypeService } from '../fixture-type/fixture-type.service';
import { 
  CreateLayoutDto, 
  UpdateLayoutDto, 
  CreateSpaceDto, 
  UpdateSpaceDto,
  CreateHallDto,
  UpdateHallDto,
  CreateStallDto,
  UpdateStallDto,
  CreateFixtureDto,
  UpdateFixtureDto,
  BulkCreateStallsDto,
  LayoutResponseDto
} from '../../dto/layout.dto';
import { CreateStallTypeDto, UpdateStallTypeDto, StallTypeResponseDto } from '../../dto/stall-type.dto';
import { CreateFixtureTypeDto, UpdateFixtureTypeDto, FixtureTypeResponseDto } from '../../dto/fixture-type.dto';

@ApiTags('Layout Management')
@Controller('layout')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @ApiBearerAuth()
export class LayoutController {
  constructor(
    private readonly layoutService: LayoutService,
    private readonly stallTypeService: StallTypeService,
    private readonly fixtureTypeService: FixtureTypeService,
  ) {}

  // Layout CRUD Operations
  @Post()
  // // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new layout for an exhibition' })
  @ApiResponse({ status: 201, description: 'Layout created successfully', type: LayoutResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Layout already exists for this exhibition' })
  async createLayout(@Body() createLayoutDto: CreateLayoutDto, @Request() req: any) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.createLayout(createLayoutDto, userId);
  }

  @Get('exhibition/:exhibitionId')
  // @Roles('admin', 'organizer', 'staff')
  @ApiOperation({ summary: 'Get layout by exhibition ID' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 200, description: 'Layout retrieved successfully', type: LayoutResponseDto })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async getLayoutByExhibitionId(@Param('exhibitionId') exhibitionId: string) {
    return await this.layoutService.getLayoutByExhibitionId(exhibitionId);
  }

  @Put('exhibition/:exhibitionId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update layout by exhibition ID' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 200, description: 'Layout updated successfully', type: LayoutResponseDto })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async updateLayout(
    @Param('exhibitionId') exhibitionId: string, 
    @Body() updateLayoutDto: UpdateLayoutDto,
    @Request() req: any
  ) {
    try {
      console.log('=== BACKEND UPDATE LAYOUT DEBUG ===');
      console.log('Exhibition ID:', exhibitionId);
      console.log('Update Layout DTO:', JSON.stringify(updateLayoutDto, null, 2));
      console.log('Request body keys:', Object.keys(updateLayoutDto));
      
      const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
      const result = await this.layoutService.updateLayout(exhibitionId, updateLayoutDto, userId);
      
      console.log('Layout update successful');
      return result;
    } catch (error) {
      console.error('=== BACKEND UPDATE LAYOUT ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Delete('exhibition/:exhibitionId')
  // @Roles('admin', 'organizer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete layout by exhibition ID' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 204, description: 'Layout deleted successfully' })
  @ApiResponse({ status: 404, description: 'Layout not found' })
  async deleteLayout(@Param('exhibitionId') exhibitionId: string) {
    await this.layoutService.deleteLayout(exhibitionId);
  }

  // Space Operations
  @Post('exhibition/:exhibitionId/spaces')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new space in a layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 201, description: 'Space created successfully', type: LayoutResponseDto })
  async createSpace(
    @Param('exhibitionId') exhibitionId: string,
    @Body() createSpaceDto: CreateSpaceDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.createSpace(exhibitionId, createSpaceDto, userId);
  }

  @Put('exhibition/:exhibitionId/spaces/:spaceId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update a space in a layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiResponse({ status: 200, description: 'Space updated successfully', type: LayoutResponseDto })
  async updateSpace(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.updateSpace(exhibitionId, spaceId, updateSpaceDto, userId);
  }

  @Delete('exhibition/:exhibitionId/spaces/:spaceId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Delete a space from a layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiResponse({ status: 200, description: 'Space deleted successfully', type: LayoutResponseDto })
  async deleteSpace(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.deleteSpace(exhibitionId, spaceId, userId);
  }

  // Hall Operations
  @Post('exhibition/:exhibitionId/spaces/:spaceId/halls')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new hall in a space' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiResponse({ status: 201, description: 'Hall created successfully', type: LayoutResponseDto })
  async createHall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Body() createHallDto: CreateHallDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.createHall(exhibitionId, spaceId, createHallDto, userId);
  }

  @Put('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update a hall in a space' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 200, description: 'Hall updated successfully', type: LayoutResponseDto })
  async updateHall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Body() updateHallDto: UpdateHallDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.updateHall(exhibitionId, spaceId, hallId, updateHallDto, userId);
  }

  @Delete('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Delete a hall from a space' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 200, description: 'Hall deleted successfully', type: LayoutResponseDto })
  async deleteHall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.deleteHall(exhibitionId, spaceId, hallId, userId);
  }

  @Post('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId/clone')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Clone a hall with all its stalls' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 201, description: 'Hall cloned successfully', type: LayoutResponseDto })
  async cloneHall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Body('newName') newName: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.cloneHall(exhibitionId, spaceId, hallId, newName, userId);
  }

  // Stall Operations
  @Post('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId/stalls')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new stall in a hall' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 201, description: 'Stall created successfully', type: LayoutResponseDto })
  async createStall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Body() createStallDto: CreateStallDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.createStall(exhibitionId, spaceId, hallId, createStallDto, userId);
  }

  @Put('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId/stalls/:stallId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update a stall in a hall' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiParam({ name: 'stallId', description: 'Stall ID' })
  @ApiResponse({ status: 200, description: 'Stall updated successfully', type: LayoutResponseDto })
  async updateStall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Param('stallId') stallId: string,
    @Body() updateStallDto: UpdateStallDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.updateStall(exhibitionId, spaceId, hallId, stallId, updateStallDto, userId);
  }

  @Delete('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId/stalls/:stallId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Delete a stall from a hall' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiParam({ name: 'stallId', description: 'Stall ID' })
  @ApiResponse({ status: 200, description: 'Stall deleted successfully', type: LayoutResponseDto })
  async deleteStall(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Param('stallId') stallId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.deleteStall(exhibitionId, spaceId, hallId, stallId, userId);
  }

  @Post('exhibition/:exhibitionId/spaces/:spaceId/halls/:hallId/stalls/bulk')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Bulk create stalls in a hall' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'spaceId', description: 'Space ID' })
  @ApiParam({ name: 'hallId', description: 'Hall ID' })
  @ApiResponse({ status: 201, description: 'Stalls created successfully', type: LayoutResponseDto })
  async bulkCreateStalls(
    @Param('exhibitionId') exhibitionId: string,
    @Param('spaceId') spaceId: string,
    @Param('hallId') hallId: string,
    @Body() bulkCreateStallsDto: BulkCreateStallsDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.bulkCreateStalls(exhibitionId, spaceId, hallId, bulkCreateStallsDto, userId);
  }

  // Fixture Operations
  @Post('exhibition/:exhibitionId/fixtures')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new fixture in the layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 201, description: 'Fixture created successfully', type: LayoutResponseDto })
  async createFixture(
    @Param('exhibitionId') exhibitionId: string,
    @Body() createFixtureDto: CreateFixtureDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.createFixture(exhibitionId, createFixtureDto, userId);
  }

  @Put('exhibition/:exhibitionId/fixtures/:fixtureId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update a fixture in the layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'fixtureId', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Fixture updated successfully', type: LayoutResponseDto })
  async updateFixture(
    @Param('exhibitionId') exhibitionId: string,
    @Param('fixtureId') fixtureId: string,
    @Body() updateFixtureDto: UpdateFixtureDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.updateFixture(exhibitionId, fixtureId, updateFixtureDto, userId);
  }

  @Delete('exhibition/:exhibitionId/fixtures/:fixtureId')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Delete a fixture from the layout' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiParam({ name: 'fixtureId', description: 'Fixture ID' })
  @ApiResponse({ status: 200, description: 'Fixture deleted successfully', type: LayoutResponseDto })
  async deleteFixture(
    @Param('exhibitionId') exhibitionId: string,
    @Param('fixtureId') fixtureId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.deleteFixture(exhibitionId, fixtureId, userId);
  }

  // Stall Type Management
  @Get('stall-types')
  // @Roles('admin', 'organizer', 'staff')
  @ApiOperation({ summary: 'Get all stall types' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Stall types retrieved successfully', type: [StallTypeResponseDto] })
  async getStallTypes(@Query() query: any) {
    return await this.stallTypeService.findAll(query);
  }

  @Post('stall-types')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new stall type' })
  @ApiResponse({ status: 201, description: 'Stall type created successfully', type: StallTypeResponseDto })
  async createStallType(@Body() createStallTypeDto: CreateStallTypeDto, @Request() req: any) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.stallTypeService.create(createStallTypeDto, userId);
  }

  @Get('stall-types/:id')
  @ApiOperation({ summary: 'Get stall type by ID' })
  @ApiParam({ name: 'id', description: 'Stall type ID' })
  @ApiResponse({ status: 200, description: 'Stall type retrieved successfully', type: StallTypeResponseDto })
  async getStallType(@Param('id') id: string) {
    return await this.stallTypeService.findOne(id);
  }

  @Put('stall-types/:id')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update stall type' })
  @ApiParam({ name: 'id', description: 'Stall type ID' })
  @ApiResponse({ status: 200, description: 'Stall type updated successfully', type: StallTypeResponseDto })
  async updateStallType(
    @Param('id') id: string, 
    @Body() updateStallTypeDto: UpdateStallTypeDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.stallTypeService.update(id, updateStallTypeDto, userId);
  }

  @Delete('stall-types/:id')
  // @Roles('admin', 'organizer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete stall type' })
  @ApiParam({ name: 'id', description: 'Stall type ID' })
  @ApiResponse({ status: 204, description: 'Stall type deleted successfully' })
  async deleteStallType(@Param('id') id: string) {
    await this.stallTypeService.remove(id);
  }

  @Get('stall-types/category/:category')
  @ApiOperation({ summary: 'Get stall types by category' })
  @ApiParam({ name: 'category', description: 'Stall type category' })
  @ApiResponse({ status: 200, description: 'Stall types retrieved successfully', type: [StallTypeResponseDto] })
  async getStallTypesByCategory(@Param('category') category: string) {
    return await this.stallTypeService.findByCategory(category);
  }

  @Get('stall-types/stats')
  @ApiOperation({ summary: 'Get stall type statistics' })
  @ApiResponse({ status: 200, description: 'Stall type statistics retrieved successfully' })
  async getStallTypeStats() {
    return await this.stallTypeService.getStats();
  }

  // Fixture Type Management
  @Get('fixture-types')
  // @Roles('admin', 'organizer', 'staff')
  @ApiOperation({ summary: 'Get all fixture types' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'Fixture types retrieved successfully', type: [FixtureTypeResponseDto] })
  async getFixtureTypes(@Query() query: any) {
    return await this.fixtureTypeService.findAll(query);
  }

  @Post('fixture-types')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Create a new fixture type' })
  @ApiResponse({ status: 201, description: 'Fixture type created successfully', type: FixtureTypeResponseDto })
  async createFixtureType(@Body() createFixtureTypeDto: CreateFixtureTypeDto, @Request() req: any) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.fixtureTypeService.create(createFixtureTypeDto, userId);
  }

  @Get('fixture-types/:id')
  // @Roles('admin', 'organizer', 'staff')
  @ApiOperation({ summary: 'Get fixture type by ID' })
  @ApiParam({ name: 'id', description: 'Fixture type ID' })
  @ApiResponse({ status: 200, description: 'Fixture type retrieved successfully', type: FixtureTypeResponseDto })
  async getFixtureType(@Param('id') id: string) {
    return await this.fixtureTypeService.findOne(id);
  }

  @Put('fixture-types/:id')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update fixture type' })
  @ApiParam({ name: 'id', description: 'Fixture type ID' })
  @ApiResponse({ status: 200, description: 'Fixture type updated successfully', type: FixtureTypeResponseDto })
  async updateFixtureType(
    @Param('id') id: string, 
    @Body() updateFixtureTypeDto: UpdateFixtureTypeDto,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.fixtureTypeService.update(id, updateFixtureTypeDto, userId);
  }

  @Delete('fixture-types/:id')
  // @Roles('admin', 'organizer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete fixture type' })
  @ApiParam({ name: 'id', description: 'Fixture type ID' })
  @ApiResponse({ status: 204, description: 'Fixture type deleted successfully' })
  async deleteFixtureType(@Param('id') id: string) {
    await this.fixtureTypeService.remove(id);
  }

  @Get('fixture-templates')
  @ApiOperation({ summary: 'Get all fixture templates' })
  @ApiResponse({ status: 200, description: 'Fixture templates retrieved successfully' })
  async getFixtureTemplates() {
    return await this.fixtureTypeService.getTemplates();
  }

  @Get('fixture-types/category/:category')
  // @Roles('admin', 'organizer', 'staff')
  @ApiOperation({ summary: 'Get fixture types by category' })
  @ApiParam({ name: 'category', description: 'Fixture type category' })
  @ApiResponse({ status: 200, description: 'Fixture types retrieved successfully', type: [FixtureTypeResponseDto] })
  async getFixtureTypesByCategory(@Param('category') category: string) {
    return await this.fixtureTypeService.findByCategory(category);
  }

  @Get('fixture-types/stats')
  @ApiOperation({ summary: 'Get fixture type statistics' })
  @ApiResponse({ status: 200, description: 'Fixture type statistics retrieved successfully' })
  async getFixtureTypeStats() {
    return await this.fixtureTypeService.getStats();
  }

  // Export/Import Operations
  @Get('exhibition/:exhibitionId/export')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Export layout data' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiProduces('application/json')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename="layout.json"')
  async exportLayout(@Param('exhibitionId') exhibitionId: string) {
    const layoutData = await this.layoutService.exportLayout(exhibitionId);
    return new StreamableFile(Buffer.from(JSON.stringify(layoutData, null, 2)));
  }

  @Post('exhibition/:exhibitionId/import')
  @UseInterceptors(FileInterceptor('layout'))
  @ApiOperation({ summary: 'Import layout data' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Layout imported successfully', type: LayoutResponseDto })
  async importLayout(
    @Param('exhibitionId') exhibitionId: string,
    @UploadedFile() file: any, // Express.Multer.File,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    const layoutData = JSON.parse(file.buffer.toString());
    return await this.layoutService.createLayout({
      exhibitionId,
      ...layoutData
    }, userId);
  }

  @Put('exhibition/:exhibitionId/rates')
  // @Roles('admin', 'organizer')
  @ApiOperation({ summary: 'Update stall rates from exhibition configuration' })
  @ApiParam({ name: 'exhibitionId', description: 'Exhibition ID' })
  @ApiResponse({ status: 200, description: 'Stall rates updated successfully', type: LayoutResponseDto })
  async updateStallRatesFromExhibition(
    @Param('exhibitionId') exhibitionId: string,
    @Request() req: any
  ) {
    const userId = req.user?.id || '6759e0c4c4c4c4c4c4c4c4c6'; // Default user ID when auth is disabled
    return await this.layoutService.updateStallRatesFromExhibition(exhibitionId, userId);
  }
} 

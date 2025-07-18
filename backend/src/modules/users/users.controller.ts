import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SuccessResponse } from '../../dto/common.dto';

// DTOs for type safety
interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roleId: string;
  status?: 'active' | 'inactive' | 'suspended';
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

interface UsersQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@ApiTags('Users')
@Controller('users')
// @UseGuards(JwtAuthGuard) // Uncomment when guards are implemented
// @ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role name' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field (default: createdAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order (default: desc)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: UsersQueryDto) {
    const result = await this.usersService.findAll(query);
    return new SuccessResponse(result, 'Users retrieved successfully');
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getStatistics() {
    const stats = await this.usersService.getUserStatistics();
    return new SuccessResponse(stats, 'User statistics retrieved successfully');
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles() {
    const roles = await this.usersService.getRoles();
    return new SuccessResponse(roles, 'Roles retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return new SuccessResponse(user, 'User retrieved successfully');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @ApiResponse({ status: 409, description: 'User with email already exists' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const user = await this.usersService.create(createUserDto);
    return new SuccessResponse(user, 'User created successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return new SuccessResponse(user, 'User updated successfully');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'inactive' | 'suspended',
    @Request() req: any
  ) {
    const user = await this.usersService.updateStatus(id, status);
    return new SuccessResponse(user, 'User status updated successfully');
  }

  @Put(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRole(
    @Param('id') id: string,
    @Body('roleId') roleId: string,
    @Request() req: any
  ) {
    const user = await this.usersService.updateRole(id, roleId);
    return new SuccessResponse(user, 'User role updated successfully');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.usersService.remove(id);
    return new SuccessResponse(null, 'User deleted successfully');
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Param('id') id: string, @Request() req: any) {
    const result = await this.usersService.resetPassword(id);
    return new SuccessResponse(result, 'Password reset successfully');
  }

  @Get(':id/activities')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User activities retrieved successfully' })
  async getUserActivities(@Param('id') id: string) {
    const activities = await this.usersService.getUserActivities(id);
    return new SuccessResponse(activities, 'User activities retrieved successfully');
  }
} 
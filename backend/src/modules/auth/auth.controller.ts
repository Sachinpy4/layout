import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Request,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SuccessResponse } from '../../dto/common.dto';
import { JwtAuthGuard } from '../../common/guards';

// Basic DTOs (will be enhanced once class-validator is available)
interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface ExhibitorRegisterDto {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  website?: string;
  description?: string;
}

interface RefreshTokenDto {
  refreshToken: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin user login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<SuccessResponse<any>> {
    const result = await this.authService.login(loginDto.email, loginDto.password);
    return new SuccessResponse(result, 'Login successful');
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new admin/user' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return new SuccessResponse(result, 'Registration successful');
  }

  @Post('exhibitor-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exhibitor login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async exhibitorLogin(@Body() loginDto: LoginDto) {
    const result = await this.authService.exhibitorLogin(loginDto.email, loginDto.password);
    return new SuccessResponse(result, 'Login successful');
  }

  @Post('exhibitor/register')
  @ApiOperation({ summary: 'Register new exhibitor' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Exhibitor already exists' })
  async exhibitorRegister(@Body() registerDto: ExhibitorRegisterDto) {
    const result = await this.authService.exhibitorRegister(registerDto);
    return new SuccessResponse(result, 'Registration successful. Please wait for approval.');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req: any): Promise<SuccessResponse<any>> {
    const userType = req.user.type || 'user';
    const profile = await this.authService.getProfile(req.user.sub, userType);
    return new SuccessResponse(profile, 'Profile retrieved successfully');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() body: { refreshToken: string }): Promise<SuccessResponse<any>> {
    const result = await this.authService.refreshToken(body.refreshToken);
    return new SuccessResponse(result, 'Token refreshed successfully');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req: any) {
    // For stateless JWT, logout is handled on frontend
    // Could implement token blacklisting here if needed
    console.log(`User ${req.user.email} logged out successfully`);
    return new SuccessResponse(null, 'Logout successful');
  }
} 
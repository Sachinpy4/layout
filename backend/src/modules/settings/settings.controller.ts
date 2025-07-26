import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSystemSettingsDto } from '../../dto/system-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public system settings (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public system settings retrieved successfully' })
  async getPublicSystemSettings() {
    const settings = await this.settingsService.getSystemSettings();
    
    // Return only public settings that are safe to expose
    const publicSettings = {
      siteName: settings.siteName,
      headerLogo: settings.headerLogo,
      registrationEnabled: settings.registrationEnabled,
    };

    return {
      success: true,
      message: 'Public system settings retrieved successfully',
      data: publicSettings,
    };
  }

  @Get('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system settings' })
  @ApiResponse({ status: 200, description: 'System settings retrieved successfully' })
  @Roles('admin:all', 'settings:read')
  async getSystemSettings(@Request() req: any) {
    const settings = await this.settingsService.getSystemSettings();
    return {
      success: true,
      message: 'System settings retrieved successfully',
      data: settings,
    };
  }

  @Put('system')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update system settings' })
  @ApiResponse({ status: 200, description: 'System settings updated successfully' })
  @Roles('admin:all', 'settings:write')
  async updateSystemSettings(
    @Body() updateDto: UpdateSystemSettingsDto,
    @Request() req: any,
  ) {
    const settings = await this.settingsService.updateSystemSettings(
      updateDto,
      req.user?.userId,
    );
    
    return {
      success: true,
      message: 'System settings updated successfully',
      data: settings,
    };
  }

  @Post('system/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset system settings to defaults' })
  @ApiResponse({ status: 200, description: 'System settings reset successfully' })
  @Roles('admin:all')
  async resetSystemSettings() {
    const settings = await this.settingsService.resetToDefaults();
    return {
      success: true,
      message: 'System settings reset to defaults successfully',
      data: settings,
    };
  }
} 
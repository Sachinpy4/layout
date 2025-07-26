import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings } from '../../schemas/system-settings.schema';
import { UpdateSystemSettingsDto } from '../../dto/system-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(SystemSettings.name) private settingsModel: Model<SystemSettings>,
  ) {}

  async getSystemSettings(): Promise<SystemSettings> {
    // System settings is a singleton - always use the first (and only) document
    let settings = await this.settingsModel.findOne().exec();
    
    if (!settings) {
      // Create default settings if none exist
      settings = await this.settingsModel.create({
        siteName: 'Stall Booking Admin',
        defaultCurrency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        newBookingAlerts: true,
        paymentNotifications: true,
        systemAlerts: true,
      });
    }
    
    return settings;
  }

  async updateSystemSettings(
    updateDto: UpdateSystemSettingsDto,
    userId?: string,
  ): Promise<SystemSettings> {
    // Find existing settings or create new one
    let settings = await this.settingsModel.findOne().exec();
    
    const updateData = {
      ...updateDto,
      updatedBy: userId,
    };
    
    if (settings) {
      // Update existing settings
      Object.assign(settings, updateData);
      return settings.save();
    } else {
      // Create new settings document
      return this.settingsModel.create(updateData);
    }
  }

  async resetToDefaults(): Promise<SystemSettings> {
    // Delete existing settings
    await this.settingsModel.deleteMany({}).exec();
    
    // Create new default settings
    return this.settingsModel.create({
      siteName: 'Stall Booking Admin',
      defaultCurrency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      newBookingAlerts: true,
      paymentNotifications: true,
      systemAlerts: true,
    });
  }
} 
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Stall Booking API',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  getVersion() {
    return {
      version: '1.0.0',
      name: 'Stall Booking API',
      description: 'Backend API for stall booking system',
    };
  }
} 
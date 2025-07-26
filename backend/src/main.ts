import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configure payload size limits - INCREASE THESE VALUES
  app.use((req, res, next) => {
    req.setMaxListeners(100); // Increase max listeners
    next();
  });

  // Enable CORS with environment-based configuration
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];
  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'Content-Type'],
  });

  // CRITICAL FIX: Configure body parser limits for large file uploads
  const express = require('express');
  app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit
  app.use(express.urlencoded({ limit: '50mb', extended: true })); // Increase URL-encoded payload limit
  app.use(express.raw({ limit: '50mb' })); // Increase raw payload limit

  // STATIC FILE SERVING: Serve uploaded files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
    maxAge: '1d', // Cache for 1 day
    etag: true,
  });

  // Global validation pipe with detailed error messages
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Allow additional properties temporarily
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        console.log('=== VALIDATION ERRORS ===');
        console.log('Validation errors:', JSON.stringify(errors, null, 2));
        
        const errorMessages = errors.map(error => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
          children: error.children
        }));
        
        console.log('Formatted validation errors:', errorMessages);
        
        throw new Error(`Validation failed: ${JSON.stringify(errorMessages)}`);
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Stall Booking API')
    .setDescription('API for stall booking system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('stalls', 'Stall management endpoints')
    .addTag('bookings', 'Booking management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('upload', 'File upload endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  const host = process.env.HOSTNAME || '0.0.0.0';
  
  await app.listen(port, host);
  console.log(`Backend server running on http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${corsOrigins.join(', ')}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/stall_booking_new'}`);
  console.log(`Static files served from: ${join(__dirname, '..', 'uploads')}`);
  console.log(`Upload endpoint: http://${host}:${port}/uploads/`);
}

bootstrap().catch(error => {
  console.error('Application failed to start:', error);
  process.exit(1);
}); 
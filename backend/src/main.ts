import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Frontend and admin panel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('Backend server running on http://localhost:3001');
}
bootstrap(); 
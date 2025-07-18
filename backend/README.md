# Stall Booking Backend

A modern NestJS backend API for the stall booking system using MongoDB.

## 🚀 Features

- **NestJS Framework**: Modern Node.js framework for building scalable server-side applications
- **MongoDB Database**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure authentication using JSON Web Tokens
- **API Documentation**: Swagger/OpenAPI documentation
- **Modular Architecture**: Clean separation of concerns with modules
- **TypeScript**: Full TypeScript support with strict typing
- **Validation**: Request validation using class-validator
- **CORS**: Cross-origin resource sharing enabled

## 📁 Project Structure

```
src/
├── config/           # Configuration files
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # User management
│   ├── stalls/       # Stall management
│   ├── bookings/     # Booking management
│   └── payments/     # Payment processing
├── common/           # Shared utilities
│   ├── dto/          # Data Transfer Objects
│   ├── guards/       # Route guards
│   ├── decorators/   # Custom decorators
│   ├── pipes/        # Custom pipes
│   └── filters/      # Exception filters
├── app.module.ts     # Main application module
├── app.controller.ts # Main application controller
├── app.service.ts    # Main application service
└── main.ts          # Application entry point
```

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

## ⚙️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configurations
```

3. Make sure MongoDB is running on your system

## 🏃 Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## 📚 API Documentation

Once the application is running, you can access the API documentation at:
- **Swagger UI**: http://localhost:3001/api/docs

## 🧪 Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 🔧 Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Build application
npm run build
```

## 📊 Database Schema

The application uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `stalls` - Stall information and details
- `bookings` - Booking records and status
- `payments` - Payment transactions

## 🔐 Environment Variables

```env
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/stall_booking

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Other configurations
API_PREFIX=api/v1
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
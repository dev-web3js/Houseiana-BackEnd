import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));

  // Rate limiting
  app.use(rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_TTL) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  // Compression middleware
  app.use(compression());
  
  // Enable CORS for frontend connection
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://houseiana.com',
      'https://www.houseiana.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Houseiana API')
    .setDescription(`
      🏠 **Houseiana Backend API Documentation**
      
      Comprehensive REST API for the Houseiana platform - World-class global short-term rental marketplace.
      
      ## Features
      - 🔐 **Authentication & Authorization** - JWT-based user authentication
      - 🏡 **Property Management** - Complete CRUD operations for listings
      - 📅 **Booking System** - Full booking lifecycle management
      - 💬 **Messaging** - Real-time messaging between hosts and guests
      - 📱 **Mobile Support** - Push notifications and mobile-optimized endpoints
      - ✅ **KYC Verification** - Document verification for hosts
      - 🔍 **Advanced Search** - Location-based and filtered property search
      - ⭐ **Reviews & Ratings** - User and property review system
      
      ## Authentication
      Most endpoints require JWT token authentication. Include the token in the Authorization header:
      \`Authorization: Bearer <your_jwt_token>\`
      
      ## Global Platform Features
      - Multi-currency support (USD, EUR, GBP, QAR, AUD, CAD and more)
      - Multi-language translation support (20+ languages)
      - Regional compliance frameworks
      - Worldwide property locations
    `)
    .setVersion('1.0.0')
    .setContact(
      'Houseiana Support',
      'https://houseiana.com',
      'support@houseiana.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token'
      },
      'JWT-auth'
    )
    .addServer('http://localhost:5001', 'Development Server')
    .addServer('https://api.houseiana.com', 'Production Server')
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Properties', 'Property listings management')
    .addTag('Bookings', 'Booking system operations')
    .addTag('Users', 'User profile and account management')
    .addTag('Messages', 'Messaging between users')
    .addTag('Notifications', 'Push notifications and alerts')
    .addTag('KYC', 'Know Your Customer verification')
    .addTag('Search', 'Property and content search')
    .addTag('Reviews', 'Reviews and ratings')
    .addTag('Upload', 'File upload services')
    .addTag('Verification', 'Email and phone verification')
    .addTag('Tax Forms', 'Tax information for hosts')
    .addTag('Health', 'System health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Houseiana API Documentation',
    customfavIcon: 'https://houseiana.com/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  // Set global prefix (excluding swagger docs)
  app.setGlobalPrefix('api', { exclude: ['/', 'api-docs'] });
  
  const port = process.env.PORT || 5001;
  await app.listen(port);
  
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});

// Tracing will be initialized inside bootstrap function

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { secretsService } from './config/secrets.js';
// import { TracingMiddleware, shutdownTracing } from './tracing.js';

async function bootstrap() {
  try {
    console.log('🚀 Starting Houseiana Backend...');

    // Initialize tracing if enabled
    if (process.env.ENABLE_TRACING !== 'false') {
      try {
        const { initializeTracing } = await import('./tracing.js');
        initializeTracing();
        console.log('✅ Tracing initialized');
      } catch (error) {
        console.warn('⚠️  Tracing initialization failed, continuing without tracing:', error.message);
      }
    }

    // Load secrets in production, but don't fail startup if secrets fail
    if (process.env.NODE_ENV === 'production') {
      try {
        await secretsService.loadSecrets();
        console.log('✅ Secrets loaded successfully');
      } catch (error) {
        console.warn('⚠️  Failed to load secrets from AWS Secrets Manager:', error.message);
        console.log('🔄 Continuing with environment variables...');
      }
    }
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

  // Tracing middleware
  // app.use(new TracingMiddleware().use);

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

  // Set global prefix
  app.setGlobalPrefix('api', { exclude: ['/'] });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  } catch (error) {
    console.error('❌ Error starting server:', error);
    // await shutdownTracing();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  // await shutdownTracing();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  // await shutdownTracing();
  process.exit(0);
});

bootstrap().catch(async (err) => {
  console.error('❌ Error starting server:', err);
  // await shutdownTracing();
  process.exit(1);
});

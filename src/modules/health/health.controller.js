import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Controller('api/health')
export class HealthController {
  constructor(prisma) {
    this.prisma = prisma;
  }

  @Get()
  async check() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  @Get('database')
  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      return { status: 'error', database: 'disconnected', error: error.message };
    }
  }
}
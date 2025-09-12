import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { KycService } from './kyc.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('KYC')
@Controller('api/kyc')
export class KycController {
  constructor(kycService) {
    this.kycService = kycService;
  }

  // Start KYC verification process
  @Post('start')
  @UseGuards(JwtStrategy)
  async startKyc(@Request() req, @Body() kycData) {
    return this.kycService.startKyc(req.user.id, kycData);
  }

  // Upload KYC documents
  @Post('upload')
  @UseGuards(JwtStrategy)
  async uploadDocument(@Request() req, @Body() body) {
    const { documentType, documentUrl, additionalData } = body;
    return this.kycService.uploadDocument(req.user.id, documentType, documentUrl, additionalData);
  }

  // Get KYC status
  @Get('status')
  @UseGuards(JwtStrategy)
  async getKycStatus(@Request() req) {
    return this.kycService.getKycStatus(req.user.id);
  }

  // Get all KYC submissions (admin only)
  @Get('admin/all')
  @UseGuards(JwtStrategy)
  async getAllKycSubmissions(@Query() query) {
    // TODO: Add admin role check
    return this.kycService.getAllKycSubmissions(query);
  }

  // Update KYC status (admin only)
  @Patch('admin/status/:userId')
  @UseGuards(JwtStrategy)
  async updateKycStatus(@Param('userId') userId, @Body() body) {
    // TODO: Add admin role check
    const { status, rejectionReason } = body;
    return this.kycService.updateKycStatus(userId, status, rejectionReason);
  }

  // Delete KYC verification
  @Post('delete')
  @UseGuards(JwtStrategy)
  async deleteKyc(@Request() req) {
    return this.kycService.deleteKyc(req.user.id);
  }
}
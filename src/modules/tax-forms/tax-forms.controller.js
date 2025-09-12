import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TaxFormsService } from './tax-forms.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Tax Forms')
@Controller('api/tax-forms')
export class TaxFormsController {
  constructor(taxFormsService) {
    this.taxFormsService = taxFormsService;
  }

  // Submit tax information
  @Post()
  @UseGuards(JwtStrategy)
  async submitTaxInfo(@Request() req, @Body() taxInfoDto) {
    return this.taxFormsService.submitTaxInfo(req.user.id, taxInfoDto);
  }

  // Get tax information
  @Get()
  @UseGuards(JwtStrategy)
  async getTaxInfo(@Request() req) {
    return this.taxFormsService.getTaxInfo(req.user.id);
  }

  // Upload W9 form
  @Post('w9-upload')
  @UseGuards(JwtStrategy)
  async uploadW9Form(@Request() req, @Body() body) {
    const { fileUrl } = body;
    return this.taxFormsService.uploadW9Form(req.user.id, fileUrl);
  }

  // Get tax summary/reports
  @Get('summary')
  @UseGuards(JwtStrategy)
  async getTaxSummary(@Request() req, @Query('year') year) {
    return this.taxFormsService.getTaxSummary(req.user.id, year ? parseInt(year) : undefined);
  }

  // Update tax status (admin endpoint)
  @Patch('status/:userId')
  @UseGuards(JwtStrategy)
  async updateTaxStatus(@Param('userId') userId, @Body() body) {
    const { status, adminNotes } = body;
    return this.taxFormsService.updateTaxStatus(userId, status, adminNotes);
  }
}
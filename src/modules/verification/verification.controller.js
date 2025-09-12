import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VerificationService } from './verification.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Verification')
@Controller('api/verification')
export class VerificationController {
  constructor(verificationService) {
    this.verificationService = verificationService;
  }

  // Send email verification
  @Post('email/send')
  @UseGuards(JwtStrategy)
  async sendEmailVerification(@Request() req) {
    return this.verificationService.sendEmailVerification(req.user.id);
  }

  // Verify email
  @Post('email/verify')
  @UseGuards(JwtStrategy)
  async verifyEmail(@Request() req, @Body() body) {
    return this.verificationService.verifyEmail(req.user.id, body.code);
  }

  // Send phone verification (new endpoint structure)
  @Post('phone-verification/send')
  @UseGuards(JwtStrategy)
  async sendPhoneVerificationCode(@Request() req, @Body() body) {
    return this.verificationService.sendPhoneVerificationCode(req.user.id, body.phoneNumber, body.method || 'sms');
  }

  // Verify phone (new endpoint structure)
  @Post('phone-verification/verify')
  @UseGuards(JwtStrategy)
  async verifyPhoneCode(@Request() req, @Body() body) {
    return this.verificationService.verifyPhoneCode(req.user.id, body.phoneNumber, body.code);
  }

  // Send phone verification (legacy support)
  @Post('phone/send')
  @UseGuards(JwtStrategy)
  async sendPhoneVerification(@Request() req, @Body() body) {
    return this.verificationService.sendPhoneVerificationCode(req.user.id, body.phoneNumber, body.method || 'sms');
  }

  // Verify phone (legacy support)
  @Post('phone/verify')
  @UseGuards(JwtStrategy)
  async verifyPhone(@Request() req, @Body() body) {
    return this.verificationService.verifyPhoneCode(req.user.id, body.phoneNumber, body.code);
  }
}
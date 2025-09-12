import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { VerificationService } from './verification.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

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

  // Send phone verification
  @Post('phone/send')
  @UseGuards(JwtStrategy)
  async sendPhoneVerification(@Request() req, @Body() body) {
    return this.verificationService.sendPhoneVerification(req.user.id, body.phoneNumber);
  }

  // Verify phone
  @Post('phone/verify')
  @UseGuards(JwtStrategy)
  async verifyPhone(@Request() req, @Body() body) {
    return this.verificationService.verifyPhone(req.user.id, body.code);
  }
}
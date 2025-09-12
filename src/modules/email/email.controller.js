import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EmailService } from './email.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@Controller('api/email')
export class EmailController {
  constructor(emailService) {
    this.emailService = emailService;
  }

  // Send test email (for development/testing)
  @Post('test')
  @UseGuards(JwtStrategy)
  async sendTestEmail(@Request() req, @Body() body) {
    const { email, firstName } = body;
    return this.emailService.sendWelcomeEmail(
      email || req.user.email, 
      firstName || req.user.firstName
    );
  }

  // Send welcome email
  @Post('welcome')
  @UseGuards(JwtStrategy)
  async sendWelcomeEmail(@Request() req, @Body() body) {
    const { email, firstName } = body;
    return this.emailService.sendWelcomeEmail(
      email || req.user.email, 
      firstName || req.user.firstName
    );
  }

  // Send booking notification
  @Post('booking-notification')
  @UseGuards(JwtStrategy)  
  async sendBookingNotification(@Request() req, @Body() body) {
    const { email, bookingDetails, type } = body;
    return this.emailService.sendBookingNotification(
      email || req.user.email,
      bookingDetails,
      type
    );
  }
}
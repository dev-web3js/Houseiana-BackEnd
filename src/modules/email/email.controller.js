import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service.js';

@ApiTags('Email')
@Controller('api/email')
export class EmailController {
  constructor(emailService) {
    this.emailService = emailService;
  }

  @Post('test')
  @ApiOperation({ 
    summary: 'Test email functionality',
    description: 'Send a test email to verify SendGrid integration is working'
  })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  async testEmail(@Body() body) {
    const { email, type = 'welcome', name = 'Test User' } = body;

    if (!email) {
      return {
        success: false,
        message: 'Email address is required'
      };
    }

    try {
      let result;
      
      switch (type) {
        case 'welcome':
          result = await this.emailService.sendWelcomeEmail(email, name);
          break;
          
        case 'verification':
          result = await this.emailService.sendVerificationEmail(email, '123456', name);
          break;
          
        case 'password-reset':
          result = await this.emailService.sendPasswordResetEmail(email, 'test-token-123', name);
          break;
          
        case 'booking-confirmation':
          const mockBooking = {
            propertyTitle: 'Luxury Apartment in Manhattan',
            bookingCode: 'HB-2024-001',
            checkIn: '2024-12-25',
            checkOut: '2024-12-30',
            adults: 2,
            children: 0,
            totalNights: 5,
            totalPrice: 2500,
            id: 'test-booking-123'
          };
          result = await this.emailService.sendBookingConfirmationEmail(email, name, mockBooking);
          break;
          
        case 'booking-reminder':
          const mockReminder = {
            propertyTitle: 'Luxury Apartment in Manhattan',
            bookingCode: 'HB-2024-001',
            checkIn: '2024-12-25',
            checkOut: '2024-12-30',
            id: 'test-booking-123'
          };
          result = await this.emailService.sendBookingReminderEmail(email, name, mockReminder);
          break;
          
        case 'search-alert':
          const mockProperties = [
            {
              id: '1',
              title: 'Modern Studio in SoHo',
              city: 'New York',
              area: 'SoHo',
              monthlyPrice: 3200,
              bedrooms: 1,
              maxGuests: 2
            },
            {
              id: '2', 
              title: 'Penthouse with City View',
              city: 'New York',
              area: 'Manhattan',
              monthlyPrice: 5500,
              bedrooms: 3,
              maxGuests: 6
            }
          ];
          const mockCriteria = {
            city: 'New York',
            propertyType: 'apartment',
            minPrice: 2000,
            maxPrice: 6000
          };
          result = await this.emailService.sendSearchAlertEmail(email, name, mockCriteria, mockProperties);
          break;
          
        default:
          return {
            success: false,
            message: 'Invalid email type. Use: welcome, verification, password-reset, booking-confirmation, booking-reminder, or search-alert'
          };
      }

      return {
        success: true,
        message: `Test ${type} email sent successfully to ${email}`,
        result
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test email',
        error: error.message
      };
    }
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Check email service status',
    description: 'Check if SendGrid is properly configured'
  })
  @ApiResponse({ status: 200, description: 'Email service status' })
  async getEmailStatus() {
    return {
      service: 'SendGrid',
      configured: !!process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@houseiana.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'Houseiana',
      appUrl: process.env.APP_URL || 'https://houseiana.com'
    };
  }
}
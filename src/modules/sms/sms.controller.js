import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { SmsService } from './sms.service.js';

class SendOTPDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number in international format' })
  phoneNumber;

  @ApiProperty({ example: 'sms', enum: ['sms', 'whatsapp', 'call'], description: 'Verification channel' })
  channel;

  @ApiProperty({ example: 'login', enum: ['login', 'registration', 'password-reset'], description: 'OTP purpose', required: false })
  purpose;
}

class VerifyOTPDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number in international format' })
  phoneNumber;

  @ApiProperty({ example: '123456', description: '6-digit verification code' })
  code;
}

class SendSMSDto {
  @ApiProperty({ example: '+1234567890', description: 'Phone number in international format' })
  phoneNumber;

  @ApiProperty({ example: 'Your booking has been confirmed!', description: 'SMS message content' })
  message;
}

@ApiTags('SMS & WhatsApp')
@Controller('api/sms')
export class SmsController {
  constructor(smsService) {
    this.smsService = smsService;
  }

  @Post('send-otp')
  @ApiOperation({ 
    summary: 'Send OTP via SMS or WhatsApp',
    description: 'Send a verification code for login, registration, or password reset'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        messageId: { type: 'string' }
      }
    }
  })
  async sendOTP(@Body() body) {
    const { phoneNumber, channel = 'sms', purpose = 'login' } = body;

    if (!phoneNumber) {
      return {
        success: false,
        message: 'Phone number is required'
      };
    }

    try {
      let result;

      switch (channel.toLowerCase()) {
        case 'sms':
          result = await this.smsService.sendSmsOTP(phoneNumber);
          break;
          
        case 'whatsapp':
          result = await this.smsService.sendWhatsAppOTP(phoneNumber);
          break;
          
        case 'verify':
          // Use Twilio Verify service (recommended for production)
          result = await this.smsService.sendVerifyOTP(phoneNumber, 'sms');
          break;
          
        case 'verify-whatsapp':
          result = await this.smsService.sendVerifyOTP(phoneNumber, 'whatsapp');
          break;
          
        default:
          return {
            success: false,
            message: 'Invalid channel. Use: sms, whatsapp, verify, or verify-whatsapp'
          };
      }

      return {
        success: true,
        message: `OTP sent via ${channel} for ${purpose}`,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send OTP',
        error: error.message
      };
    }
  }

  @Post('verify-otp')
  @ApiOperation({ 
    summary: 'Verify OTP code',
    description: 'Verify the OTP code sent via Twilio Verify service'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP verification result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        status: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  async verifyOTP(@Body() body) {
    const { phoneNumber, code } = body;

    if (!phoneNumber || !code) {
      return {
        success: false,
        message: 'Phone number and verification code are required'
      };
    }

    try {
      const result = await this.smsService.verifyOTP(phoneNumber, code);
      
      return {
        success: result.success,
        status: result.status,
        message: result.message
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to verify OTP',
        error: error.message
      };
    }
  }

  @Post('send-custom')
  @ApiOperation({ 
    summary: 'Send custom SMS message',
    description: 'Send a custom SMS message to any phone number'
  })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  async sendCustomSMS(@Body() body) {
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return {
        success: false,
        message: 'Phone number and message content are required'
      };
    }

    try {
      const result = await this.smsService.sendSMS(phoneNumber, message);
      
      return {
        success: true,
        message: 'SMS sent successfully',
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send SMS',
        error: error.message
      };
    }
  }

  @Post('booking-reminder')
  @ApiOperation({ 
    summary: 'Send booking reminder SMS',
    description: 'Send a booking reminder SMS with property details'
  })
  @ApiResponse({ status: 200, description: 'Booking reminder sent successfully' })
  async sendBookingReminder(@Body() body) {
    const { phoneNumber, bookingDetails } = body;

    if (!phoneNumber) {
      return {
        success: false,
        message: 'Phone number is required'
      };
    }

    // Use mock booking details if not provided
    const booking = bookingDetails || {
      propertyTitle: 'Luxury Apartment in Manhattan',
      bookingCode: 'HB-2024-001',
      checkIn: '2024-12-25',
      checkOut: '2024-12-30',
      totalPrice: 2500
    };

    try {
      const result = await this.smsService.sendBookingReminderSMS(phoneNumber, booking);
      
      return {
        success: true,
        message: 'Booking reminder SMS sent successfully',
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send booking reminder',
        error: error.message
      };
    }
  }

  @Post('booking-confirmation')
  @ApiOperation({ 
    summary: 'Send booking confirmation SMS',
    description: 'Send a booking confirmation SMS with reservation details'
  })
  @ApiResponse({ status: 200, description: 'Booking confirmation sent successfully' })
  async sendBookingConfirmation(@Body() body) {
    const { phoneNumber, bookingDetails } = body;

    if (!phoneNumber) {
      return {
        success: false,
        message: 'Phone number is required'
      };
    }

    // Use mock booking details if not provided
    const booking = bookingDetails || {
      propertyTitle: 'Luxury Apartment in Manhattan',
      bookingCode: 'HB-2024-001',
      checkIn: '2024-12-25',
      checkOut: '2024-12-30',
      totalPrice: 2500
    };

    try {
      const result = await this.smsService.sendBookingConfirmationSMS(phoneNumber, booking);
      
      return {
        success: true,
        message: 'Booking confirmation SMS sent successfully',
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to send booking confirmation',
        error: error.message
      };
    }
  }

  @Get('status')
  @ApiOperation({ 
    summary: 'Check SMS service status',
    description: 'Check Twilio configuration and available features'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'SMS service status',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        configured: { type: 'boolean' },
        accountSid: { type: 'string' },
        fromNumber: { type: 'string' },
        features: { type: 'object' }
      }
    }
  })
  async getStatus() {
    return this.smsService.getServiceStatus();
  }

  @Post('test-all')
  @ApiOperation({ 
    summary: 'Test all SMS/WhatsApp functionality',
    description: 'Send test messages via SMS, WhatsApp, and Verify service'
  })
  @ApiResponse({ status: 200, description: 'Test results' })
  async testAllFeatures(@Body() body) {
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return {
        success: false,
        message: 'Phone number is required for testing'
      };
    }

    const results = {};

    try {
      // Test SMS OTP
      try {
        results.smsOTP = await this.smsService.sendSmsOTP(phoneNumber);
      } catch (error) {
        results.smsOTP = { success: false, error: error.message };
      }

      // Test WhatsApp OTP
      try {
        results.whatsappOTP = await this.smsService.sendWhatsAppOTP(phoneNumber);
      } catch (error) {
        results.whatsappOTP = { success: false, error: error.message };
      }

      // Test Verify service
      try {
        results.verifyService = await this.smsService.sendVerifyOTP(phoneNumber, 'sms');
      } catch (error) {
        results.verifyService = { success: false, error: error.message };
      }

      // Test custom SMS
      try {
        results.customSMS = await this.smsService.sendSMS(
          phoneNumber, 
          '🏠 Welcome to Houseiana! This is a test message from our global platform. 🌍'
        );
      } catch (error) {
        results.customSMS = { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'All SMS/WhatsApp tests completed',
        phoneNumber: phoneNumber,
        results: results,
        serviceStatus: this.smsService.getServiceStatus()
      };

    } catch (error) {
      return {
        success: false,
        message: 'Test execution failed',
        error: error.message,
        partialResults: results
      };
    }
  }
}
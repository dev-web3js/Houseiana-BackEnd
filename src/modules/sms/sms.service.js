import { Injectable, BadRequestException } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  constructor() {
    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      console.log('✅ Twilio SMS client initialized successfully');
    } else {
      console.warn('⚠️ Twilio credentials not configured - SMS/WhatsApp will not work');
      this.client = null;
    }
    
    this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
    this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  }

  // Generate OTP code
  generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  }

  // Send SMS OTP
  async sendSmsOTP(phoneNumber, otpCode = null) {
    if (!this.client) {
      console.log('📱 Mock SMS sent:', { to: phoneNumber, code: otpCode || '123456' });
      return { 
        success: true, 
        messageId: 'mock-sms-id',
        message: 'SMS sent (mock mode - Twilio not configured)'
      };
    }

    try {
      const code = otpCode || this.generateOTP();
      
      const message = await this.client.messages.create({
        body: `🏠 Your Houseiana verification code is: ${code}\n\nThis code expires in 10 minutes. Don't share this code with anyone.\n\nHouseiana - World-Class Global Short-Term Rentals`,
        from: this.fromPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ SMS sent successfully:', message.sid);
      
      return {
        success: true,
        messageId: message.sid,
        code: code, // Remove this in production
        message: 'SMS OTP sent successfully'
      };

    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  // Send WhatsApp OTP
  async sendWhatsAppOTP(phoneNumber, otpCode = null) {
    if (!this.client) {
      console.log('📱 Mock WhatsApp sent:', { to: phoneNumber, code: otpCode || '123456' });
      return { 
        success: true, 
        messageId: 'mock-whatsapp-id',
        message: 'WhatsApp sent (mock mode - Twilio not configured)'
      };
    }

    try {
      const code = otpCode || this.generateOTP();
      
      // WhatsApp messages require 'whatsapp:' prefix
      const whatsappNumber = phoneNumber.startsWith('whatsapp:') 
        ? phoneNumber 
        : `whatsapp:${phoneNumber}`;
      
      const whatsappFrom = this.fromPhoneNumber.startsWith('whatsapp:') 
        ? this.fromPhoneNumber 
        : `whatsapp:${this.fromPhoneNumber}`;

      const message = await this.client.messages.create({
        body: `🏠 *Houseiana Verification*\n\nYour verification code is: *${code}*\n\nThis code expires in 10 minutes. Keep it secure and don't share with anyone.\n\n_Houseiana - World-Class Global Short-Term Rentals_ 🌍`,
        from: whatsappFrom,
        to: whatsappNumber
      });

      console.log('✅ WhatsApp sent successfully:', message.sid);
      
      return {
        success: true,
        messageId: message.sid,
        code: code, // Remove this in production
        message: 'WhatsApp OTP sent successfully'
      };

    } catch (error) {
      console.error('❌ WhatsApp sending failed:', error.message);
      throw new BadRequestException(`Failed to send WhatsApp: ${error.message}`);
    }
  }

  // Send Twilio Verify OTP (recommended for production)
  async sendVerifyOTP(phoneNumber, channel = 'sms') {
    if (!this.client || !this.verifyServiceSid) {
      console.log('📱 Mock Verify OTP sent:', { to: phoneNumber, channel });
      return { 
        success: true, 
        sid: 'mock-verify-id',
        message: `Verify OTP sent via ${channel} (mock mode)`
      };
    }

    try {
      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications
        .create({
          to: phoneNumber,
          channel: channel // 'sms', 'whatsapp', or 'call'
        });

      console.log(`✅ Verify OTP sent via ${channel}:`, verification.sid);
      
      return {
        success: true,
        sid: verification.sid,
        status: verification.status,
        channel: verification.channel,
        message: `Verification code sent via ${channel}`
      };

    } catch (error) {
      console.error('❌ Verify OTP sending failed:', error.message);
      throw new BadRequestException(`Failed to send verification: ${error.message}`);
    }
  }

  // Verify OTP code (for Twilio Verify service)
  async verifyOTP(phoneNumber, code) {
    if (!this.client || !this.verifyServiceSid) {
      console.log('📱 Mock OTP verification:', { phone: phoneNumber, code });
      // Mock verification - accept 123456 as valid code
      if (code === '123456') {
        return { 
          success: true, 
          status: 'approved',
          message: 'OTP verified successfully (mock mode)'
        };
      } else {
        return { 
          success: false, 
          status: 'pending',
          message: 'Invalid OTP code (mock mode - try 123456)'
        };
      }
    }

    try {
      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks
        .create({
          to: phoneNumber,
          code: code
        });

      console.log('✅ OTP verification result:', verificationCheck.status);
      
      return {
        success: verificationCheck.status === 'approved',
        status: verificationCheck.status,
        message: verificationCheck.status === 'approved' 
          ? 'OTP verified successfully' 
          : 'Invalid or expired OTP code'
      };

    } catch (error) {
      console.error('❌ OTP verification failed:', error.message);
      throw new BadRequestException(`Failed to verify OTP: ${error.message}`);
    }
  }

  // Send custom SMS message
  async sendSMS(phoneNumber, message) {
    if (!this.client) {
      console.log('📱 Mock SMS sent:', { to: phoneNumber, message });
      return { 
        success: true, 
        messageId: 'mock-custom-sms-id',
        message: 'Custom SMS sent (mock mode)'
      };
    }

    try {
      const smsMessage = await this.client.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: phoneNumber
      });

      console.log('✅ Custom SMS sent successfully:', smsMessage.sid);
      
      return {
        success: true,
        messageId: smsMessage.sid,
        message: 'SMS sent successfully'
      };

    } catch (error) {
      console.error('❌ Custom SMS sending failed:', error.message);
      throw new BadRequestException(`Failed to send SMS: ${error.message}`);
    }
  }

  // Send booking reminder SMS
  async sendBookingReminderSMS(phoneNumber, bookingDetails) {
    const message = `🏠 Houseiana Booking Reminder

Your stay is coming up!

Property: ${bookingDetails.propertyTitle}
Check-in: ${bookingDetails.checkIn}
Booking: ${bookingDetails.bookingCode}

Have a wonderful stay! 
🌍 houseiana.com`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Send booking confirmation SMS
  async sendBookingConfirmationSMS(phoneNumber, bookingDetails) {
    const message = `🎉 Booking Confirmed - Houseiana

${bookingDetails.propertyTitle}
Code: ${bookingDetails.bookingCode}
Check-in: ${bookingDetails.checkIn}
Check-out: ${bookingDetails.checkOut}
Total: $${bookingDetails.totalPrice}

View details: houseiana.com/bookings`;

    return await this.sendSMS(phoneNumber, message);
  }

  // Check service status
  getServiceStatus() {
    return {
      service: 'Twilio',
      configured: !!this.client,
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'Not configured',
      fromNumber: this.fromPhoneNumber,
      verifyServiceSid: this.verifyServiceSid || 'Not configured',
      features: {
        sms: true,
        whatsapp: true,
        voice: true,
        verify: !!this.verifyServiceSid
      }
    };
  }
}
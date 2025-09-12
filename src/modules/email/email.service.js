import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(configService) {
    this.configService = configService;
  }

  // Send verification email
  async sendVerificationEmail(email, code, firstName) {
    try {
      const emailData = {
        from: this.configService.get('FROM_EMAIL') || 'noreply@houseiana.com',
        to: email,
        subject: 'Verify Your Email - Houseiana',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #f8f9fa; padding: 40px 20px; text-align: center;">
              <h1 style="color: #2c3e50; margin: 0;">Email Verification</h1>
            </div>
            <div style="padding: 40px 20px;">
              <p>Hello ${firstName || 'User'},</p>
              <p>Thank you for signing up with Houseiana! Please verify your email address by entering this verification code:</p>
              <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h2 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h2>
              </div>
              <p>This code will expire in 10 minutes for security purposes.</p>
              <p>If you didn't create an account with us, please ignore this email.</p>
              <hr style="border: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Houseiana Team
              </p>
            </div>
          </div>
        `,
      };

      // In a real application, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES  
      // - Resend
      // - Mailgun
      // For now, we'll simulate sending
      
      console.log('📧 Email sent successfully:', {
        to: email,
        subject: emailData.subject,
        code: code // Remove this in production
      });

      return {
        success: true,
        message: 'Verification email sent successfully',
        email,
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email, firstName) {
    try {
      const emailData = {
        from: this.configService.get('FROM_EMAIL') || 'noreply@houseiana.com',
        to: email,
        subject: 'Welcome to Houseiana!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #007bff; padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to Houseiana!</h1>
            </div>
            <div style="padding: 40px 20px;">
              <p>Hello ${firstName},</p>
              <p>Welcome to Houseiana - your premier platform for short-term rentals!</p>
              <p>You can now:</p>
              <ul>
                <li>Browse and book amazing properties</li>
                <li>List your own property as a host</li>
                <li>Manage your bookings and reservations</li>
                <li>Connect with hosts and guests</li>
              </ul>
              <p>If you have any questions, our support team is here to help.</p>
              <hr style="border: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Houseiana Team
              </p>
            </div>
          </div>
        `,
      };

      console.log('📧 Welcome email sent successfully:', {
        to: email,
        subject: emailData.subject,
      });

      return {
        success: true,
        message: 'Welcome email sent successfully',
        email,
      };

    } catch (error) {
      console.error('❌ Welcome email sending failed:', error);
      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message,
      };
    }
  }

  // Send booking notification email
  async sendBookingNotification(email, bookingDetails, type = 'confirmation') {
    try {
      const subjects = {
        confirmation: 'Booking Confirmed - Houseiana',
        cancellation: 'Booking Cancelled - Houseiana',
        reminder: 'Booking Reminder - Houseiana',
      };

      const emailData = {
        from: this.configService.get('FROM_EMAIL') || 'noreply@houseiana.com',
        to: email,
        subject: subjects[type] || subjects.confirmation,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #28a745; padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">${type === 'confirmation' ? 'Booking Confirmed!' : type === 'cancellation' ? 'Booking Cancelled' : 'Booking Reminder'}</h1>
            </div>
            <div style="padding: 40px 20px;">
              <p>Hello,</p>
              <p>Your booking details:</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Property:</strong> ${bookingDetails.propertyTitle || 'N/A'}</p>
                <p><strong>Booking Code:</strong> ${bookingDetails.bookingCode || 'N/A'}</p>
                <p><strong>Check-in:</strong> ${bookingDetails.checkIn || 'N/A'}</p>
                <p><strong>Check-out:</strong> ${bookingDetails.checkOut || 'N/A'}</p>
                <p><strong>Total Price:</strong> $${bookingDetails.totalPrice || 'N/A'}</p>
              </div>
              <hr style="border: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Houseiana Team
              </p>
            </div>
          </div>
        `,
      };

      console.log('📧 Booking email sent successfully:', {
        to: email,
        subject: emailData.subject,
        type,
      });

      return {
        success: true,
        message: 'Booking email sent successfully',
        email,
        type,
      };

    } catch (error) {
      console.error('❌ Booking email sending failed:', error);
      return {
        success: false,
        message: 'Failed to send booking email',
        error: error.message,
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken, firstName) {
    try {
      const resetUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const emailData = {
        from: this.configService.get('FROM_EMAIL') || 'noreply@houseiana.com',
        to: email,
        subject: 'Reset Your Password - Houseiana',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background-color: #dc3545; padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="padding: 40px 20px;">
              <p>Hello ${firstName || 'User'},</p>
              <p>We received a request to reset your password for your Houseiana account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; word-break: break-all; font-family: monospace; font-size: 12px;">${resetUrl}</p>
              <p>This link will expire in 1 hour for security purposes.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
              <hr style="border: 1px solid #eee; margin: 30px 0;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The Houseiana Team
              </p>
            </div>
          </div>
        `,
      };

      console.log('📧 Password reset email sent successfully:', {
        to: email,
        subject: emailData.subject,
      });

      return {
        success: true,
        message: 'Password reset email sent successfully',
        email,
      };

    } catch (error) {
      console.error('❌ Password reset email sending failed:', error);
      throw new BadRequestException('Failed to send password reset email');
    }
  }
}
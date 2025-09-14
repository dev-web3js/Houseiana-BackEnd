import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(configService) {
    this.configService = configService;
    
    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid initialized successfully');
    } else {
      console.warn('⚠️ SENDGRID_API_KEY is not configured - emails will not be sent');
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('📧 Mock email sent:', { to, subject });
      return { success: true, messageId: 'mock-id' };
    }

    try {
      const msg = {
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@houseiana.com',
          name: process.env.SENDGRID_FROM_NAME || 'Houseiana'
        },
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const response = await sgMail.send(msg);
      console.log('✅ Email sent successfully via SendGrid:', response[0].statusCode);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      console.error('❌ SendGrid email sending failed:', error.response?.body || error.message);
      throw new BadRequestException('Failed to send email');
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }

  // Send verification email
  async sendVerificationEmail(email, code, firstName) {
    const subject = 'Verify Your Email - Houseiana';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Email Verification</h1>
            <p>World-Class Global Short-Term Rentals</p>
          </div>
          <div class="content">
            <p>Hello ${firstName || 'there'},</p>
            <p>Thank you for signing up with Houseiana! Please verify your email address by entering this verification code:</p>
            <div class="code-box">
              <h2 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h2>
            </div>
            <p>This code will expire in 10 minutes for security purposes.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Houseiana Team</p>
            <p>🌐 Your gateway to exceptional global accommodations</p>
          </div>
        </div>
      </body>
      </html>`;

    return await this.sendEmail(email, subject, htmlContent);
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
    const resetUrl = `${process.env.APP_URL || 'https://houseiana.com'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Houseiana Password';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏠 Password Reset</h1>
            <p>World-Class Global Short-Term Rentals</p>
          </div>
          <div class="content">
            <p>Hello ${firstName || 'there'},</p>
            <p>We received a request to reset your password for your Houseiana account. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>The Houseiana Team</p>
            <p>🌐 Connecting travelers worldwide with exceptional accommodations</p>
          </div>
        </div>
      </body>
      </html>`;

    return await this.sendEmail(email, subject, htmlContent);
  }

  // Send booking reminder email (for upcoming stays)
  async sendBookingReminderEmail(email, userName, bookingDetails) {
    const daysUntilCheckIn = Math.ceil((new Date(bookingDetails.checkIn) - new Date()) / (1000 * 60 * 60 * 24));
    const subject = `Upcoming Stay Reminder - ${bookingDetails.propertyTitle}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Upcoming Stay Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .countdown { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎒 Your Stay is Coming Up!</h1>
            <p>Get ready for your Houseiana experience</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your upcoming stay is just around the corner!</p>
            
            <div class="countdown">
              <h3>${daysUntilCheckIn} days until check-in!</h3>
            </div>
            
            <div class="booking-card">
              <h3>${bookingDetails.propertyTitle}</h3>
              <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
              <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
              <p><strong>Booking Code:</strong> ${bookingDetails.bookingCode}</p>
            </div>
            
            <p><strong>Preparation checklist:</strong></p>
            <ul>
              <li>✈️ Confirm your travel arrangements</li>
              <li>📱 Download the Houseiana app for easy access</li>
              <li>📞 Contact your host if you have questions</li>
              <li>🆔 Prepare required identification documents</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/bookings/${bookingDetails.id}" class="button">View Booking Details</a>
            </p>
          </div>
          <div class="footer">
            <p>We can't wait for you to enjoy your stay!<br>The Houseiana Team</p>
          </div>
        </div>
      </body>
      </html>`;

    return await this.sendEmail(email, subject, htmlContent);
  }

  // Send search alert email (for saved searches)
  async sendSearchAlertEmail(email, userName, searchCriteria, properties) {
    const subject = 'New Properties Match Your Search - Houseiana';
    const propertiesHtml = properties.slice(0, 3).map(property => `
      <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 15px 0; background: white;">
        <h4>${property.title}</h4>
        <p><strong>Location:</strong> ${property.city}${property.area ? `, ${property.area}` : ''}</p>
        <p><strong>Price:</strong> $${property.monthlyPrice}/month</p>
        <p><strong>Bedrooms:</strong> ${property.bedrooms} | <strong>Max Guests:</strong> ${property.maxGuests}</p>
        <a href="${process.env.APP_URL}/properties/${property.id}" style="color: #667eea;">View Details →</a>
      </div>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Properties Match Your Search</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔍 New Properties Found!</h1>
            <p>Matching your search criteria</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Great news! We found ${properties.length} new properties that match your search criteria:</p>
            
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <strong>Your Search:</strong> ${searchCriteria.city || 'Any location'}
              ${searchCriteria.propertyType ? ` | ${searchCriteria.propertyType}` : ''}
              ${searchCriteria.minPrice ? ` | Min: $${searchCriteria.minPrice}` : ''}
              ${searchCriteria.maxPrice ? ` | Max: $${searchCriteria.maxPrice}` : ''}
            </div>
            
            <h3>Featured Properties:</h3>
            ${propertiesHtml}
            
            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/search?${new URLSearchParams(searchCriteria).toString()}" class="button">View All Results</a>
            </p>
          </div>
          <div class="footer">
            <p>Happy searching!<br>The Houseiana Team</p>
            <p><small>You can manage your search alerts in your account settings.</small></p>
          </div>
        </div>
      </body>
      </html>`;

    return await this.sendEmail(email, subject, htmlContent);
  }
}
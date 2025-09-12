import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class VerificationService {
  constructor(prisma, emailService) {
    this.prisma = prisma;
    this.emailService = emailService;
  }

  // Send email verification
  async sendEmailVerification(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // In a real app, you'd send an actual email here
    // For now, we'll just simulate the process
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store verification code
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
        user.firstName || user.name
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Still return success since the code was stored
    }

    return {
      success: true,
      message: 'Verification email sent successfully',
      email: user.email,
      // In production, don't return the code
      code: verificationCode,
    };
  }

  // Verify email
  async verifyEmail(userId, code) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (user.emailVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (user.emailVerificationExpires < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        emailVerifiedAt: true,
      },
    });

    return updatedUser;
  }

  // Send phone verification with method support
  async sendPhoneVerificationCode(userId, phoneNumber, method = 'sms') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate 6-digit verification code as expected by frontend
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: phoneNumber,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        phoneVerificationMethod: method,
      },
    });

    // In a real app, you'd integrate with SMS/WhatsApp services here
    const message = method === 'whatsapp' 
      ? 'WhatsApp verification code sent successfully'
      : 'SMS verification code sent successfully';

    return {
      success: true,
      message,
      method,
      phoneNumber,
      // In production, don't return the code
      code: verificationCode,
    };
  }

  // Legacy method for backward compatibility
  async sendPhoneVerification(userId, phoneNumber) {
    return this.sendPhoneVerificationCode(userId, phoneNumber, 'sms');
  }

  // Verify phone with enhanced response format
  async verifyPhoneCode(userId, phoneNumber, code) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.phoneVerified) {
      return {
        success: true,
        verified: true,
        message: 'Phone is already verified',
        phoneNumber: user.phone,
      };
    }

    if (user.phoneVerificationCode !== code) {
      return {
        success: false,
        verified: false,
        message: 'Invalid verification code',
        phoneNumber,
      };
    }

    if (user.phoneVerificationExpires < new Date()) {
      return {
        success: false,
        verified: false,
        message: 'Verification code has expired',
        phoneNumber,
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
      select: {
        id: true,
        phone: true,
        phoneVerified: true,
        phoneVerifiedAt: true,
      },
    });

    return {
      success: true,
      verified: true,
      message: 'Phone verified successfully',
      phoneNumber: updatedUser.phone,
      verifiedAt: updatedUser.phoneVerifiedAt,
    };
  }

  // Legacy method for backward compatibility
  async verifyPhone(userId, code) {
    const result = await this.verifyPhoneCode(userId, null, code);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    return {
      id: userId,
      phone: result.phoneNumber,
      phoneVerified: result.verified,
      phoneVerifiedAt: result.verifiedAt,
    };
  }
}
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class VerificationService {
  constructor(prisma) {
    this.prisma = prisma;
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

    // Store verification code (you might want to use a separate table for this)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationCode: verificationCode,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    return {
      message: 'Verification email sent successfully',
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

  // Send phone verification
  async sendPhoneVerification(userId, phoneNumber) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In a real app, you'd send an SMS here
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: phoneNumber,
        phoneVerificationCode: verificationCode,
        phoneVerificationExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    return {
      message: 'SMS verification code sent successfully',
      // In production, don't return the code
      code: verificationCode,
    };
  }

  // Verify phone
  async verifyPhone(userId, code) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.phoneVerified) {
      throw new BadRequestException('Phone is already verified');
    }

    if (user.phoneVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (user.phoneVerificationExpires < new Date()) {
      throw new BadRequestException('Verification code has expired');
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

    return updatedUser;
  }
}
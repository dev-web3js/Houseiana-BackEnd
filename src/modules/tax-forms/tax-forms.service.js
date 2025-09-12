import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class TaxFormsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Submit tax information
  async submitTaxInfo(userId, taxInfoDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isHost: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isHost) {
      throw new BadRequestException('Only hosts can submit tax information');
    }

    // Check if tax info already exists
    const existingTaxInfo = await this.prisma.taxInfo.findUnique({
      where: { hostId: userId },
    });

    let taxInfo;
    if (existingTaxInfo) {
      // Update existing tax info
      taxInfo = await this.prisma.taxInfo.update({
        where: { hostId: userId },
        data: {
          ...taxInfoDto,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new tax info
      taxInfo = await this.prisma.taxInfo.create({
        data: {
          ...taxInfoDto,
          hostId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'Tax information submitted successfully',
      taxInfo: {
        id: taxInfo.id,
        status: taxInfo.status || 'pending',
        submittedAt: taxInfo.updatedAt,
      },
    };
  }

  // Get tax information
  async getTaxInfo(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isHost: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const taxInfo = await this.prisma.taxInfo.findUnique({
      where: { hostId: userId },
      select: {
        id: true,
        taxIdNumber: true,
        businessName: true,
        businessAddress: true,
        taxClassification: true,
        w9FormUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!taxInfo) {
      return {
        success: true,
        message: 'No tax information found',
        taxInfo: null,
      };
    }

    return {
      success: true,
      message: 'Tax information retrieved successfully',
      taxInfo,
    };
  }

  // Upload W9 form
  async uploadW9Form(userId, fileUrl) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isHost: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isHost) {
      throw new BadRequestException('Only hosts can upload tax forms');
    }

    // Update or create tax info with W9 form URL
    const taxInfo = await this.prisma.taxInfo.upsert({
      where: { hostId: userId },
      update: {
        w9FormUrl: fileUrl,
        updatedAt: new Date(),
      },
      create: {
        hostId: userId,
        w9FormUrl: fileUrl,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'W9 form uploaded successfully',
      w9FormUrl: taxInfo.w9FormUrl,
    };
  }

  // Get tax summary/reports
  async getTaxSummary(userId, year) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isHost: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isHost) {
      throw new BadRequestException('Only hosts can view tax summaries');
    }

    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    // Get completed bookings for tax year
    const bookings = await this.prisma.booking.findMany({
      where: {
        hostId: userId,
        status: 'COMPLETED',
        checkOut: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        bookingCode: true,
        checkIn: true,
        checkOut: true,
        totalPrice: true,
        cleaningFee: true,
        serviceFee: true,
        taxes: true,
        Listing: {
          select: {
            title: true,
            city: true,
          },
        },
      },
    });

    // Calculate totals
    const totalGrossIncome = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    const totalCleaningFees = bookings.reduce((sum, booking) => sum + (booking.cleaningFee || 0), 0);
    const totalServiceFees = bookings.reduce((sum, booking) => sum + (booking.serviceFee || 0), 0);
    const totalTaxes = bookings.reduce((sum, booking) => sum + (booking.taxes || 0), 0);

    // Calculate net income (gross - fees - taxes)
    const netIncome = totalGrossIncome - totalServiceFees - totalTaxes;

    return {
      success: true,
      message: 'Tax summary retrieved successfully',
      taxSummary: {
        year: currentYear,
        totalBookings: bookings.length,
        totalGrossIncome,
        totalCleaningFees,
        totalServiceFees,
        totalTaxes,
        netIncome,
        bookings: bookings.map(booking => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          propertyTitle: booking.Listing?.title,
          propertyCity: booking.Listing?.city,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.totalPrice,
          cleaningFee: booking.cleaningFee,
          serviceFee: booking.serviceFee,
          taxes: booking.taxes,
        })),
      },
    };
  }

  // Update tax information status (admin only)
  async updateTaxStatus(userId, status, adminNotes = '') {
    const taxInfo = await this.prisma.taxInfo.findUnique({
      where: { hostId: userId },
    });

    if (!taxInfo) {
      throw new NotFoundException('Tax information not found');
    }

    const updatedTaxInfo = await this.prisma.taxInfo.update({
      where: { hostId: userId },
      data: {
        status,
        adminNotes,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Tax status updated successfully',
      status: updatedTaxInfo.status,
      reviewedAt: updatedTaxInfo.reviewedAt,
    };
  }
}
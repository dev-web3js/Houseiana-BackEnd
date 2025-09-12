import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class KycService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Start KYC verification process
  async startKyc(userId, kycData) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if KYC process already exists
    const existingKyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    let kyc;
    if (existingKyc) {
      // Update existing KYC
      kyc = await this.prisma.kycVerification.update({
        where: { userId },
        data: {
          ...kycData,
          status: 'pending',
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new KYC verification
      kyc = await this.prisma.kycVerification.create({
        data: {
          userId,
          ...kycData,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: 'KYC verification process started successfully',
      kycId: kyc.id,
      status: kyc.status,
    };
  }

  // Upload KYC documents
  async uploadDocument(userId, documentType, documentUrl, additionalData = {}) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new BadRequestException('KYC verification process not started');
    }

    // Create document record
    const document = await this.prisma.kycDocument.create({
      data: {
        kycVerificationId: kyc.id,
        documentType,
        documentUrl,
        fileName: additionalData.fileName || '',
        fileSize: additionalData.fileSize || 0,
        mimeType: additionalData.mimeType || '',
        status: 'uploaded',
        createdAt: new Date(),
      },
    });

    // Update KYC verification status
    await this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: {
        status: 'document_uploaded',
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Document uploaded successfully',
      documentId: document.id,
      documentType: document.documentType,
      status: 'uploaded',
    };
  }

  // Get KYC status
  async getKycStatus(userId) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
      include: {
        KycDocument: {
          select: {
            id: true,
            documentType: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!kyc) {
      return {
        success: true,
        message: 'No KYC verification found',
        status: 'not_started',
        kyc: null,
      };
    }

    const statusDetails = {
      not_started: { message: 'KYC verification not started', step: 0 },
      pending: { message: 'KYC verification pending', step: 1 },
      document_uploaded: { message: 'Documents uploaded, under review', step: 2 },
      under_review: { message: 'KYC under review', step: 3 },
      approved: { message: 'KYC verification approved', step: 4 },
      rejected: { message: 'KYC verification rejected', step: -1 },
    };

    return {
      success: true,
      message: 'KYC status retrieved successfully',
      status: kyc.status,
      statusDetails: statusDetails[kyc.status] || statusDetails.pending,
      kyc: {
        id: kyc.id,
        status: kyc.status,
        submittedAt: kyc.createdAt,
        lastUpdated: kyc.updatedAt,
        documents: kyc.KycDocument,
        rejectionReason: kyc.rejectionReason,
      },
    };
  }

  // Update KYC status (admin function)
  async updateKycStatus(userId, status, rejectionReason = '') {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC verification not found');
    }

    const updatedKyc = await this.prisma.kycVerification.update({
      where: { id: kyc.id },
      data: {
        status,
        rejectionReason: rejectionReason || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update user verification status if approved
    if (status === 'approved') {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: `KYC status updated to ${status}`,
      status: updatedKyc.status,
      reviewedAt: updatedKyc.reviewedAt,
    };
  }

  // Get all KYC submissions (admin function)
  async getAllKycSubmissions(query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [kycs, total] = await Promise.all([
      this.prisma.kycVerification.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
          },
          KycDocument: {
            select: {
              id: true,
              documentType: true,
              status: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.kycVerification.count({ where }),
    ]);

    return {
      success: true,
      message: 'KYC submissions retrieved successfully',
      data: kycs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Delete KYC verification (user or admin)
  async deleteKyc(userId) {
    const kyc = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC verification not found');
    }

    // Delete associated documents first
    await this.prisma.kycDocument.deleteMany({
      where: { kycVerificationId: kyc.id },
    });

    // Delete KYC verification
    await this.prisma.kycVerification.delete({
      where: { id: kyc.id },
    });

    return {
      success: true,
      message: 'KYC verification deleted successfully',
    };
  }
}
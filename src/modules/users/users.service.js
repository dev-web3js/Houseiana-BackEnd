import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Become a host
  async becomeHost(userId, becomeHostDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isHost: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isHost) {
      throw new BadRequestException('User is already a host');
    }

    // Update user to host
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isHost: true,
        role: user.role === 'guest' ? 'host' : 'both',
        hostSince: new Date(),
        bio: becomeHostDto.bio,
        governmentId: becomeHostDto.governmentId,
        governmentIdType: becomeHostDto.governmentIdType,
        tradeLicense: becomeHostDto.tradeLicense,
        bankName: becomeHostDto.bankName,
        accountNumber: becomeHostDto.accountNumber,
        accountHolderName: becomeHostDto.accountHolderName,
        iban: becomeHostDto.iban,
        swiftCode: becomeHostDto.swiftCode,
        propertyDocs: becomeHostDto.propertyDocs,
        hostVerified: 'pending',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isHost: true,
        role: true,
        hostSince: true,
        hostVerified: true,
      },
    });

    return updatedUser;
  }

  // Get user profile
  async getProfile(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        username: true,
        phone: true,
        phoneNumber: true,
        phoneVerified: true,
        role: true,
        isHost: true,
        isAdmin: true,
        hostVerified: true,
        hostSince: true,
        responseRate: true,
        responseTime: true,
        totalEarnings: true,
        bio: true,
        profileImage: true,
        coverImage: true,
        language: true,
        currency: true,
        timezone: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        twoFactorEnabled: true,
        emailVerified: true,
        emailVerifiedAt: true,
        phoneVerifiedAt: true,
        lastLoginAt: true,
        lastActiveAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            Listing: true,
            Booking_Booking_guestIdToUser: true,
            Booking_Booking_hostIdToUser: true,
            Review_Review_reviewerIdToUser: true,
            Review_Review_revieweeIdToUser: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId, updateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email or username is being changed and already exists
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateProfileDto.username && updateProfileDto.username !== user.username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username: updateProfileDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        username: true,
        phone: true,
        phoneNumber: true,
        bio: true,
        profileImage: true,
        coverImage: true,
        language: true,
        currency: true,
        timezone: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Get user notifications
  async getNotifications(userId, query = {}) {
    const { type, read, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { userId };
    if (type) where.type = type;
    if (read !== undefined) where.read = read === 'true';

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          Booking: {
            select: {
              id: true,
              bookingCode: true,
              Listing: {
                select: {
                  id: true,
                  title: true,
                  photos: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    // Count unread notifications
    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updatedNotification = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { 
        read: true,
        isRead: true,
        readAt: new Date(),
      },
    });

    return updatedNotification;
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { 
        read: true,
        isRead: true,
        readAt: new Date(),
      },
    });

    return { message: 'All notifications marked as read' };
  }

  // Update notification preferences
  async updateNotificationPreferences(userId, preferences) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        pushNotifications: preferences.pushNotifications,
        marketingEmails: preferences.marketingEmails,
        notificationSettings: preferences.customSettings || {},
      },
      select: {
        id: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        marketingEmails: true,
        notificationSettings: true,
      },
    });

    return updatedUser;
  }

  // Update privacy settings
  async updatePrivacySettings(userId, privacySettings) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        privacySettings,
      },
      select: {
        id: true,
        privacySettings: true,
      },
    });

    return updatedUser;
  }

  // Get user statistics (for dashboard)
  async getUserStats(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        isHost: true,
        totalEarnings: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = {};

    // Guest stats
    const guestBookings = await this.prisma.booking.count({
      where: { guestId: userId },
    });

    const completedStays = await this.prisma.booking.count({
      where: { guestId: userId, status: 'COMPLETED' },
    });

    stats.guest = {
      totalBookings: guestBookings,
      completedStays,
    };

    // Host stats (if applicable)
    if (user.isHost) {
      const [
        totalProperties,
        activeProperties,
        totalBookings,
        totalEarnings,
        averageRating,
        reviewCount,
      ] = await Promise.all([
        this.prisma.listing.count({
          where: { hostId: userId },
        }),
        this.prisma.listing.count({
          where: { hostId: userId, status: 'active', isActive: true },
        }),
        this.prisma.booking.count({
          where: { hostId: userId },
        }),
        this.prisma.booking.aggregate({
          where: { hostId: userId, status: 'COMPLETED' },
          _sum: { totalPrice: true },
        }),
        this.prisma.review.aggregate({
          where: { revieweeId: userId },
          _avg: { overall: true },
        }),
        this.prisma.review.count({
          where: { revieweeId: userId },
        }),
      ]);

      stats.host = {
        totalProperties,
        activeProperties,
        totalBookings,
        totalEarnings: totalEarnings._sum.totalPrice || 0,
        averageRating: averageRating._avg.overall || 0,
        reviewCount,
      };
    }

    return stats;
  }

  // Delete user account (soft delete)
  async deleteAccount(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException('Account is already deleted');
    }

    // Soft delete - mark as deleted but keep data for legal/financial reasons
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        email: `deleted_${userId}@houseiana.com`,
        username: `deleted_${userId}`,
        isActive: false,
      },
    });

    // Deactivate all user's properties
    await this.prisma.listing.updateMany({
      where: { hostId: userId },
      data: {
        isActive: false,
        status: 'inactive',
      },
    });

    return { message: 'Account deleted successfully' };
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class NotificationsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Register push notification token
  async registerPushToken(userId, deviceToken, platform = 'mobile') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if token already exists
    const existingToken = await this.prisma.pushToken.findFirst({
      where: {
        userId,
        deviceToken,
      },
    });

    if (existingToken) {
      // Update existing token
      const updatedToken = await this.prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          platform,
          isActive: true,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Push token updated successfully',
        tokenId: updatedToken.id,
      };
    }

    // Create new token
    const pushToken = await this.prisma.pushToken.create({
      data: {
        userId,
        deviceToken,
        platform,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Push token registered successfully',
      tokenId: pushToken.id,
    };
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
              checkIn: true,
              checkOut: true,
              Listing: {
                select: {
                  id: true,
                  title: true,
                  photos: true,
                  city: true,
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
      success: true,
      message: 'Notifications retrieved successfully',
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
  async markAsRead(notificationId, userId) {
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

    return {
      success: true,
      message: 'Notification marked as read',
      notification: updatedNotification,
    };
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { 
        read: true,
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  // Create notification
  async createNotification(userId, notificationData) {
    const { type, title, message, data = {}, relatedId } = notificationData;

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data),
        relatedId,
        read: false,
        isRead: false,
        createdAt: new Date(),
      },
    });

    // Send push notification if user has active tokens
    await this.sendPushNotification(userId, title, message, data);

    return {
      success: true,
      message: 'Notification created successfully',
      notification,
    };
  }

  // Send push notification
  async sendPushNotification(userId, title, message, data = {}) {
    // Get user's active push tokens
    const pushTokens = await this.prisma.pushToken.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (pushTokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`);
      return;
    }

    // In a real application, you would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNs) for iOS
    // - Expo Push Notifications for React Native Expo apps

    // For now, we'll simulate sending push notifications
    for (const token of pushTokens) {
      try {
        console.log(`📱 Push notification sent to ${token.platform} device:`, {
          userId,
          deviceToken: token.deviceToken,
          title,
          message,
          data,
        });

        // Here you would call the actual push notification service
        // Example for Expo:
        // await this.expoPushService.sendNotification({
        //   to: token.deviceToken,
        //   title,
        //   body: message,
        //   data,
        // });

      } catch (error) {
        console.error(`Failed to send push notification to device ${token.deviceToken}:`, error);
        
        // Mark token as inactive if it fails
        await this.prisma.pushToken.update({
          where: { id: token.id },
          data: { isActive: false },
        });
      }
    }
  }

  // Create booking notification
  async createBookingNotification(bookingId, type = 'booking_created') {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        Listing: {
          select: {
            title: true,
            User: {
              select: { id: true, firstName: true },
            },
          },
        },
        Guest: {
          select: { id: true, firstName: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const notificationTemplates = {
      booking_created: {
        title: 'New Booking Request',
        message: `${booking.Guest.firstName} has requested to book ${booking.Listing.title}`,
        recipientId: booking.hostId,
      },
      booking_confirmed: {
        title: 'Booking Confirmed',
        message: `Your booking for ${booking.Listing.title} has been confirmed`,
        recipientId: booking.guestId,
      },
      booking_cancelled: {
        title: 'Booking Cancelled',
        message: `Booking for ${booking.Listing.title} has been cancelled`,
        recipientId: booking.hostId === booking.guestId ? booking.hostId : booking.guestId,
      },
      check_in_reminder: {
        title: 'Check-in Reminder',
        message: `Your stay at ${booking.Listing.title} starts tomorrow`,
        recipientId: booking.guestId,
      },
    };

    const template = notificationTemplates[type];
    if (!template) {
      throw new BadRequestException('Invalid notification type');
    }

    return this.createNotification(template.recipientId, {
      type: 'booking',
      title: template.title,
      message: template.message,
      data: { bookingId, type },
      relatedId: bookingId,
    });
  }

  // Remove push token (logout)
  async removePushToken(userId, deviceToken) {
    await this.prisma.pushToken.updateMany({
      where: {
        userId,
        deviceToken,
      },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Push token removed successfully',
    };
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }
}
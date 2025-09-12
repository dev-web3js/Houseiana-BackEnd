import { Controller, Get, Post, Body, Patch, Param, Query, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(notificationsService) {
    this.notificationsService = notificationsService;
  }

  // Register push notification token
  @Post('register-token')
  @UseGuards(JwtStrategy)
  async registerPushToken(@Request() req, @Body() body) {
    const { deviceToken, platform } = body;
    return this.notificationsService.registerPushToken(req.user.id, deviceToken, platform);
  }

  // Get user notifications
  @Get()
  @UseGuards(JwtStrategy)
  async getNotifications(@Request() req, @Query() query) {
    return this.notificationsService.getNotifications(req.user.id, query);
  }

  // Mark notification as read
  @Patch(':id/read')
  @UseGuards(JwtStrategy)
  async markAsRead(@Param('id') notificationId, @Request() req) {
    return this.notificationsService.markAsRead(notificationId, req.user.id);
  }

  // Mark all notifications as read
  @Patch('mark-all-read')
  @UseGuards(JwtStrategy)
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  // Create notification (internal/admin use)
  @Post()
  @UseGuards(JwtStrategy)
  async createNotification(@Request() req, @Body() body) {
    const { userId, ...notificationData } = body;
    return this.notificationsService.createNotification(
      userId || req.user.id, 
      notificationData
    );
  }

  // Create booking notification
  @Post('booking/:bookingId')
  @UseGuards(JwtStrategy)
  async createBookingNotification(@Param('bookingId') bookingId, @Body() body) {
    const { type } = body;
    return this.notificationsService.createBookingNotification(bookingId, type);
  }

  // Remove push token
  @Delete('token')
  @UseGuards(JwtStrategy)
  async removePushToken(@Request() req, @Body() body) {
    const { deviceToken } = body;
    return this.notificationsService.removePushToken(req.user.id, deviceToken);
  }

  // Delete notification
  @Delete(':id')
  @UseGuards(JwtStrategy)
  async deleteNotification(@Param('id') notificationId, @Request() req) {
    return this.notificationsService.deleteNotification(notificationId, req.user.id);
  }
}
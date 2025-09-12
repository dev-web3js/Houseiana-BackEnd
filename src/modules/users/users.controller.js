import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { BecomeHostDto } from './dto/become-host.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@Controller('api/users')
export class UsersController {
  constructor(usersService) {
    this.usersService = usersService;
  }

  // Apply to become a host
  @Post('become-host')
  @UseGuards(JwtStrategy)
  async becomeHost(@Request() req, @Body() becomeHostDto) {
    return this.usersService.becomeHost(req.user.id, becomeHostDto);
  }

  // Get user profile
  @Get('profile')
  @UseGuards(JwtStrategy)
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  // Update user profile
  @Patch('profile')
  @UseGuards(JwtStrategy)
  async updateProfile(@Request() req, @Body() updateProfileDto) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  // Get notifications
  @Get('notifications')
  @UseGuards(JwtStrategy)
  async getNotifications(@Request() req, @Query() query) {
    return this.usersService.getNotifications(req.user.id, query);
  }

  // Mark notification as read
  @Patch('notifications/:id/read')
  @UseGuards(JwtStrategy)
  async markNotificationAsRead(@Request() req, @Param('id') notificationId) {
    return this.usersService.markNotificationAsRead(req.user.id, notificationId);
  }

  // Mark all notifications as read
  @Patch('notifications/mark-all-read')
  @UseGuards(JwtStrategy)
  async markAllNotificationsAsRead(@Request() req) {
    return this.usersService.markAllNotificationsAsRead(req.user.id);
  }

  // Update notification preferences
  @Patch('preferences/notifications')
  @UseGuards(JwtStrategy)
  async updateNotificationPreferences(@Request() req, @Body() preferences) {
    return this.usersService.updateNotificationPreferences(req.user.id, preferences);
  }

  // Update privacy settings
  @Patch('preferences/privacy')
  @UseGuards(JwtStrategy)
  async updatePrivacySettings(@Request() req, @Body() privacySettings) {
    return this.usersService.updatePrivacySettings(req.user.id, privacySettings);
  }

  // Get user statistics
  @Get('stats')
  @UseGuards(JwtStrategy)
  async getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }

  // Delete account
  @Delete('account')
  @UseGuards(JwtStrategy)
  async deleteAccount(@Request() req) {
    return this.usersService.deleteAccount(req.user.id);
  }
}
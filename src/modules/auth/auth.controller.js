import { Controller, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('api/auth')
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  async register(@Body() registerDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto) {
    return this.authService.login(loginDto);
  }

  // Request password reset
  @Post('forgot-password')
  async forgotPassword(@Body() body) {
    const { email } = body;
    return this.authService.forgotPassword(email);
  }

  // Reset password with token
  @Post('reset-password')
  async resetPassword(@Body() body) {
    const { resetToken, newPassword } = body;
    return this.authService.resetPassword(resetToken, newPassword);
  }

  // Change password for authenticated users
  @Patch('change-password')
  async changePassword(@Request() req, @Body() body) {
    const { currentPassword, newPassword } = body;
    return this.authService.changePassword(req.user?.id, currentPassword, newPassword);
  }
}
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('api/auth')
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  async register(registerDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(loginDto) {
    return this.authService.login(loginDto);
  }
}
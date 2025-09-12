import { Controller, Post, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Create a new user account. Returns user information and JWT token for immediate login.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        password: { type: 'string', minLength: 6, example: 'securePassword123' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+974 1234 5678' },
        role: { type: 'string', enum: ['guest', 'host', 'both'], example: 'guest' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp1234567890' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            role: { type: 'string', example: 'guest' },
            isHost: { type: 'boolean', example: false }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT token on success.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'securePassword123' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp1234567890' },
            email: { type: 'string', example: 'john.doe@example.com' },
            firstName: { type: 'string', example: 'John' },
            role: { type: 'string', example: 'guest' },
            isHost: { type: 'boolean', example: false }
          }
        },
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user. Returns success even if email not found for security.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', example: 'john.doe@example.com' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  async forgotPassword(@Body() body) {
    const { email } = body;
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Reset user password using the token received via email.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['resetToken', 'newPassword'],
      properties: {
        resetToken: { type: 'string', example: 'abc123def456' },
        newPassword: { type: 'string', minLength: 6, example: 'newSecurePassword123' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(@Body() body) {
    const { resetToken, newPassword } = body;
    return this.authService.resetPassword(resetToken, newPassword);
  }

  @Patch('change-password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change password',
    description: 'Change password for authenticated user. Requires current password verification.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['currentPassword', 'newPassword'],
      properties: {
        currentPassword: { type: 'string', example: 'currentPassword123' },
        newPassword: { type: 'string', minLength: 6, example: 'newSecurePassword123' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(@Request() req, @Body() body) {
    const { currentPassword, newPassword } = body;
    return this.authService.changePassword(req.user?.id, currentPassword, newPassword);
  }
}
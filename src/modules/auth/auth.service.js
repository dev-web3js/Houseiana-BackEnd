import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(prisma, jwtService) {
    this.prisma = prisma;
    this.jwtService = jwtService;
  }

  async register(registerDto) {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      name,
      username,
      phone, 
      phoneNumber,
      role = 'guest',
      bio 
    } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await this.prisma.user.findUnique({
        where: { username }
      });

      if (existingUsername) {
        throw new BadRequestException('Username already taken');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with existing schema fields
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword, // Using existing field name
        firstName,
        lastName,
        name,
        username,
        phone,
        phoneNumber,
        role,
        bio,
        isHost: role === 'host' || role === 'both',
        emailVerified: false,
        phoneVerified: false,
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
        role: true,
        isHost: true,
        bio: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    });

    return {
      user,
      token,
    };
  }

  async login(loginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is suspended or deleted
    if (user.suspendedAt || user.deletedAt) {
      throw new UnauthorizedException('Account is suspended or deactivated');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastActiveAt: new Date()
      }
    });

    // Generate JWT token
    const token = this.jwtService.sign({ 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        username: user.username,
        phone: user.phone,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isHost: user.isHost,
        bio: user.bio,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async validateUser(userId) {
    return this.prisma.user.findUnique({
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
        role: true,
        isHost: true,
        isAdmin: true,
        bio: true,
        profileImage: true,
        emailVerified: true,
        phoneVerified: true,
        suspendedAt: true,
        deletedAt: true,
      },
    });
  }
}
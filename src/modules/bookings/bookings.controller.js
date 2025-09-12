import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@ApiTags('Bookings')
@Controller('api/bookings')
export class BookingsController {
  constructor(bookingsService) {
    this.bookingsService = bookingsService;
  }

  // Create new booking
  @Post()
  @UseGuards(JwtStrategy)
  async create(@Request() req, @Body() createBookingDto) {
    return this.bookingsService.create(req.user.id, createBookingDto);
  }

  // Get user's bookings (as guest)
  @Get('user/my-bookings')
  @UseGuards(JwtStrategy)
  async getUserBookings(@Request() req, @Query() query) {
    return this.bookingsService.getUserBookings(req.user.id, query);
  }

  // Get host's bookings
  @Get('host/my-bookings')
  @UseGuards(JwtStrategy)
  async getHostBookings(@Request() req, @Query() query) {
    return this.bookingsService.getHostBookings(req.user.id, query);
  }

  // Get single booking
  @Get(':id')
  @UseGuards(JwtStrategy)
  async findOne(@Param('id') id, @Request() req) {
    return this.bookingsService.findOne(id, req.user.id);
  }

  // Update booking status
  @Patch(':id/status')
  @UseGuards(JwtStrategy)
  async updateStatus(
    @Param('id') id,
    @Request() req,
    @Body('status') status,
    @Body('hostMessage') hostMessage,
  ) {
    return this.bookingsService.updateStatus(id, req.user.id, status, hostMessage);
  }

  // Cancel booking
  @Delete(':id/cancel')
  @UseGuards(JwtStrategy)
  async cancel(
    @Param('id') id,
    @Request() req,
    @Body('cancelReason') cancelReason,
  ) {
    return this.bookingsService.cancel(id, req.user.id, cancelReason);
  }
}
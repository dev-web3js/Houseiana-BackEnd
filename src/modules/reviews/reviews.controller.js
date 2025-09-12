import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { JwtStrategy } from '../auth/guards/jwt.guard.js';

@Controller('api/reviews')
export class ReviewsController {
  constructor(reviewsService) {
    this.reviewsService = reviewsService;
  }

  // Create review
  @Post()
  @UseGuards(JwtStrategy)
  async create(@Request() req, @Body() createReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  // Get reviews for a listing
  @Get('listing/:listingId')
  async getListingReviews(@Param('listingId') listingId, @Query() query) {
    return this.reviewsService.getListingReviews(listingId, query);
  }

  // Get user reviews
  @Get('user/:userId')
  async getUserReviews(@Param('userId') userId, @Query() query) {
    return this.reviewsService.getUserReviews(userId, query);
  }

  // Get my reviews
  @Get('my-reviews')
  @UseGuards(JwtStrategy)
  async getMyReviews(@Request() req, @Query() query) {
    return this.reviewsService.getUserReviews(req.user.id, query);
  }

  // Get single review
  @Get(':id')
  async findOne(@Param('id') id, @Request() req) {
    const userId = req.user?.id || null;
    return this.reviewsService.findOne(id, userId);
  }

  // Update review
  @Patch(':id')
  @UseGuards(JwtStrategy)
  async update(@Param('id') id, @Request() req, @Body() updateReviewDto) {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  // Delete review
  @Delete(':id')
  @UseGuards(JwtStrategy)
  async remove(@Param('id') id, @Request() req) {
    return this.reviewsService.remove(id, req.user.id);
  }
}
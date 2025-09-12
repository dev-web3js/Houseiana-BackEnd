import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ReviewsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Create a review
  async create(userId, createReviewDto) {
    const { bookingId, listingId, revieweeId, ...reviewData } = createReviewDto;

    // Verify booking exists and user is the guest
    if (bookingId) {
      const booking = await this.prisma.booking.findFirst({
        where: {
          id: bookingId,
          guestId: userId,
          status: 'COMPLETED',
        },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found or not completed');
      }

      // Check if review already exists for this booking
      const existingReview = await this.prisma.review.findFirst({
        where: {
          bookingId,
          reviewerId: userId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('Review already exists for this booking');
      }
    }

    const review = await this.prisma.review.create({
      data: {
        ...reviewData,
        reviewerId: userId,
        revieweeId: revieweeId || null,
        listingId: listingId || null,
        bookingId: bookingId || null,
        createdAt: new Date(),
      },
      include: {
        Reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Listing: {
          select: {
            id: true,
            title: true,
            photos: true,
          },
        },
      },
    });

    // Update listing average rating if this is a property review
    if (listingId) {
      await this.updateListingRating(listingId);
    }

    return review;
  }

  // Get reviews for a listing
  async getListingReviews(listingId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          listingId,
        },
        include: {
          Reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { listingId } }),
    ]);

    return {
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get reviews for a user
  async getUserReviews(userId, query = {}) {
    const { type = 'received', page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = type === 'received' ? { revieweeId: userId } : { reviewerId: userId };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          Reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          Reviewee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          Listing: {
            select: {
              id: true,
              title: true,
              photos: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single review
  async findOne(id, userId) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        Reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Reviewee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Listing: {
          select: {
            id: true,
            title: true,
            photos: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  // Update review
  async update(id, userId, updateReviewDto) {
    const review = await this.prisma.review.findFirst({
      where: {
        id,
        reviewerId: userId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found or not authorized');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: {
        ...updateReviewDto,
        updatedAt: new Date(),
      },
      include: {
        Reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        Listing: {
          select: {
            id: true,
            title: true,
            photos: true,
          },
        },
      },
    });

    // Update listing rating if this is a property review
    if (review.listingId) {
      await this.updateListingRating(review.listingId);
    }

    return updatedReview;
  }

  // Delete review
  async remove(id, userId) {
    const review = await this.prisma.review.findFirst({
      where: {
        id,
        reviewerId: userId,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found or not authorized');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    // Update listing rating if this was a property review
    if (review.listingId) {
      await this.updateListingRating(review.listingId);
    }

    return { message: 'Review deleted successfully' };
  }

  // Helper method to update listing rating
  async updateListingRating(listingId) {
    const aggregateData = await this.prisma.review.aggregate({
      where: { listingId },
      _avg: { overall: true },
      _count: { overall: true },
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        averageRating: aggregateData._avg.overall || 0,
        reviewCount: aggregateData._count.overall || 0,
      },
    });
  }
}
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class PropertiesService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Create a new property
  async create(hostId, createPropertyDto) {
    try {
      const property = await this.prisma.listing.create({
        data: {
          hostId,
          ...createPropertyDto,
          status: 'draft',
          isActive: false,
        },
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      return property;
    } catch (error) {
      throw new BadRequestException('Failed to create property');
    }
  }

  // Get all properties with filtering and search
  async findAll(query) {
    const {
      search,
      city,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minGuests,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where = {
      status: 'active',
      isActive: true,
    };

    // Add search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add filters
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (minPrice || maxPrice) {
      where.monthlyPrice = {};
      if (minPrice) where.monthlyPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.monthlyPrice.lte = parseFloat(maxPrice);
    }
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (bathrooms) where.bathrooms = parseFloat(bathrooms);
    if (minGuests) where.maxGuests = { gte: parseInt(minGuests) };

    const [properties, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              hostSince: true,
              responseRate: true,
            },
          },
          FavoriteListing: true,
          _count: {
            select: {
              Review: true,
              Booking: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single property by ID
  async findOne(id, userId = null) {
    const property = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            hostSince: true,
            responseRate: true,
            responseTime: true,
          },
        },
        Review: {
          include: {
            User_Review_reviewerIdToUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        FavoriteListing: userId ? { where: { userId } } : false,
        Availability: {
          where: {
            date: { gte: new Date() },
            available: true,
          },
          take: 90,
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Track view if not the owner
    if (userId && property.hostId !== userId) {
      await this.prisma.propertyView.create({
        data: {
          listingId: id,
          viewerId: userId,
          sessionId: `${userId}-${Date.now()}`,
        },
      });

      // Update view count
      await this.prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return property;
  }

  // Get properties by host
  async findByHost(hostId, query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { hostId };
    if (status) where.status = status;

    const [properties, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          _count: {
            select: {
              Review: true,
              Booking: true,
              FavoriteListing: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Update property
  async update(id, userId, updatePropertyDto) {
    const property = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.hostId !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const updatedProperty = await this.prisma.listing.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    return updatedProperty;
  }

  // Delete property
  async remove(id, userId) {
    const property = await this.prisma.listing.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.hostId !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.prisma.listing.update({
      where: { id },
      data: { 
        status: 'deleted',
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return { message: 'Property deleted successfully' };
  }

  // Toggle favorite
  async toggleFavorite(propertyId, userId) {
    const property = await this.prisma.listing.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const existingFavorite = await this.prisma.favoriteListing.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId: propertyId,
        },
      },
    });

    if (existingFavorite) {
      await this.prisma.favoriteListing.delete({
        where: {
          userId_listingId: {
            userId,
            listingId: propertyId,
          },
        },
      });

      await this.prisma.listing.update({
        where: { id: propertyId },
        data: { saveCount: { decrement: 1 } },
      });

      return { isFavorite: false, message: 'Property removed from favorites' };
    } else {
      await this.prisma.favoriteListing.create({
        data: {
          userId,
          listingId: propertyId,
        },
      });

      await this.prisma.listing.update({
        where: { id: propertyId },
        data: { saveCount: { increment: 1 } },
      });

      return { isFavorite: true, message: 'Property added to favorites' };
    }
  }

  // Get user favorites
  async getFavorites(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
      this.prisma.favoriteListing.findMany({
        where: { userId },
        include: {
          Listing: {
            include: {
              User: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImage: true,
                },
              },
              _count: {
                select: {
                  Review: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.favoriteListing.count({ where: { userId } }),
    ]);

    return {
      data: favorites.map(fav => fav.Listing),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get similar properties
  async getSimilar(propertyId, limit = 6) {
    const property = await this.prisma.listing.findUnique({
      where: { id: propertyId },
      select: { city: true, propertyType: true, monthlyPrice: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const priceRange = property.monthlyPrice * 0.3;

    const similarProperties = await this.prisma.listing.findMany({
      where: {
        id: { not: propertyId },
        status: 'active',
        isActive: true,
        OR: [
          { city: property.city },
          { propertyType: property.propertyType },
          {
            monthlyPrice: {
              gte: property.monthlyPrice - priceRange,
              lte: property.monthlyPrice + priceRange,
            },
          },
        ],
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            Review: true,
          },
        },
      },
      take: limit,
      orderBy: { averageRating: 'desc' },
    });

    return similarProperties;
  }
}
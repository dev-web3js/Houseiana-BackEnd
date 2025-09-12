import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class SearchService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Global search across properties, users, and locations
  async globalSearch(query, searchQuery = {}) {
    const { q, type = 'all', limit = 20, page = 1 } = searchQuery;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return {
        success: true,
        message: 'Search query too short',
        data: {
          properties: [],
          users: [],
          locations: [],
          total: 0,
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0,
        },
      };
    }

    const results = {};

    // Search properties
    if (type === 'all' || type === 'properties') {
      const properties = await this.prisma.listing.findMany({
        where: {
          AND: [
            {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { area: { contains: q, mode: 'insensitive' } },
                { district: { contains: q, mode: 'insensitive' } },
              ],
            },
            { isActive: true },
            { status: 'active' },
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
        },
        take: parseInt(limit),
        skip: type === 'properties' ? skip : 0,
        orderBy: { createdAt: 'desc' },
      });

      results.properties = properties;
    }

    // Search users (hosts)
    if (type === 'all' || type === 'users') {
      const users = await this.prisma.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { name: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } },
              ],
            },
            { isHost: true },
            { deletedAt: null },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
          username: true,
          profileImage: true,
          isHost: true,
          hostSince: true,
          responseRate: true,
          _count: {
            select: {
              Listing: {
                where: { isActive: true },
              },
            },
          },
        },
        take: parseInt(limit),
        skip: type === 'users' ? skip : 0,
        orderBy: { createdAt: 'desc' },
      });

      results.users = users;
    }

    // Search locations (cities, areas)
    if (type === 'all' || type === 'locations') {
      const locations = await this.prisma.listing.groupBy({
        by: ['city', 'area'],
        where: {
          OR: [
            { city: { contains: q, mode: 'insensitive' } },
            { area: { contains: q, mode: 'insensitive' } },
          ],
          isActive: true,
          status: 'active',
        },
        _count: {
          city: true,
        },
        orderBy: {
          _count: {
            city: 'desc',
          },
        },
        take: parseInt(limit),
        skip: type === 'locations' ? skip : 0,
      });

      results.locations = locations.map(location => ({
        city: location.city,
        area: location.area,
        propertyCount: location._count.city,
      }));
    }

    // Calculate total results
    const total = (results.properties?.length || 0) + 
                  (results.users?.length || 0) + 
                  (results.locations?.length || 0);

    return {
      success: true,
      message: 'Search completed successfully',
      query: q,
      data: {
        properties: results.properties || [],
        users: results.users || [],
        locations: results.locations || [],
        total,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Property-specific search with advanced filters
  async searchProperties(searchQuery) {
    const {
      q,
      city,
      area,
      district,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minGuests,
      maxGuests,
      checkIn,
      checkOut,
      amenities,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = searchQuery;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      AND: [
        { isActive: true },
        { status: 'active' },
      ],
    };

    // Text search
    if (q && q.length >= 2) {
      where.AND.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { area: { contains: q, mode: 'insensitive' } },
          { district: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    // Location filters
    if (city) where.AND.push({ city: { contains: city, mode: 'insensitive' } });
    if (area) where.AND.push({ area: { contains: area, mode: 'insensitive' } });
    if (district) where.AND.push({ district: { contains: district, mode: 'insensitive' } });

    // Property type filter
    if (propertyType) where.AND.push({ propertyType });

    // Price range
    if (minPrice) where.AND.push({ monthlyPrice: { gte: parseInt(minPrice) } });
    if (maxPrice) where.AND.push({ monthlyPrice: { lte: parseInt(maxPrice) } });

    // Room filters
    if (bedrooms) where.AND.push({ bedrooms: { gte: parseInt(bedrooms) } });
    if (bathrooms) where.AND.push({ bathrooms: { gte: parseInt(bathrooms) } });

    // Guest capacity
    if (minGuests) where.AND.push({ maxGuests: { gte: parseInt(minGuests) } });
    if (maxGuests) where.AND.push({ maxGuests: { lte: parseInt(maxGuests) } });

    // Availability check (if dates provided)
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Find properties that don't have conflicting bookings
      const conflictingBookings = await this.prisma.booking.findMany({
        where: {
          OR: [
            {
              checkIn: { lte: checkOutDate },
              checkOut: { gte: checkInDate },
            },
          ],
          status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
        select: { listingId: true },
      });

      const conflictingListingIds = conflictingBookings.map(b => b.listingId);
      if (conflictingListingIds.length > 0) {
        where.AND.push({
          id: { notIn: conflictingListingIds },
        });
      }
    }

    // Amenities filter (if provided)
    if (amenities && amenities.length > 0) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      // This would require a more complex query depending on how amenities are stored
      // For now, we'll search in JSON fields
      where.AND.push({
        OR: amenitiesArray.map(amenity => ({
          OR: [
            { inUnitFeatures: { path: ['amenities'], array_contains: amenity } },
            { buildingFacilities: { path: ['amenities'], array_contains: amenity } },
            { compoundAmenities: { path: ['amenities'], array_contains: amenity } },
          ],
        })),
      });
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'price':
        orderBy = { monthlyPrice: sortOrder };
        break;
      case 'rating':
        orderBy = { averageRating: sortOrder };
        break;
      case 'views':
        orderBy = { viewCount: sortOrder };
        break;
      default:
        orderBy = { createdAt: sortOrder };
    }

    // Execute search
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
        },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      success: true,
      message: 'Property search completed successfully',
      data: properties,
      searchParams: searchQuery,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  // Get search suggestions/autocomplete
  async getSearchSuggestions(query) {
    const { q, type = 'all', limit = 10 } = query;

    if (!q || q.length < 2) {
      return {
        success: true,
        message: 'Query too short',
        suggestions: [],
      };
    }

    const suggestions = [];

    // City suggestions
    if (type === 'all' || type === 'locations') {
      const cities = await this.prisma.listing.groupBy({
        by: ['city'],
        where: {
          city: { contains: q, mode: 'insensitive' },
          isActive: true,
        },
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 5,
      });

      suggestions.push(...cities.map(item => ({
        type: 'city',
        value: item.city,
        count: item._count.city,
        label: `${item.city} (${item._count.city} properties)`,
      })));
    }

    // Area suggestions
    if (type === 'all' || type === 'locations') {
      const areas = await this.prisma.listing.groupBy({
        by: ['area', 'city'],
        where: {
          area: { contains: q, mode: 'insensitive' },
          isActive: true,
        },
        _count: { area: true },
        orderBy: { _count: { area: 'desc' } },
        take: 5,
      });

      suggestions.push(...areas.map(item => ({
        type: 'area',
        value: item.area,
        city: item.city,
        count: item._count.area,
        label: `${item.area}, ${item.city} (${item._count.area} properties)`,
      })));
    }

    // Property suggestions
    if (type === 'all' || type === 'properties') {
      const properties = await this.prisma.listing.findMany({
        where: {
          title: { contains: q, mode: 'insensitive' },
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          city: true,
          monthlyPrice: true,
        },
        take: 5,
        orderBy: { viewCount: 'desc' },
      });

      suggestions.push(...properties.map(item => ({
        type: 'property',
        value: item.title,
        propertyId: item.id,
        city: item.city,
        price: item.monthlyPrice,
        label: `${item.title} - ${item.city}`,
      })));
    }

    return {
      success: true,
      message: 'Suggestions retrieved successfully',
      query: q,
      suggestions: suggestions.slice(0, parseInt(limit)),
    };
  }
}
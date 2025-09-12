import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class BookingsService {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Create a new booking
  async create(userId, createBookingDto) {
    const {
      listingId,
      checkIn,
      checkOut,
      adults,
      children = 0,
      infants = 0,
      pets = 0,
      guestMessage,
      specialRequests,
      arrivalTime,
      guestPhone,
      guestEmail,
    } = createBookingDto;

    // Validate property exists and is available
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        hostId: true,
        monthlyPrice: true,
        cleaningFee: true,
        securityDeposit: true,
        minNights: true,
        maxNights: true,
        maxGuests: true,
        isActive: true,
        status: true,
      },
    });

    if (!listing || !listing.isActive || listing.status !== 'active') {
      throw new BadRequestException('Property is not available for booking');
    }

    if (listing.hostId === userId) {
      throw new BadRequestException('You cannot book your own property');
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const totalGuests = adults + children;

    // Validate dates
    if (checkInDate >= checkOutDate) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    if (checkInDate < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Calculate nights
    const totalNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Validate night restrictions
    if (totalNights < listing.minNights) {
      throw new BadRequestException(`Minimum stay is ${listing.minNights} nights`);
    }

    if (listing.maxNights && totalNights > listing.maxNights) {
      throw new BadRequestException(`Maximum stay is ${listing.maxNights} nights`);
    }

    // Validate guest count
    if (totalGuests > listing.maxGuests) {
      throw new BadRequestException(`Property can accommodate maximum ${listing.maxGuests} guests`);
    }

    // Check for conflicting bookings
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          {
            checkIn: { lte: checkInDate },
            checkOut: { gt: checkInDate },
          },
          {
            checkIn: { lt: checkOutDate },
            checkOut: { gte: checkOutDate },
          },
          {
            checkIn: { gte: checkInDate },
            checkOut: { lte: checkOutDate },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('Property is not available for selected dates');
    }

    // Calculate pricing
    const subtotal = listing.monthlyPrice * totalNights;
    const cleaningFee = listing.cleaningFee || 0;
    const serviceFee = subtotal * 0.14; // 14% service fee
    const taxes = subtotal * 0.05; // 5% VAT
    const totalPrice = subtotal + cleaningFee + serviceFee + taxes;

    // Generate booking code
    const bookingCode = this.generateBookingCode();

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        bookingCode,
        listingId,
        guestId: userId,
        hostId: listing.hostId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        infants,
        pets,
        nightlyRate: listing.monthlyPrice,
        totalNights,
        subtotal,
        cleaningFee,
        serviceFee,
        taxes,
        totalPrice,
        totalAmount: totalPrice,
        guests: totalGuests,
        securityDeposit: listing.securityDeposit,
        guestMessage,
        specialRequests,
        arrivalTime,
        guestPhone,
        guestEmail,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: {
        Listing: {
          select: {
            id: true,
            title: true,
            photos: true,
            city: true,
            area: true,
          },
        },
        User_Booking_hostIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return booking;
  }

  // Get user's bookings (as guest)
  async getUserBookings(userId, query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { guestId: userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          Listing: {
            select: {
              id: true,
              title: true,
              photos: true,
              city: true,
              area: true,
              coordinates: true,
            },
          },
          User_Booking_hostIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              phone: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get host's bookings
  async getHostBookings(hostId, query = {}) {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where = { hostId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          Listing: {
            select: {
              id: true,
              title: true,
              photos: true,
              city: true,
              area: true,
            },
          },
          User_Booking_guestIdToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              phone: true,
              email: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single booking
  async findOne(id, userId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        Listing: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        User_Booking_guestIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            phone: true,
            email: true,
          },
        },
        User_Booking_hostIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user has access to this booking
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  // Update booking status
  async updateStatus(id, userId, status, hostMessage = null) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        guestId: true,
        hostId: true,
        status: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only host can confirm/decline, guest can cancel
    const validTransitions = {
      PENDING: {
        host: ['CONFIRMED', 'CANCELLED'],
        guest: ['CANCELLED'],
      },
      CONFIRMED: {
        host: ['IN_PROGRESS', 'CANCELLED'],
        guest: ['CANCELLED'],
      },
      IN_PROGRESS: {
        host: ['COMPLETED'],
        guest: [],
      },
    };

    const userRole = booking.hostId === userId ? 'host' : 'guest';
    
    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    const allowedStatuses = validTransitions[booking.status]?.[userRole] || [];
    
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${status}`);
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Add timestamps for specific status changes
    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = userId;
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (status === 'IN_PROGRESS') {
      updateData.actualCheckIn = new Date();
    }

    if (hostMessage) {
      updateData.hostMessage = hostMessage;
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        Listing: {
          select: {
            id: true,
            title: true,
          },
        },
        User_Booking_guestIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        User_Booking_hostIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedBooking;
  }

  // Cancel booking
  async cancel(id, userId, cancelReason = null) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        guestId: true,
        hostId: true,
        status: true,
        checkIn: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId && booking.hostId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel booking in current status');
    }

    // Calculate cancellation policy (simplified)
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
    
    let refundAmount = 0;
    if (hoursUntilCheckIn > 48) {
      refundAmount = 1.0; // Full refund
    } else if (hoursUntilCheckIn > 24) {
      refundAmount = 0.5; // 50% refund
    }
    // Less than 24 hours: no refund

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: userId,
        cancelReason,
      },
    });

    return { ...updatedBooking, refundAmount };
  }

  // Generate booking code
  generateBookingCode() {
    const prefix = 'HS';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}
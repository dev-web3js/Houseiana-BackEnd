import { ApiProperty } from '@nestjs/swagger';

// Common response schemas
export class ApiResponse {
  @ApiProperty({ example: true, description: 'Indicates if the operation was successful' })
  success;

  @ApiProperty({ example: 'Operation completed successfully', description: 'Response message' })
  message;
}

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Current page number', minimum: 1 })
  page;

  @ApiProperty({ example: 20, description: 'Number of items per page', minimum: 1, maximum: 100 })
  limit;

  @ApiProperty({ example: 100, description: 'Total number of items' })
  total;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  pages;
}

export class ErrorResponse {
  @ApiProperty({ example: 400, description: 'HTTP status code' })
  statusCode;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Timestamp of the error' })
  timestamp;

  @ApiProperty({ example: '/api/properties', description: 'Request path' })
  path;

  @ApiProperty({ example: 'POST', description: 'HTTP method' })
  method;

  @ApiProperty({ example: 'Validation failed', description: 'Error message' })
  message;
}

// User-related DTOs
export class UserDto {
  @ApiProperty({ example: 'clp1234567890', description: 'User unique identifier' })
  id;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  email;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  firstName;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  lastName;

  @ApiProperty({ example: 'john_doe', description: 'Username', required: false })
  username;

  @ApiProperty({ example: '+1 (555) 123-4567', description: 'Phone number', required: false })
  phone;

  @ApiProperty({ example: 'guest', enum: ['guest', 'host', 'both', 'admin'], description: 'User role' })
  role;

  @ApiProperty({ example: false, description: 'Whether user is a host' })
  isHost;

  @ApiProperty({ example: false, description: 'Whether user is an admin' })
  isAdmin;

  @ApiProperty({ example: 'https://example.com/profile.jpg', description: 'Profile image URL', required: false })
  profileImage;

  @ApiProperty({ example: true, description: 'Whether email is verified' })
  emailVerified;

  @ApiProperty({ example: false, description: 'Whether phone is verified' })
  phoneVerified;
}

// Property-related DTOs
export class PropertyDto {
  @ApiProperty({ example: 'clp1234567890', description: 'Property unique identifier' })
  id;

  @ApiProperty({ example: 'Luxury Apartment in Manhattan', description: 'Property title' })
  title;

  @ApiProperty({ example: 'Beautiful 2-bedroom apartment with stunning views', description: 'Property description' })
  description;

  @ApiProperty({ example: 'apartment', enum: ['apartment', 'villa', 'studio', 'townhouse', 'penthouse'], description: 'Property type' })
  propertyType;

  @ApiProperty({ example: 'New York', description: 'City location' })
  city;

  @ApiProperty({ example: 'Manhattan', description: 'Area within city', required: false })
  area;

  @ApiProperty({ example: 2, description: 'Number of bedrooms' })
  bedrooms;

  @ApiProperty({ example: 2, description: 'Number of bathrooms' })
  bathrooms;

  @ApiProperty({ example: 4, description: 'Maximum number of guests' })
  maxGuests;

  @ApiProperty({ example: 3500, description: 'Monthly price in USD' })
  monthlyPrice;

  @ApiProperty({ example: 150, description: 'Cleaning fee in USD', required: false })
  cleaningFee;

  @ApiProperty({ example: true, description: 'Whether property is active' })
  isActive;

  @ApiProperty({ example: 4.8, description: 'Average rating', required: false })
  averageRating;

  @ApiProperty({ example: 15, description: 'Number of reviews' })
  reviewCount;

  @ApiProperty({ type: [String], example: ['https://example.com/photo1.jpg'], description: 'Property photos', required: false })
  photos;

  @ApiProperty({ type: UserDto, description: 'Property host information' })
  User;
}

// Booking-related DTOs
export class BookingDto {
  @ApiProperty({ example: 'clp1234567890', description: 'Booking unique identifier' })
  id;

  @ApiProperty({ example: 'HB-2024-001', description: 'Booking code' })
  bookingCode;

  @ApiProperty({ example: '2024-03-01', description: 'Check-in date (YYYY-MM-DD)' })
  checkIn;

  @ApiProperty({ example: '2024-03-07', description: 'Check-out date (YYYY-MM-DD)' })
  checkOut;

  @ApiProperty({ example: 2, description: 'Number of adult guests' })
  adults;

  @ApiProperty({ example: 1, description: 'Number of children', required: false })
  children;

  @ApiProperty({ example: 6, description: 'Total number of nights' })
  totalNights;

  @ApiProperty({ example: 2100, description: 'Total price in USD' })
  totalPrice;

  @ApiProperty({ example: 'CONFIRMED', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], description: 'Booking status' })
  status;

  @ApiProperty({ example: 'PAID', enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED'], description: 'Payment status' })
  paymentStatus;

  @ApiProperty({ type: PropertyDto, description: 'Booked property information' })
  Listing;
}

// Search query DTOs
export class SearchQueryDto {
  @ApiProperty({ example: 'luxury apartment', description: 'Search query text', required: false })
  q;

  @ApiProperty({ example: 'New York', description: 'City filter', required: false })
  city;

  @ApiProperty({ example: 'Manhattan', description: 'Area filter', required: false })
  area;

  @ApiProperty({ example: 'apartment', description: 'Property type filter', required: false })
  propertyType;

  @ApiProperty({ example: 2000, description: 'Minimum price in USD', required: false })
  minPrice;

  @ApiProperty({ example: 5000, description: 'Maximum price in USD', required: false })
  maxPrice;

  @ApiProperty({ example: 2, description: 'Minimum bedrooms', required: false })
  bedrooms;

  @ApiProperty({ example: 4, description: 'Number of guests', required: false })
  guests;

  @ApiProperty({ example: 1, description: 'Page number for pagination', minimum: 1 })
  page;

  @ApiProperty({ example: 20, description: 'Items per page', minimum: 1, maximum: 100 })
  limit;

  @ApiProperty({ example: 'createdAt', enum: ['createdAt', 'price', 'rating', 'views'], description: 'Sort field', required: false })
  sortBy;

  @ApiProperty({ example: 'desc', enum: ['asc', 'desc'], description: 'Sort order', required: false })
  sortOrder;
}
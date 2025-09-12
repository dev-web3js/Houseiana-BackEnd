# 🌐 Frontend Integration Guide

## 📋 Overview
This guide helps you integrate your frontend application with the Houseiana backend API.

## 🔗 Backend API Base URL
```
Development: http://localhost:5001/api
Production: https://api.houseiana.com/api
```

## 🔑 Authentication

### JWT Token Structure
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    username?: string;
    role: 'guest' | 'host' | 'both' | 'admin';
    isHost: boolean;
    profileImage?: string;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  token: string;
}
```

### Authentication Headers
```typescript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

## 📡 API Endpoints & TypeScript Interfaces

### 🔐 Authentication API

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  role?: 'guest' | 'host' | 'both';
  bio?: string;
}

// POST /api/auth/login  
interface LoginRequest {
  email: string;
  password: string;
}
```

### 🏠 Properties API

```typescript
// Property Model
interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'villa' | 'studio' | 'townhouse' | 'penthouse' | 'compound_villa' | 'room' | 'duplex' | 'chalet' | 'farm_house' | 'shared_room';
  city: string;
  area?: string;
  district?: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  monthlyPrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights: number;
  maxNights?: number;
  instantBook: boolean;
  photos?: string[];
  coordinates?: any;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  isActive: boolean;
  averageRating?: number;
  reviewCount: number;
  viewCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    hostSince?: string;
    responseRate?: number;
  };
}

// GET /api/properties (with query params)
interface PropertiesQuery {
  search?: string;
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minGuests?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// POST /api/properties
interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: string;
  city: string;
  area?: string;
  district?: string;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  monthlyPrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  minNights?: number;
  maxNights?: number;
  instantBook?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  photos?: string[];
  houseRules?: string;
  checkInInstructions?: string;
  coordinates?: any;
  inUnitFeatures?: any;
  buildingFacilities?: any;
  compoundAmenities?: any;
  safetyFeatures?: any;
}
```

### 📅 Bookings API

```typescript
// Booking Model
interface Booking {
  id: string;
  bookingCode: string;
  listingId: string;
  guestId: string;
  hostId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  pets: number;
  totalNights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';
  guestMessage?: string;
  specialRequests?: string;
  arrivalTime?: string;
  createdAt: string;
  Listing: {
    id: string;
    title: string;
    photos?: string[];
    city: string;
    area?: string;
  };
}

// POST /api/bookings
interface CreateBookingRequest {
  listingId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
  guestMessage?: string;
  specialRequests?: string;
  arrivalTime?: string;
  guestPhone?: string;
  guestEmail?: string;
}
```

### 👤 Users API

```typescript
// User Profile Model
interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  role: 'guest' | 'host' | 'both' | 'admin';
  isHost: boolean;
  isAdmin: boolean;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  language: string;
  currency: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  emailVerified: boolean;
  hostSince?: string;
  responseRate?: number;
  totalEarnings?: number;
  createdAt: string;
  updatedAt: string;
}

// POST /api/users/become-host
interface BecomeHostRequest {
  bio?: string;
  governmentId?: string;
  governmentIdType?: string;
  tradeLicense?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  iban?: string;
  swiftCode?: string;
  propertyDocs?: any;
  agreeToTerms?: boolean;
}

// PATCH /api/users/profile
interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  profileImage?: string;
  language?: string;
  currency?: string;
  timezone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  marketingEmails?: boolean;
}
```

### 📁 Upload API

```typescript
// File Upload Response
interface UploadResponse {
  url: string;
  key: string;
  bucket: string;
  originalName: string;
  size: number;
  mimetype: string;
}

// Multiple files upload response
interface MultipleUploadResponse {
  files: UploadResponse[];
}
```

## 🔧 Frontend Service Examples

### React/TypeScript API Service

```typescript
// api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  // Properties
  async getProperties(query?: PropertiesQuery): Promise<{ data: Property[]; pagination: any }> {
    const response = await this.client.get('/properties', { params: query });
    return response.data;
  }

  async getProperty(id: string): Promise<Property> {
    const response = await this.client.get(`/properties/${id}`);
    return response.data;
  }

  async createProperty(data: CreatePropertyRequest): Promise<Property> {
    const response = await this.client.post('/properties', data);
    return response.data;
  }

  async toggleFavorite(propertyId: string): Promise<{ isFavorite: boolean; message: string }> {
    const response = await this.client.post(`/properties/${propertyId}/favorite`);
    return response.data;
  }

  // Bookings
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await this.client.post('/bookings', data);
    return response.data;
  }

  async getUserBookings(): Promise<{ data: Booking[]; pagination: any }> {
    const response = await this.client.get('/bookings/user/my-bookings');
    return response.data;
  }

  async getHostBookings(): Promise<{ data: Booking[]; pagination: any }> {
    const response = await this.client.get('/bookings/host/my-bookings');
    return response.data;
  }

  // Users
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await this.client.patch('/users/profile', data);
    return response.data;
  }

  async becomeHost(data: BecomeHostRequest): Promise<any> {
    const response = await this.client.post('/users/become-host', data);
    return response.data;
  }

  // File Upload
  async uploadFile(file: File, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const response = await this.client.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadPropertyPhotos(files: File[]): Promise<UploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    const response = await this.client.post('/upload/property-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### Environment Configuration

```env
# Frontend .env file
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_API_URL_PROD=https://api.houseiana.com/api
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AWS_S3_BUCKET=houseiana-uploads
```

## 🚀 Usage Examples

### Authentication Hook (React)

```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      apiClient.getUserProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const register = async (data: RegisterRequest) => {
    const response = await apiClient.register(data);
    localStorage.setItem('authToken', response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 📱 Error Handling

The backend returns structured error responses:

```typescript
interface ApiError {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  stack?: string; // Only in development
}
```

Handle errors consistently in your frontend:

```typescript
try {
  const data = await apiClient.createProperty(propertyData);
  // Handle success
} catch (error) {
  if (error.response?.data?.message) {
    // Show user-friendly error message
    toast.error(error.response.data.message);
  } else {
    // Generic error
    toast.error('Something went wrong');
  }
}
```

## 🔄 Real-time Updates (Future Enhancement)

The backend is prepared for WebSocket connections for real-time notifications:

```typescript
// Future WebSocket integration
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

socket.on('booking-update', (booking: Booking) => {
  // Update UI with new booking status
});

socket.on('new-message', (message: any) => {
  // Handle new chat message
});
```
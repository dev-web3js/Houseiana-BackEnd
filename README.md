# 🏠 Houseiana Backend API

A comprehensive NestJS backend API for the Houseiana property rental platform, built with JavaScript, Prisma ORM, and PostgreSQL.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Guest, Host, Admin)
- Password hashing with bcrypt
- Session management and security

### 🏘️ Property Management
- Complete CRUD operations for properties
- Advanced search and filtering
- Property photo management
- Favorites system
- Property analytics and view tracking

### 📅 Booking System
- End-to-end booking management
- Availability checking and validation
- Pricing calculations with fees and taxes
- Booking status management
- Cancellation policies

### 👤 User Management
- User profile management
- Host application system
- Notification preferences
- Privacy settings
- User statistics and analytics

### 📁 File Upload & Storage
- AWS S3 integration for file storage
- Image optimization and resizing
- Multiple file upload support
- Secure file access with presigned URLs

### 🛡️ Security & Performance
- Rate limiting and DDoS protection
- Helmet.js security headers
- CORS configuration
- Request/response compression
- Global error handling
- Structured logging

## 🏗️ Tech Stack

- **Framework**: NestJS with JavaScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport
- **File Storage**: AWS S3
- **Security**: Helmet, Rate Limiting, CORS
- **Validation**: Class Validator & Transformer
- **Environment**: Node.js with Babel

## 📋 Prerequisites

- Node.js >= 18
- PostgreSQL database
- AWS account (for S3 storage)
- NPM or Yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/dev-web3js/Houseiana-BackEnd.git
cd Houseiana-BackEnd
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/houseiana"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="houseiana-uploads"

# Email Configuration (Resend)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@houseiana.com"

# App Configuration
APP_URL="https://houseiana.com"
PORT=5001
NODE_ENV="development"

# Security
RATE_LIMIT_TTL=900000
RATE_LIMIT_MAX=100
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Or push schema directly (development)
npx prisma db push
```

### 5. Start the server
```bash
# Development mode
npm run start:dev

# Production mode
npm start
```

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |

### 🏠 Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties (with filters) |
| GET | `/api/properties/:id` | Get property by ID |
| POST | `/api/properties` | Create new property |
| PATCH | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| GET | `/api/properties/my-properties` | Get user's properties |
| POST | `/api/properties/:id/favorite` | Toggle favorite |
| GET | `/api/properties/favorites` | Get user favorites |

### 📅 Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/user/my-bookings` | Get user bookings |
| GET | `/api/bookings/host/my-bookings` | Get host bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PATCH | `/api/bookings/:id/status` | Update booking status |
| DELETE | `/api/bookings/:id/cancel` | Cancel booking |

### 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/become-host` | Apply to become host |
| GET | `/api/users/profile` | Get user profile |
| PATCH | `/api/users/profile` | Update profile |
| GET | `/api/users/notifications` | Get notifications |
| PATCH | `/api/users/preferences/notifications` | Update notification preferences |
| GET | `/api/users/stats` | Get user statistics |

### 📁 Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/single` | Upload single file |
| POST | `/api/upload/multiple` | Upload multiple files |
| POST | `/api/upload/property-photos` | Upload property photos |
| POST | `/api/upload/profile-image` | Upload profile image |
| DELETE | `/api/upload/file/:key` | Delete file |

## 🗂️ Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── filters/           # Exception filters
│   ├── guards/            # Custom guards
│   └── middleware/        # Custom middleware
├── database/              # Database configuration
│   ├── database.module.js
│   └── prisma.service.js
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   ├── properties/       # Property management
│   ├── bookings/         # Booking system
│   ├── users/            # User management
│   └── upload/           # File upload
├── app.controller.js      # Root controller
├── app.module.js         # Root module
├── app.service.js        # Root service
└── main.js               # Application entry point
```

## 🔧 Configuration

### Database Schema
The application uses Prisma ORM with a comprehensive schema including:
- **37 database models** covering all aspects of the platform
- **User management** with roles and verification
- **Property listings** with detailed attributes
- **Booking system** with status tracking
- **File management** and metadata
- **Notification system**
- **Review and rating system**

### Security Features
- **Helmet.js** for security headers
- **Rate limiting** to prevent abuse
- **CORS** configuration for frontend integration
- **JWT authentication** with secure tokens
- **Input validation** and sanitization
- **Global exception handling**

## 🧪 Testing

```bash
# Unit tests
npm test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Environment Variables for Production
Ensure all environment variables are properly set for production:
- Update `NODE_ENV=production`
- Use strong JWT secrets
- Configure proper AWS credentials
- Set up production database

### Build and Start
```bash
# Install production dependencies
npm ci --production

# Start production server
npm start
```

## 📊 Monitoring & Logging

The application includes:
- **Structured logging** for all requests
- **Error tracking** and reporting  
- **Performance monitoring**
- **Security audit logging**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@houseiana.com
- 🐛 Issues: [GitHub Issues](https://github.com/dev-web3js/Houseiana-BackEnd/issues)
- 📖 Documentation: [API Docs](https://docs.houseiana.com)

---

**Built with ❤️ by the Houseiana team**

🧬 Generated with [Claude Code](https://claude.ai/code)
# StreamFlix API - Setup Guide

## Quick Start

### 1. Create Environment File
```bash
cp .env.TEMPLATE .env
```

Edit `.env` with your settings (default values work for Docker).

### 2. Start Docker Containers
```bash
docker compose up --build
```

This will:
- Build the NestJS API
- Start MySQL database
- Start phpMyAdmin (http://localhost:8080)
- Start Nginx reverse proxy

### 3. Access the Application

- **API**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
  - Server: mysql
  - Username: root
  - Password: (from .env DB_ROOT_PASSWORD)

## Testing the API

### Register a New Account
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

Response includes JWT token for authenticated requests.

## Project Structure

```
app/
├── src/
│   ├── common/
│   │   └── entities/
│   │       └── base.entity.ts          # Abstract base class
│   ├── config/
│   │   └── database.config.ts          # TypeORM configuration
│   ├── modules/
│   │   ├── auth/                       # Authentication
│   │   │   ├── dto/                    # Data Transfer Objects with validation
│   │   │   ├── auth.controller.ts      # HTTP endpoints
│   │   │   ├── auth.service.ts         # Business logic
│   │   │   └── auth.module.ts          # Module configuration
│   │   ├── accounts/
│   │   │   └── entities/
│   │   │       └── account.entity.ts   # Account entity with OOP
│   │   ├── profiles/
│   │   │   └── entities/
│   │   │       └── profile.entity.ts
│   │   └── subscriptions/
│   │       └── entities/
│   │           └── subscription.entity.ts
│   ├── app.module.ts                   # Main application module
│   └── main.ts                         # Application entry point
└── package.json                        # Dependencies

db-init/
└── streamflix.sql                      # Database schema
```

## Features Implemented

### ✅ Database
- Fixed schema with all relationships
- Account locking mechanism
- Referral system structure
- Trial period tracking
- Watch history with resume position
- Indexes for performance

### ✅ Authentication
- User registration with validation
- Password hashing (bcrypt)
- JWT token authentication
- Account locking after 3 failed login attempts
- Email validation
- Password strength requirements

### ✅ OOP Principles
- Abstract base class (BaseEntity)
- Proper encapsulation (private/protected/public)
- Class methods and functions
- Interfaces through DTOs
- Validation decorators

## Next Steps

1. Add more content entities (Movie, Series, Episode)
2. Implement profile management
3. Add subscription management
4. Implement watchlist and watch history
5. Add XML support
6. Create database views and stored procedures
7. Add database roles
8. Document backup strategy

## Troubleshooting

### Docker Issues
```bash
# Stop all containers
docker compose down

# Remove volumes and rebuild
docker compose down -v
docker compose up --build
```

### Database Connection Issues
- Check if MySQL container is running: `docker ps`
- Check logs: `docker compose logs mysql`
- Verify .env file has correct credentials

### API Not Starting
- Check logs: `docker compose logs api`
- Verify all dependencies are installed
- Check TypeScript compilation errors

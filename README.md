# StreamFlix API - Year 2 Period 2

## Project Overview
StreamFlix is a Netflix-like streaming service API built with NestJS, TypeORM, and MySQL. This project implements a complete backend system for managing user accounts, profiles, subscriptions, content (movies and series), watchlists, and viewing history.

### Group Members
* Beyza Ölmez - beyza.olmez@student.nhlstenden.com
* Sara Kiani Nejad - sara.kiani.nejad@student.nhlstenden.com
* Stefan Bryda - stefan.bryda@student.nhlstenden.com
* Miriam Cerulíková - miriam.cerulikova@student.nhlstenden.com

---

## What We Built

### Core Features Implemented
- **Authentication System**: Secure user registration and login with JWT tokens, password hashing using bcrypt, and account activation tracking
- **Content Management**: Browse movies and series with genre and age classification filtering
- **Database Schema**: Comprehensive MySQL database with 15 tables including proper foreign keys, indexes, and relationships
- **RESTful API**: Clean endpoint structure following REST principles with proper HTTP methods and status codes
- **Object-Oriented Design**: All entities use proper OOP principles with private fields, getters/setters, and business logic methods
- **XML Support**: Content negotiation - API responds with JSON or XML based on Accept header
- **Sample Data**: Comprehensive test data including 10 movies, 5 series, 10 genres, and user accounts

### API Endpoints Available

#### Authentication
- `POST /auth/register` - Create a new account with email validation
- `POST /auth/login` - Login and receive JWT access token

#### Content Browsing
- `GET /content/movies` - Get all movies (supports age filtering with `?minAge=13`)
- `GET /content/movies/:id` - Get specific movie details
- `GET /content/movies/search?q=query` - Search movies by title
- `GET /content/series` - Get all series (supports age filtering)
- `GET /content/series/:id` - Get series details with episodes
- `GET /content/series/:id/episodes` - Get episodes (filter by season with `?season=1`)
- `GET /content/genres` - List all available genres
- `GET /content/classifications` - List all age classifications

### Database Structure
We designed a normalized database with the following main tables:
- **Account** - User accounts with authentication details, referral codes, and trial tracking
- **Profile** - Multiple profiles per account (max 4) with age restrictions
- **Subscription** - Different subscription tiers (SD, HD, UHD) with pricing
- **Movie/Series/Episode** - Content catalog with metadata
- **Genre & Classification** - Content categorization and age ratings
- **Watchlist & WatchHistory** - User viewing preferences and progress tracking
- **Invitation** - Referral system for discounts
- **ActivationToken & PasswordReset** - Account security features

---

## Getting Started

### Prerequisites

You'll need Docker installed on your machine:

**Windows**: [Docker Desktop](https://docs.docker.com/desktop/windows/install/)  
**Mac**: [Docker Desktop for Mac](https://docs.docker.com/desktop/mac/install/) (check your architecture: x64/arm64)  
**Linux**: [Docker Engine](https://docs.docker.com/engine/install/#server)

### Setup Instructions

1. **Clone or download the project** to your local machine

2. **Create the environment file**  
   Rename `.env.TEMPLATE` to `.env` and configure your database settings:
   ```env
   # Database Configuration
   DB_HOST=mysql
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=rootpassword
   DB_DATABASE=mydb

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=1d
   ```

3. **Prepare Docker Compose**  
   Rename `docker-compose.yamlTEMPLATE` to `docker-compose.yaml`

4. **Create MySQL data folder**  
   Create an empty folder called `mysqldata` in the project root (this stores your database)

5. **Start the application**  
   Open your terminal in the project folder and run:
   ```bash
   docker compose up --build
   ```
   The first build takes a few minutes. Wait until you see:
   ```
   StreamFlix API is running on: http://localhost:3000
   ```

6. **Import sample data** (optional but recommended)
   - Go to http://localhost:8080 (phpMyAdmin)
   - Login with root/rootpassword
   - Select `mydb` database
   - Go to Import tab
   - Choose `db-init/sample_data.sql`
   - Click Go

7. **Access the services**
   - **API**: http://localhost:3000
   - **phpMyAdmin**: http://localhost:8080 (login with root/rootpassword)

---

## Testing the API

### Using PowerShell (Windows)

**Register a new account:**
```powershell
$body = @{
    email = "test@streamflix.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" -Method Post -Body $body -ContentType "application/json"
```

**Login:**
```powershell
$body = @{
    email = "test@streamflix.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Browse content:**
```powershell
# Get all movies (JSON)
Invoke-RestMethod -Uri "http://localhost:3000/content/movies"

# Get all movies (XML)
$headers = @{ "Accept" = "application/xml" }
Invoke-RestMethod -Uri "http://localhost:3000/content/movies" -Headers $headers

# Get all genres
Invoke-RestMethod -Uri "http://localhost:3000/content/genres"

# Search movies
Invoke-RestMethod -Uri "http://localhost:3000/content/movies/search?q=matrix"
```

### Using Your Browser

For GET requests, just visit these URLs:
- http://localhost:3000/content/movies
- http://localhost:3000/content/series
- http://localhost:3000/content/genres
- http://localhost:3000/content/classifications

### Using Postman (Recommended)

Download [Postman](https://www.postman.com/downloads/) for a better testing experience with a graphical interface.

---

## Project Structure

```
Data-Processing/
├── app/                          # NestJS application
│   ├── src/
│   │   ├── common/              # Shared utilities and base classes
│   │   ├── config/              # Configuration files (database, etc.)
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication (register, login)
│   │   │   ├── accounts/       # Account management
│   │   │   ├── profiles/       # Profile management
│   │   │   ├── content/        # Movies, series, episodes
│   │   │   └── invitations/    # Referral system
│   │   ├── app.module.ts       # Main application module
│   │   └── main.ts             # Application entry point
│   ├── package.json            # Dependencies
│   └── Dockerfile              # Docker configuration for API
├── db-init/
│   └── streamflix.sql          # Database schema
├── docker-compose.yaml         # Docker services configuration
├── .env                        # Environment variables
└── README.md                   # This file
```

---

## Technology Stack

- **Framework**: NestJS (Node.js framework with TypeScript)
- **ORM**: TypeORM (database abstraction layer)
- **Database**: MySQL 8.0
- **Authentication**: JWT (JSON Web Tokens) + bcrypt for password hashing
- **Validation**: class-validator and class-transformer
- **Containerization**: Docker & Docker Compose

---

## Development Notes

### What's Working
- User registration with email validation  
- Secure login with JWT tokens  
- Content browsing (movies, series, episodes)  
- Age-based content filtering  
- Search functionality  
- Proper database relationships and constraints  
- OOP design patterns in all entities
- XML and JSON response formats (content negotiation)
- Sample data for testing and demonstration  

### What's Next
- Profile management endpoints (create, update, delete profiles)
- Watchlist functionality (add/remove content)
- Watch history tracking with resume position
- Database views and stored procedures
- Role-based access control

---

## Troubleshooting

**Database connection errors?**  
Make sure MySQL container is fully started before the API tries to connect. Check Docker logs with `docker compose logs mysql`

**Port already in use?**  
If port 3000 or 3306 is taken, modify the ports in `docker-compose.yaml`

**Can't import SQL file?**  
Make sure you've selected the correct database (`mydb`) in phpMyAdmin before importing

**API returns empty arrays?**  
Import the sample data: In phpMyAdmin, select `mydb` database, go to Import tab, and import `db-init/sample_data.sql`

**Want to reset the database?**  
Re-import `sample_data.sql` - it will clear existing data and insert fresh sample data

---

## Documentation

- [Backup & Recovery Guide](docs/backup-recovery.md) - How to create and restore database backups

---

## Contact

For questions or issues, contact any of the group members listed above.

Enjoy using StreamFlix API!
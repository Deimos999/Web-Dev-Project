# Event Registration System

A full-stack web application for online event registration with ticket management, QR codes, and user profiles.

## Tech Stack

- **Frontend**: React 19 with React Router
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT Tokens
- **Ticket Generation**: QR Codes with html2canvas

## Project Structure

```
├── Frontend/              # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── App.js
│   │   ├── api.js         # API client
│   │   └── index.js
│   └── package.json
├── backend/               # Express backend server
│   ├── prisma/            # Database schema & migrations
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── utils/         # Utility functions
│   │   └── server.js      # Server entry point
│   └── package.json
├── README.md
└── API_DOCUMENTATION.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Class-Project
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_registration"

# JWT
JWT_SECRET="your_jwt_secret_key_here"

# Server
PORT=5000
NODE_ENV=development

# Email (Optional - for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Setup PostgreSQL Database

Make sure PostgreSQL is running, then create the database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE event_registration;
```

### 5. Run Prisma Migrations

In the backend directory, run:

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Create the Prisma client
- Optionally seed the database with test data

### 6. Seed the Database (Optional)

To populate the database with sample data:

```bash
node prisma/seed.js
```

### 7. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../Frontend
npm install
```

### 8. Configure Frontend API

Create a `.env` file in the Frontend directory (if not exists):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Alternatively, update the API base URL in `Frontend/src/api.js` if needed.

## Running the Application

### Start Backend Server

From the backend directory:

```bash
npm start
```

The server will run on `http://localhost:5000`

You should see:
```
Server running on port 5000
Database connected
```

### Start Frontend Development Server

From the Frontend directory:

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

### Running Both Servers Simultaneously

Option 1: Use two terminal windows
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd Frontend && npm start
```

Option 2: Use a process manager like `concurrently` (if installed)
```bash
npm install -g concurrently
concurrently "npm run start:backend" "npm run start:frontend"
```

## Available Scripts

### Backend Scripts

In the `backend/` directory:

```bash
# Start the server
npm start

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test api.test.js

# Seed database with sample data
node prisma/seed.js

# Open Prisma Studio (visual database editor)
npx prisma studio
```

### Frontend Scripts

In the `Frontend/` directory:

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (careful - irreversible!)
npm run eject
```

## Database Management

### View Database with Prisma Studio

```bash
cd backend
npx prisma studio
```

Opens a visual database editor at `http://localhost:5555`

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data and recreate the schema.

### Create a New Migration

After changing the schema in `prisma/schema.prisma`:

```bash
cd backend
npx prisma migrate dev --name describe_your_changes
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server returns a JWT token
3. Token is stored in localStorage
4. All subsequent requests include the token in the Authorization header

### Demo Credentials

The seeded database includes demo accounts:

- **User Account**
  - Email: `user@example.com`
  - Password: `password123`

- **Organizer Account**
  - Email: `organizer1@example.com`
  - Password: `password123`

## Features

### User Features
- ✅ User registration and authentication
- ✅ Browse events
- ✅ Register for events
- ✅ Download event tickets as PNG images
- ✅ View event QR codes
- ✅ View registration history
- ✅ User profile management

### Organizer Features
- ✅ Create and manage events
- ✅ View registrations
- ✅ Manage event status
- ✅ Export registration data

### Ticket System
- ✅ Generate unique ticket codes
- ✅ QR code generation
- ✅ Download tickets as images
- ✅ Print-ready ticket format

## API Endpoints

For a complete list of API endpoints, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Main Categories:

- **Auth**: `/api/auth/*` (register, login, logout)
- **Events**: `/api/events/*` (list, create, update, delete)
- **Registrations**: `/api/registrations/*` (register, list, manage)
- **Tickets**: `/api/tickets/*` (get, validate)
- **Users**: `/api/users/*` (profile, settings)
- **Categories**: `/api/categories/*` (list categories)
- **Payments**: `/api/payments/*` (payment processing)

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend**:
```bash
# Change PORT in backend/.env to a different port (e.g., 5001)
PORT=5001
```

**Frontend**:
```bash
# Change port when starting
PORT=3001 npm start
```

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Start from Services or: net start PostgreSQL-x64-XX
```

### npm Install Fails

Clear cache and reinstall:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Ensure the frontend API URL matches the backend server address in `Frontend/src/api.js`

### Token Expired

Clear localStorage and log in again:
```javascript
localStorage.clear();
```

## Development Guidelines

### Code Style

- Use ES6+ features
- Follow async/await for promises
- Use meaningful variable names
- Add comments for complex logic

### Commit Messages

Format: `type: description`

Examples:
- `feat: add download ticket feature`
- `fix: resolve login validation error`
- `docs: update API documentation`
- `style: format SignInPage CSS`

### Branch Strategy

- `main` - Production-ready code
- `Dev` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Deployment

### Build Frontend for Production

```bash
cd Frontend
npm run build
```

Creates optimized production build in `Frontend/build/`

### Deploy Backend

1. Set up environment variables on production server
2. Install dependencies: `npm install --production`
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start` (or use PM2/systemd)

### Using PM2 for Backend

```bash
npm install -g pm2

# Start with PM2
pm2 start backend/src/server.js --name "event-api"

# View logs
pm2 logs event-api

# Stop/restart
pm2 stop event-api
pm2 restart event-api
```

## Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd Frontend
npm test
```

## Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "feat: describe your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request to the `Dev` branch

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:

1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Contact the development team

## Quick Reference

### Start Everything

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd Frontend && npm start
```

**Frontend**: http://localhost:3000  
**Backend API**: http://localhost:5000  
**Prisma Studio**: http://localhost:5555 (run `npx prisma studio`)

### Common Commands

```bash
# Database operations
npx prisma migrate dev          # Create migration
npx prisma migrate reset        # Reset database
npx prisma studio              # Open database GUI

# Testing
npm test                        # Run tests
npm test -- --watch            # Watch mode

# Building
npm run build                   # Production build
npm start                       # Start server
```

---

Last Updated: December 11, 2025**⭐ Star this repo if you find it helpful!**
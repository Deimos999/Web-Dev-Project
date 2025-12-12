# EventHub - Event Registration Platform

A complete event management and registration platform built with React, Node.js, Express, and PostgreSQL.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- ✅ User Authentication (Register/Login)
- ✅ Event Discovery & Browsing
- ✅ Event Registration
- ✅ Digital Tickets with QR Codes
- ✅ Registration Management
- ✅ User Profile Management
- ✅ Category Filtering
- ✅ Event Search
- ✅ Responsive Design
- ✅ Dark Theme UI

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- Lucide Icons
- Vite

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Bcryptjs

---

## 📁 Project Structure

```
event-registration-platform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # React context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                  # Express application
    ├── src/
    │   ├── routes/          # API routes
    │   ├── services/        # Business logic
    │   ├── middleware/      # Express middleware
    │   ├── utils/           # Utility functions
    │   └── server.js        # Main server file
    ├── prisma/
    │   ├── schema.prisma    # Database schema
    │   └── seed.js          # Seed script
    ├── package.json
    └── .env
```

---

## 📋 Prerequisites

Make sure you have installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - comes with Node.js
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

Verify installation:
```bash
node --version
npm --version
psql --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/event-registration-platform.git
cd event-registration-platform
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` file with your database credentials:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/eventhub"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NODE_ENV="development"
PORT=4000
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

**Edit `.env.local` file:**
```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=EventHub
```

---

## 🗄️ Database Setup

### Step 1: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE eventhub;

# Exit psql
\q
```

Or using a GUI tool like pgAdmin, create a database named `eventhub`.

### Step 2: Run Prisma Migrations

```bash
# From backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 3: Seed Database with Sample Data

```bash
# From backend directory
npm run prisma:seed
```

This will create:
- Sample categories (Technology, Marketing, Business)
- Sample events (8 events with various details)
- Sample users for testing
- Sample tickets for each event

**Test Accounts:**
```
User: user@example.com / password123
Organizer 1: organizer1@example.com / password123
Organizer 2: organizer2@example.com / password123
Admin: admin@example.com / password123
```

---

## ▶️ Running the Application

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
========================================
Event Registration API Started
🚀 Server: http://localhost:4000
📝 Environment: development
⏰ Started at: 12/12/2025, 12:50:05 PM
========================================
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
Local:   http://localhost:5173/
Network: use --host to expose
```

### Option 2: Run Backend Only

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:4000`

### Option 3: Build for Production

**Build Backend:**
```bash
cd backend
npm run build  # (if available)
npm start
```

**Build Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

---

## ⚙️ Configuration

### Backend Configuration

Edit `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/eventhub"

# JWT
JWT_SECRET="your-secret-key-min-32-characters"

# Environment
NODE_ENV="development"  # or "production"
PORT=4000

# Email (Optional - currently disabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@eventhub.com
```

### Frontend Configuration

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=EventHub
```

For production:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=EventHub
```

---

## 🧪 Testing

### Test User Registration Flow

1. **Register a new user:**
   - Navigate to `http://localhost:5173/register`
   - Fill in the form
   - Click "Register"

2. **Login:**
   - Navigate to `http://localhost:5173/login`
   - Use credentials from step 1

3. **Browse Events:**
   - Navigate to `http://localhost:5173/events`
   - See all seeded events

4. **Register for Event:**
   - Click "View Details" on any event
   - Click "Register Now"

5. **View Registrations:**
   - Navigate to `http://localhost:5173/registrations`
   - Should see your registration

### API Testing

Test API endpoints using curl or Postman:

```bash
# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Get all events
curl http://localhost:4000/api/events

# Health check
curl http://localhost:4000/health
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process (macOS/Linux)
kill -9 <PID>

# Or use different port
PORT=5000 npm run dev
```

### Issue: Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Verify DATABASE_URL in .env
# Format: postgresql://username:password@localhost:5432/eventhub
```

### Issue: Registrations Not Loading (404 Error)

**Problem:** "Route Kaput" error on `/registrations` page

**Solution:**
1. Check backend is running: `npm run dev` in backend folder
2. Check frontend is calling correct endpoint
3. Clear browser cache: `Ctrl+Shift+R`
4. Check browser console (F12) for actual error message

### Issue: Email Error on Registration

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:587`

**Solution:**
- This is non-critical - registration still works
- Email service is optional
- To disable: Comment out email sending in `registrationService.js`

### Issue: Prisma Client Error

**Problem:** `Error: @prisma/client did not initialize yet`

**Solution:**
```bash
cd backend
npx prisma generate
npm install
```

### Issue: Token Expired/401 Unauthorized

**Problem:** Getting 401 errors after some time

**Solution:**
1. Clear browser storage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
2. Login again
3. Try the action again

### Issue: CORS Errors

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Backend already has CORS enabled
- Check `VITE_API_URL` matches backend URL
- Ensure backend is running on port 4000

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (authenticated)
- `PATCH /api/events/:id` - Update event (authenticated)
- `DELETE /api/events/:id` - Delete event (authenticated)
- `POST /api/events/:id/publish` - Publish event (authenticated)

### Registrations
- `POST /api/registration` - Register for event
- `GET /api/registration/user/my-registrations` - Get user's registrations
- `GET /api/registration/event/:eventId` - Get event registrations
- `POST /api/registration/:id/check-in` - Check in attendee
- `POST /api/registration/:id/cancel` - Cancel registration

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update current user
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID (admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details

### Tickets
- `GET /api/tickets/event/:eventId` - Get tickets for event
- `GET /api/tickets/:id` - Get ticket details

---

## 🚀 Deployment

### Deploy Backend (Heroku)

```bash
cd backend

# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET="your-secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

### Deploy Frontend (Vercel)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Update VITE_API_URL to production backend
```

---

## 📝 npm Scripts

### Backend Scripts
```bash
npm run dev              # Start development server with nodemon
npm start               # Start production server
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:seed     # Seed database with sample data
npm run prisma:studio   # Open Prisma Studio
npm test               # Run tests (if configured)
```

### Frontend Scripts
```bash
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

---

## 📖 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL](https://www.postgresql.org/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Check browser console (F12)
3. Check backend logs
4. Open an issue on GitHub

---

## ✅ Quick Start Checklist

- [ ] Node.js and npm installed
- [ ] PostgreSQL installed and running
- [ ] Git repository cloned
- [ ] Backend `.env` configured
- [ ] Frontend `.env.local` configured
- [ ] Database created
- [ ] Prisma migrations run
- [ ] Database seeded
- [ ] Backend running on port 4000
- [ ] Frontend running on port 5173
- [ ] Can access `http://localhost:5173`
- [ ] Can register and login
- [ ] Can view events
- [ ] Can register for events
- [ ] Can view registrations

---

**Happy coding! 🚀**

Last updated: December 12, 2025
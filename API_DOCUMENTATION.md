# Virtual Event Registration Platform - API Documentation

## API Endpoints Summary

### Base URL
```
http://localhost:4000/api
```

All endpoints require JSON content type. Protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication API (`/api/auth`)

### Register User
**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890" (optional)
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `400` - Email already registered
- `400` - Invalid email format
- `400` - Password too short

---

### Login User
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `401` - Invalid credentials
- `401` - User not found

---

## 2. Events API (`/api/events`)

### Get All Events
**GET** `/api/events`

Retrieves paginated list of published events with optional filters.

**Query Parameters:**
- `status` - Filter by status (draft, published, cancelled)
- `categoryId` - Filter by category UUID
- `search` - Search by title or description
- `page` - Page number (default: 0)
- `limit` - Results per page (default: 10)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Web Development Workshop",
    "description": "Learn React and Node.js",
    "imageUrl": "https://example.com/image.jpg",
    "startTime": "2024-12-25T10:00:00Z",
    "endTime": "2024-12-25T16:00:00Z",
    "capacity": 100,
    "status": "published",
    "isFeatured": true,
    "organizerId": "uuid",
    "categoryId": "uuid",
    "createdAt": "2024-12-11T10:00:00Z",
    "updatedAt": "2024-12-11T10:00:00Z",
    "tickets": [],
    "registrations": [],
    "organizer": {
      "id": "uuid",
      "name": "Event Organizer",
      "email": "organizer@example.com"
    }
  }
]
```

---

### Get Event Details
**GET** `/api/events/:id`

Get detailed information about a specific event including tickets and registrations.

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Web Development Workshop",
  "description": "Learn React and Node.js",
  "imageUrl": "https://example.com/image.jpg",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T16:00:00Z",
  "capacity": 100,
  "status": "published",
  "isFeatured": true,
  "tickets": [
    {
      "id": "uuid",
      "name": "Free Ticket",
      "price": 0,
      "quantity": 50,
      "sold": 25
    }
  ],
  "registrations": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "confirmed"
    }
  ],
  "organizer": {
    "id": "uuid",
    "name": "Event Organizer"
  }
}
```

**Error Responses:**
- `404` - Event not found

---

### Create Event
**POST** `/api/events` (Protected)

Creates a new event. User must be authenticated.

**Request Body:**
```json
{
  "title": "Web Development Workshop",
  "description": "Learn React and Node.js",
  "imageUrl": "https://example.com/image.jpg",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T16:00:00Z",
  "capacity": 100,
  "categoryId": "uuid",
  "timezone": "UTC",
  "meetingLink": "https://zoom.us/meeting" (optional)
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Web Development Workshop",
  "status": "draft",
  "organizerId": "uuid",
  "createdAt": "2024-12-11T10:00:00Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Missing required fields
- `400` - Invalid date format

---

### Update Event
**PATCH** `/api/events/:id` (Protected - Organizer Only)

Updates event details. Only event organizer can update.

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "capacity": 150,
  "status": "published"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "status": "published"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Event not found

---

### Publish Event
**POST** `/api/events/:id/publish` (Protected - Organizer Only)

Publishes an event (changes status from draft to published).

**Response (200):**
```json
{
  "id": "uuid",
  "status": "published"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Event not found

---

### Delete Event
**DELETE** `/api/events/:id` (Protected - Organizer Only)

Deletes an event permanently.

**Response (200):**
```json
{
  "message": "Event deleted successfully"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Event not found

---

## 3. Tickets API (`/api/tickets`)

### Get Event Tickets
**GET** `/api/tickets/event/:eventId`

Retrieves all ticket types for an event.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "eventId": "uuid",
    "name": "Free Ticket",
    "description": "Free admission",
    "price": 0,
    "quantity": 50,
    "sold": 25,
    "ticketType": "free",
    "saleStart": "2024-12-01T00:00:00Z",
    "saleEnd": "2024-12-24T23:59:59Z"
  }
]
```

---

### Get Ticket Details
**GET** `/api/tickets/:id`

Get specific ticket information.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Premium Ticket",
  "price": 49.99,
  "quantity": 25,
  "sold": 5
}
```

---

### Create Ticket
**POST** `/api/tickets` (Protected - Organizer Only)

Creates a new ticket type for an event.

**Request Body:**
```json
{
  "eventId": "uuid",
  "ticketType": "paid",
  "name": "Premium Ticket",
  "description": "VIP access with networking",
  "price": 49.99,
  "quantity": 25,
  "saleStart": "2024-12-01T00:00:00Z",
  "saleEnd": "2024-12-24T23:59:59Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Premium Ticket",
  "price": 49.99,
  "quantity": 25,
  "sold": 0
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Event not found

---

### Update Ticket
**PUT** `/api/tickets/:id` (Protected - Organizer Only)

Updates ticket details.

**Request Body:**
```json
{
  "name": "Premium Ticket - Updated",
  "quantity": 30,
  "price": 59.99
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Premium Ticket - Updated",
  "quantity": 30
}
```

---

### Delete Ticket
**DELETE** `/api/tickets/:id` (Protected - Organizer Only)

Deletes a ticket type.

**Response (200):**
```json
{
  "message": "Ticket deleted successfully"
}
```

---

## 4. Registrations API (`/api/registration`)

### Register for Event
**POST** `/api/registration` (Protected)

Registers authenticated user for an event and assigns ticket.

**Request Body:**
```json
{
  "eventId": "uuid",
  "ticketId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "eventId": "uuid",
  "ticketId": "uuid",
  "status": "confirmed",
  "ticketCode": "ABC12345678",
  "qrCodeUrl": "data:image/png;base64,...",
  "checkedIn": false,
  "registeredAt": "2024-12-11T10:00:00Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "event": {
    "id": "uuid",
    "title": "Web Development Workshop"
  },
  "ticket": {
    "id": "uuid",
    "name": "Free Ticket",
    "price": 0
  }
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Already registered for this event
- `400` - No tickets available
- `400` - Tickets sold out
- `404` - Event not found
- `404` - Ticket not found

**Workflow:**
1. Checks event exists
2. Auto-selects first ticket if not provided
3. Verifies user not already registered
4. Verifies ticket availability
5. Creates registration
6. Increments ticket sold count
7. Generates QR code
8. Sends confirmation email

---

### Get My Registrations
**GET** `/api/registration/user/my-registrations` (Protected)

Retrieves all registrations for authenticated user.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "eventId": "uuid",
    "status": "confirmed",
    "ticketCode": "ABC12345678",
    "checkedIn": false,
    "event": {
      "id": "uuid",
      "title": "Web Development Workshop",
      "startTime": "2024-12-25T10:00:00Z"
    },
    "ticket": {
      "id": "uuid",
      "name": "Free Ticket"
    }
  }
]
```

**Error Responses:**
- `401` - Not authenticated

---

### Get Event Registrations
**GET** `/api/registration/event/:eventId` (Protected - Organizer Only)

Retrieves all registrations for an event. Only organizer can view.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "status": "confirmed",
    "checkedIn": false,
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Event not found

---

### Check-in Attendee
**POST** `/api/registration/:id/check-in` (Protected - Organizer Only)

Marks attendee as checked in for event. Used when scanning QR codes.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "confirmed",
  "checkedIn": true,
  "checkedInAt": "2024-12-25T10:30:00Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not event organizer
- `404` - Registration not found

---

### Cancel Registration
**POST** `/api/registration/:id/cancel` (Protected - User Only)

Cancels a registration and refunds ticket. User can only cancel their own registrations.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "cancelled"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Cannot cancel other user's registration
- `400` - Cannot cancel if already checked in
- `404` - Registration not found

**Workflow:**
1. Verifies registration exists
2. Verifies user owns registration
3. Prevents cancellation if checked in
4. Decrements ticket sold count
5. Updates registration status to cancelled

---

## 5. Payments API (`/api/payments`)

### Create Payment Intent
**POST** `/api/payments` (Protected)

Creates a Stripe payment intent for a registration with paid ticket.

**Request Body:**
```json
{
  "registrationId": "uuid",
  "amount": 49.99
}
```

**Response (201):**
```json
{
  "payment": {
    "id": "uuid",
    "stripePaymentId": "pi_xxxxx",
    "amount": 49.99,
    "currency": "usd",
    "status": "pending"
  },
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

**Error Responses:**
- `401` - Not authenticated
- `400` - Missing required fields
- `400` - Invalid amount
- `404` - Registration not found

---

### Confirm Payment
**POST** `/api/payments/confirm` (Protected)

Confirms successful Stripe payment and updates registration status.

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "registrationId": "uuid"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "amount": 49.99,
  "paidAt": "2024-12-11T10:00:00Z"
}
```

**Workflow:**
1. Verifies payment with Stripe
2. Updates payment status to completed
3. Updates registration status to confirmed
4. Sends payment receipt email

---

### Get User Payments
**GET** `/api/payments/user/my-payments` (Protected)

Retrieves payment history for authenticated user.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "amount": 49.99,
    "status": "completed",
    "paidAt": "2024-12-11T10:00:00Z",
    "registration": {
      "id": "uuid",
      "event": {
        "id": "uuid",
        "title": "Web Development Workshop"
      }
    }
  }
]
```

---

### Refund Payment
**POST** `/api/payments/:id/refund` (Protected - User Only)

Refunds a payment and cancels registration.

**Response (200):**
```json
{
  "id": "uuid",
  "status": "refunded"
}
```

---

## 6. Users API (`/api/users`)

### Get Current User Profile
**GET** `/api/users/me` (Protected)

Returns authenticated user's profile.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "createdAt": "2024-12-11T10:00:00Z"
}
```

---

### Update User Profile
**PUT** `/api/users/me` (Protected)

Updates authenticated user's profile.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "+9876543210"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "phone": "+9876543210"
}
```

---

### Get All Users (Admin)
**GET** `/api/users` (Protected - Admin Only)

Retrieves list of all users.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-12-11T10:00:00Z"
  }
]
```

---

### Get User by ID (Admin)
**GET** `/api/users/:id` (Protected - Admin Only)

Gets specific user details including their events and registrations.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "organizer@example.com",
  "name": "Event Organizer",
  "role": "organizer",
  "events": [],
  "registrations": []
}
```

---

### Update User (Admin)
**PUT** `/api/users/:id` (Protected - Admin Only)

Updates user details including role.

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1111111111",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully (Admin action)",
  "user": {
    "id": "uuid",
    "role": "admin"
  }
}
```

---

### Delete User (Admin)
**DELETE** `/api/users/:id` (Protected - Admin Only)

Deletes a user and associated data.

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 7. Categories API (`/api/categories`)

### Get All Categories
**GET** `/api/categories`

Retrieves all event categories.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Technology",
    "slug": "technology",
    "color": "#3B82F6",
    "_count": {
      "events": 5
    }
  }
]
```

---

### Get Category Details
**GET** `/api/categories/:id`

Gets specific category with published events.

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Technology",
  "slug": "technology",
  "color": "#3B82F6",
  "events": [
    {
      "id": "uuid",
      "title": "Web Development Workshop"
    }
  ]
}
```

---

### Create Category (Admin)
**POST** `/api/categories` (Protected - Admin Only)

Creates a new category.

**Request Body:**
```json
{
  "name": "Technology",
  "slug": "technology",
  "color": "#3B82F6"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Technology",
  "slug": "technology",
  "color": "#3B82F6"
}
```

---

### Update Category (Admin)
**PATCH** `/api/categories/:id` (Protected - Admin Only)

Updates category details.

**Request Body:**
```json
{
  "name": "Tech & Science",
  "color": "#2563EB"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Tech & Science"
}
```

---

### Delete Category (Admin)
**DELETE** `/api/categories/:id` (Protected - Admin Only)

Deletes category (only if no events exist).

**Response (200):**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Authentication Flow

### User Registration & Login
```
User Registration
   ↓
POST /api/auth/register
   ↓
Create User in DB
Generate JWT Token
   ↓
Return token & user info
   ↓
Frontend stores in localStorage
   ↓
Token added to all future requests
```

### Token Usage
All protected endpoints require:
```
Header: Authorization: Bearer <jwt_token>
```

---

## Event Registration Workflow

```
User browsing events
   ↓
GET /api/events
   ↓
User selects event
   ↓
GET /api/events/:id
GET /api/tickets/event/:eventId
   ↓
User clicks register
   ↓
POST /api/registration
   ├─ Validate event exists
   ├─ Validate ticket available
   ├─ Check not already registered
   ├─ Create registration
   ├─ Increment ticket.sold
   ├─ Generate QR code
   ├─ Send confirmation email
   └─ Return registration with ticket
   ↓
User receives:
├─ Ticket code
├─ QR code image
├─ Confirmation email
└─ Registration status
```

## Ticket Workflow (Organizer)

```
Organizer creates event
   ↓
POST /api/events
   ↓
Event created in DRAFT status
   ↓
Organizer adds tickets
   ↓
POST /api/tickets
   ├─ Free ticket (price = 0)
   ├─ Paid ticket (price > 0)
   └─ VIP ticket
   ↓
Organizer publishes event
   ↓
POST /api/events/:id/publish
   ↓
Event status changes to PUBLISHED
   ↓
Users can now register
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request |
| 401  | Unauthorized |
| 403  | Forbidden |
| 404  | Not Found |
| 500  | Server Error |

All error responses include:
```json
{
  "status": "fail" or "error",
  "message": "Error description"
}
```

---

## Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm test -- --coverage
```

Watch mode:
```bash
npm run test:watch
```

Test file: `backend/__tests__/api.test.js`

Includes 40+ tests covering:
- Authentication
- Event CRUD
- Ticket management
- User registration & workflow
- Payment processing
- User management
- Error handling
- Full integration workflows

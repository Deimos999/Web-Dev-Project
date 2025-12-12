import request from "supertest";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "../src/routes/authRoutes.js";
import eventRoutes from "../src/routes/eventRoutes.js";
import registrationRoutes from "../src/routes/registrationRoutes.js";
import ticketRoutes from "../src/routes/ticketRoutes.js";
import paymentRoutes from "../src/routes/paymentRoutes.js";
import userRoutes from "../src/routes/userRoutes.js";
import categoryRoutes from "../src/routes/categoryRoutes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registration", registrationRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/categories", categoryRoutes);

// Error handler
app.use(errorHandler);

// Test data
let token = "";
let userId = "";
let organizerId = "";
let organizerToken = "";
let eventId = "";
let ticketId = "";
let registrationId = "";
let categoryId = "";

describe("Virtual Event Registration API - Full Integration Tests", () => {
  beforeAll(async () => {
    // Clean up test data before running tests
    await prisma.registration.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.event.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.category.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==========================================
  // AUTHENTICATION TESTS
  // ==========================================
  describe("Authentication API", () => {
    test("POST /api/auth/register - Should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "user@example.com",
        password: "password123",
        name: "Test User",
        phone: "+1234567890",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("user@example.com");
      expect(res.body.user.role).toBe("user");

      token = res.body.token;
      userId = res.body.user.id;
    });

    test("POST /api/auth/register - Should not register duplicate email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "user@example.com",
        password: "password456",
        name: "Another User",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("already registered");
    });

    test("POST /api/auth/login - Should login user with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("user@example.com");
    });

    test("POST /api/auth/login - Should reject invalid password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "user@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
    });

    test("POST /api/auth/register - Register organizer", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "organizer@example.com",
        password: "password123",
        name: "Event Organizer",
        phone: "+9876543210",
      });

      expect(res.statusCode).toBe(201);
      organizerToken = res.body.token;
      organizerId = res.body.user.id;
    });
  });

  // ==========================================
  // CATEGORY TESTS
  // ==========================================
  describe("Category API", () => {
    test("GET /api/categories - Should get all categories", async () => {
      const res = await request(app).get("/api/categories");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/categories - Admin should create category", async () => {
      // First create admin user
      const adminRes = await request(app).post("/api/auth/register").send({
        email: "admin@example.com",
        password: "password123",
        name: "Admin User",
      });

      const adminToken = adminRes.body.token;

      // Update user role to admin
      await prisma.user.update({
        where: { id: adminRes.body.user.id },
        data: { role: "admin" },
      });

      const res = await request(app)
        .post("/api/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Technology",
          slug: "technology",
          color: "#3B82F6",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("Technology");
      categoryId = res.body.id;
    });
  });

  // ==========================================
  // EVENT TESTS
  // ==========================================
  describe("Event API", () => {
    test("GET /api/events - Should get all events", async () => {
      const res = await request(app).get("/api/events");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/events - Organizer should create event", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          title: "Web Development Workshop",
          description: "Learn React and Node.js",
          imageUrl: "https://example.com/image.jpg",
          startTime: "2024-12-25T10:00:00Z",
          endTime: "2024-12-25T16:00:00Z",
          capacity: 100,
          categoryId: categoryId,
          timezone: "UTC",
          meetingLink: "https://zoom.us/meeting",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe("Web Development Workshop");
      expect(res.body.status).toBe("draft");
      eventId = res.body.id;
    });

    test("GET /api/events/:id - Should get event details", async () => {
      const res = await request(app).get(`/api/events/${eventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(eventId);
      expect(res.body.title).toBe("Web Development Workshop");
    });

    test("PATCH /api/events/:id - Organizer should update event", async () => {
      const res = await request(app)
        .patch(`/api/events/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          title: "Advanced Web Development Workshop",
          description: "Learn advanced React and Node.js",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("Advanced Web Development Workshop");
    });

    test("POST /api/events/:id/publish - Organizer should publish event", async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/publish`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("published");
    });

    test("POST /api/events - Should fail without auth", async () => {
      const res = await request(app).post("/api/events").send({
        title: "Unauthorized Event",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // TICKET TESTS
  // ==========================================
  describe("Ticket API", () => {
    test("POST /api/tickets - Organizer should create ticket", async () => {
      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          eventId: eventId,
          ticketType: "free",
          name: "Free Ticket",
          description: "Free admission ticket",
          price: 0,
          quantity: 50,
          saleStart: "2024-12-01T00:00:00Z",
          saleEnd: "2024-12-24T23:59:59Z",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe("Free Ticket");
      expect(res.body.price).toBe(0);
      ticketId = res.body.id;
    });

    test("POST /api/tickets - Create paid ticket", async () => {
      const res = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          eventId: eventId,
          ticketType: "paid",
          name: "Premium Ticket",
          description: "Premium admission ticket",
          price: 49.99,
          quantity: 25,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.price).toBe(49.99);
      expect(res.body.sold).toBe(0);
    });

    test("GET /api/tickets/event/:eventId - Should get event tickets", async () => {
      const res = await request(app).get(`/api/tickets/event/${eventId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test("GET /api/tickets/:id - Should get ticket by ID", async () => {
      const res = await request(app).get(`/api/tickets/${ticketId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(ticketId);
    });

    test("PUT /api/tickets/:id - Organizer should update ticket", async () => {
      const res = await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          name: "Free Ticket - Updated",
          quantity: 75,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Free Ticket - Updated");
      expect(res.body.quantity).toBe(75);
    });

    test("DELETE /api/tickets/:id - Organizer should delete ticket", async () => {
      // Create a ticket first
      const createRes = await request(app)
        .post("/api/tickets")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          eventId: eventId,
          ticketType: "vip",
          name: "VIP Ticket",
          price: 99.99,
          quantity: 10,
        });

      const vipTicketId = createRes.body.id;

      // Delete it
      const res = await request(app)
        .delete(`/api/tickets/${vipTicketId}`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  // ==========================================
  // REGISTRATION TESTS
  // ==========================================
  describe("Registration API", () => {
    test("POST /api/registration - User should register for event", async () => {
      const res = await request(app)
        .post("/api/registration")
        .set("Authorization", `Bearer ${token}`)
        .send({
          eventId: eventId,
          ticketId: ticketId,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(userId);
      expect(res.body.eventId).toBe(eventId);
      expect(res.body.status).toBe("confirmed");
      expect(res.body).toHaveProperty("ticketCode");
      expect(res.body).toHaveProperty("qrCodeUrl");
      registrationId = res.body.id;
    });

    test("POST /api/registration - Should fail if already registered", async () => {
      const res = await request(app)
        .post("/api/registration")
        .set("Authorization", `Bearer ${token}`)
        .send({
          eventId: eventId,
          ticketId: ticketId,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Already registered");
    });

    test("GET /api/registration/user/my-registrations - User should get their registrations", async () => {
      const res = await request(app)
        .get("/api/registration/user/my-registrations")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].userId).toBe(userId);
    });

    test("GET /api/registration/event/:eventId - Organizer should view event registrations", async () => {
      const res = await request(app)
        .get(`/api/registration/event/${eventId}`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("POST /api/registration/:id/check-in - Organizer should check in attendee", async () => {
      const res = await request(app)
        .post(`/api/registration/${registrationId}/check-in`)
        .set("Authorization", `Bearer ${organizerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.checkedIn).toBe(true);
    });

    test("POST /api/registration/:id/cancel - User should cancel registration", async () => {
      // Create a new registration first
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          email: "user2@example.com",
          password: "password123",
          name: "Test User 2",
        });

      const newToken = registerRes.body.token;
      const newUserId = registerRes.body.user.id;

      // Register for event
      const regRes = await request(app)
        .post("/api/registration")
        .set("Authorization", `Bearer ${newToken}`)
        .send({
          eventId: eventId,
          ticketId: ticketId,
        });

      const newRegId = regRes.body.id;

      // Cancel registration
      const res = await request(app)
        .post(`/api/registration/${newRegId}/cancel`)
        .set("Authorization", `Bearer ${newToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe("cancelled");
    });

    test("POST /api/registration - Should fail without auth", async () => {
      const res = await request(app).post("/api/registration").send({
        eventId: eventId,
        ticketId: ticketId,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // PAYMENT TESTS
  // ==========================================
  describe("Payment API", () => {
    test("POST /api/payments - Should create payment intent", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          registrationId: registrationId,
          amount: 49.99,
        });

      // Note: This will fail if STRIPE_SECRET_KEY is not set
      // In production, you'd need a valid Stripe key
      if (process.env.STRIPE_SECRET_KEY) {
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("clientSecret");
      }
    });

    test("POST /api/payments - Should fail without required fields", async () => {
      const res = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          registrationId: registrationId,
        });

      expect(res.statusCode).toBe(400);
    });

    test("POST /api/payments - Should fail without auth", async () => {
      const res = await request(app).post("/api/payments").send({
        registrationId: registrationId,
        amount: 49.99,
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // USER TESTS
  // ==========================================
  describe("User API", () => {
    test("GET /api/users/me - Should get current user profile", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(userId);
      expect(res.body.email).toBe("user@example.com");
    });

    test("PUT /api/users/me - User should update their profile", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated User Name",
          phone: "+1111111111",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe("Updated User Name");
      expect(res.body.phone).toBe("+1111111111");
    });

    test("GET /api/users/me - Should fail without auth", async () => {
      const res = await request(app).get("/api/users/me");
      expect(res.statusCode).toBe(401);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================
  describe("Error Handling", () => {
    test("GET /nonexistent - Should return 404", async () => {
      const res = await request(app).get("/api/nonexistent");
      expect(res.statusCode).toBe(404);
    });

    test("GET /api/events/:invalidId - Should return 404", async () => {
      const res = await request(app).get("/api/events/invalid-id");
      expect(res.statusCode).toBe(404);
    });

    test("POST /api/events - Invalid data should return 400", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Event without required fields",
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ==========================================
  // API WORKFLOW TESTS
  // ==========================================
  describe("Complete Workflow", () => {
    test("Full event registration workflow", async () => {
      // 1. Create new user
      const userRes = await request(app).post("/api/auth/register").send({
        email: "workflow@example.com",
        password: "password123",
        name: "Workflow User",
      });

      const workflowToken = userRes.body.token;
      const workflowUserId = userRes.body.user.id;

      // 2. Get available events
      const eventsRes = await request(app).get("/api/events");
      expect(eventsRes.statusCode).toBe(200);
      expect(eventsRes.body.length).toBeGreaterThan(0);

      // 3. Get tickets for event
      const ticketsRes = await request(app).get(`/api/tickets/event/${eventId}`);
      expect(ticketsRes.statusCode).toBe(200);
      expect(ticketsRes.body.length).toBeGreaterThan(0);

      // 4. Register for event
      const registerRes = await request(app)
        .post("/api/registration")
        .set("Authorization", `Bearer ${workflowToken}`)
        .send({
          eventId: eventId,
          ticketId: ticketId,
        });

      expect(registerRes.statusCode).toBe(201);
      const newRegistrationId = registerRes.body.id;

      // 5. Get user registrations
      const myRegsRes = await request(app)
        .get("/api/registration/user/my-registrations")
        .set("Authorization", `Bearer ${workflowToken}`);

      expect(myRegsRes.statusCode).toBe(200);
      expect(myRegsRes.body.some((r) => r.id === newRegistrationId)).toBe(true);

      // 6. Get user profile
      const profileRes = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${workflowToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(profileRes.body.id).toBe(workflowUserId);
    });
  });
});

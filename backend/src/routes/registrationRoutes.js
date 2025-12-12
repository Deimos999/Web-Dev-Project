import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  validateRegisterForEvent,
  validateRequest,
} from "../middleware/validationMiddleware.js";
import {
  registerForEvent,
  getRegistrationsByUser,
  getRegistrationsByEvent,
  checkInAttendee,
  cancelRegistration,
} from "../services/registrationService.js";

const router = express.Router();

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE generic :id routes
// Otherwise /user/my-registrations gets matched as /:id

// GET /api/registration/user/my-registrations - Get current user's registrations
router.get("/user/my-registrations", authenticate, async (req, res, next) => {
  try {
    const registrations = await getRegistrationsByUser(req.user.userId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

// POST /api/registration - Register for event
router.post("/", authenticate, validateRegisterForEvent, validateRequest, async (req, res, next) => {
  try {
    const registration = await registerForEvent(
      req.user.userId,
      req.body.eventId,
      req.body.ticketId
    );
    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
});

// GET /api/registration/event/:eventId - Get registrations for specific event
router.get("/event/:eventId", authenticate, async (req, res, next) => {
  try {
    const registrations = await getRegistrationsByEvent(req.params.eventId, req.user.userId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

// Public endpoint - Get event registrations (no auth required)
router.get("/public/event/:eventId", async (req, res, next) => {
  try {
    const registrations = await getRegistrationsByEvent(req.params.eventId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
});

// POST /api/registration/:id/check-in - Check in attendee
router.post("/:id/check-in", authenticate, async (req, res, next) => {
  try {
    const registration = await checkInAttendee(req.params.id, req.user.userId);
    res.json(registration);
  } catch (error) {
    next(error);
  }
});

// POST /api/registration/:id/cancel - Cancel registration
router.post("/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const registration = await cancelRegistration(req.params.id, req.user.userId);
    res.json(registration);
  } catch (error) {
    next(error);
  }
});

export default router;
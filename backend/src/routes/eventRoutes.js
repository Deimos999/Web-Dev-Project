import express from "express";
import {
  validateCreateEvent,
  validateRequest,
} from "../middleware/validationMiddleware.js";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent as deleteEventService,
  publishEvent,
} from "../services/eventService.js";

const router = express.Router();

// Public routes
router.get("/", async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      categoryId: req.query.categoryId,
      search: req.query.search,
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 10,
    };
    const events = await getEvents(filters);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.post(
  "/",
  authenticate,
  validateCreateEvent,
  validateRequest,
  async (req, res, next) => {
    try {
      const event = await createEvent(req.body, req.user.userId);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const event = await updateEvent(req.params.id, req.body, req.user.userId);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// DELETE - Admin or Organizer only
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;
    const role = req.user.role;

    // Fetch event
    const event = await getEventById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check permission: Admin or Organizer
    if (role !== "ADMIN" && event.organizerId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    // Delete event
    await deleteEventService(eventId);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Publish event - only Organizer
router.post("/:id/publish", authenticate, async (req, res, next) => {
  try {
    const event = await publishEvent(req.params.id, req.user.userId);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

export default router;

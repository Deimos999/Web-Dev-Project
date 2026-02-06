import express from "express";
import {
  validateCreateEvent,
  validateRequest,
} from "../middleware/validationMiddleware.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent as deleteEventService,
  publishEvent,
  createEventProposal,
  getEventProposals,
  approveEventProposal,
  rejectEventProposal,
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
  authorize("ADMIN"),
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

// Organizer: submit event proposal for approval
router.post(
  "/proposals",
  authenticate,
  authorize("ORGANIZER"),
  validateCreateEvent,
  validateRequest,
  async (req, res, next) => {
    try {
      const proposal = await createEventProposal(req.body, req.user.userId);
      res.status(201).json(proposal);
    } catch (error) {
      next(error);
    }
  }
);

// Admin: list all event proposals
router.get(
  "/proposals",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const proposals = await getEventProposals();
      res.json(proposals);
    } catch (error) {
      next(error);
    }
  }
);

// Admin: approve proposal (creates real event)
router.post(
  "/proposals/:id/approve",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const event = await approveEventProposal(req.params.id);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }
);

// Admin: reject proposal
router.post(
  "/proposals/:id/reject",
  authenticate,
  authorize("ADMIN"),
  async (req, res, next) => {
    try {
      const { reason } = req.body;
      const proposal = await rejectEventProposal(req.params.id, reason);
      res.json(proposal);
    } catch (error) {
      next(error);
    }
  }
);

router.patch("/:id", authenticate, async (req, res, next) => {
  try {
    const event = await updateEvent(
      req.params.id,
      req.body,
      req.user.userId,
      req.user.role
    );
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

    // Delegate permission checks to service
    const result = await deleteEventService(eventId, userId, role);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Publish event - only Organizer
router.post("/:id/publish", authenticate, async (req, res, next) => {
  try {
    const event = await publishEvent(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    res.json(event);
  } catch (error) {
    next(error);
  }
});

export default router;

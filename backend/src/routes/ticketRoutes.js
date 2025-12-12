import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createTicket,
  getTicketsByEvent,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../services/ticketService.js";

const router = express.Router();

// GET /api/tickets/event/:eventId - Get all tickets for an event
router.get("/event/:eventId", async (req, res, next) => {
  try {
    const tickets = await getTicketsByEvent(req.params.eventId);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
});

// GET /api/tickets/:id - Get a specific ticket
router.get("/:id", async (req, res, next) => {
  try {
    const ticket = await getTicketById(req.params.id);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// POST /api/tickets - Create a new ticket (Organizer only)
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { eventId, ...ticketData } = req.body;
    const ticket = await createTicket(eventId, ticketData, req.user.id);
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tickets/:id - Update a ticket (Organizer only)
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const ticket = await updateTicket(req.params.id, req.body, req.user.id);
    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tickets/:id - Delete a ticket (Organizer only)
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const result = await deleteTicket(req.params.id, req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;

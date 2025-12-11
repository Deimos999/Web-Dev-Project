import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import { generateTicketCode, generateQRcode } from "../utils/qrCodeUtils.js";
import { sendRegistrationConfirmation } from "../utils/emailUtils.js";

const prisma = new PrismaClient();

export const registerForEvent = async (userId, eventId, ticketId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError("Event not found", 404);

  // Auto-select first ticket if not provided
  if (!ticketId) {
    const tickets = await prisma.ticket.findMany({ where: { eventId } });
    if (tickets.length === 0) throw new AppError("No tickets available", 400);
    ticketId = tickets[0].id;
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw new AppError("Ticket not found", 404);

  const existingRegistration = await prisma.registration.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existingRegistration) throw new AppError("Already registered for this event", 400);

  if (ticket.sold >= ticket.quantity) throw new AppError("This ticket type is sold out", 400);

  const ticketCode = generateTicketCode();

  const registration = await prisma.registration.create({
    data: {
      userId,
      eventId,
      ticketId,
      ticketCode,
      status: ticket.price > 0 ? "pending" : "confirmed",
    },
    include: { user: true, event: true, ticket: true },
  });

  // Increment ticket sold count
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { sold: { increment: 1 } },
  });

  const qrData = { registrationId: registration.id, ticketCode, eventTitle: event.title };
  const qrCodeUrl = await generateQRcode(qrData);

  const updatedRegistration = await prisma.registration.update({
    where: { id: registration.id },
    data: { qrCodeUrl },
    include: { user: true, event: true, ticket: true },
  });

  // Send confirmation email
  await sendRegistrationConfirmation(
    registration.user.email,
    event.title,
    ticketCode
  );

  return updatedRegistration;
};

export const getRegistrationsByUser = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: { user: true, event: true, ticket: true },
    orderBy: { registeredAt: "desc" },
  });

  if (!registrations) {
    throw new AppError("No registrations found", 404);
  }

  return registrations;
};

export const getRegistrationsByEvent = async (eventId, userId) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    throw new AppError("Event not found", 404);
  }

  // Check if user is organizer of event (optional - for authorization)
  if (userId && event.organizerId !== userId) {
    throw new AppError("You can only view registrations for your own events", 403);
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: { user: true, ticket: true },
    orderBy: { registeredAt: "desc" },
  });

  return registrations;
};

export const checkInAttendee = async (registrationId, userId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true, user: true, ticket: true },
  });

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  // Verify user is organizer of the event
  if (registration.event.organizerId !== userId) {
    throw new AppError("You can only check in attendees for your own events", 403);
  }

  const updatedRegistration = await prisma.registration.update({
    where: { id: registrationId },
    data: { checkedIn: true },
    include: { user: true, event: true, ticket: true },
  });

  return updatedRegistration;
};

export const cancelRegistration = async (registrationId, userId) => {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: { event: true, user: true, ticket: true },
  });

  if (!registration) {
    throw new AppError("Registration not found", 404);
  }

  // Verify user owns this registration
  if (registration.userId !== userId) {
    throw new AppError("You can only cancel your own registrations", 403);
  }

  // Cannot cancel if already checked in
  if (registration.checkedIn) {
    throw new AppError("Cannot cancel registration for event that has started", 400);
  }

  // Decrement ticket sold count
  await prisma.ticket.update({
    where: { id: registration.ticketId },
    data: { sold: { decrement: 1 } },
  });

  const canceledRegistration = await prisma.registration.update({
    where: { id: registrationId },
    data: { status: "cancelled" },
    include: { user: true, event: true, ticket: true },
  });

  return canceledRegistration;
};

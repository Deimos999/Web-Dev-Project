import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";
import { generateTicketCode, generateQRcode } from "../utils/qrCodeUtils.js";
import { sendRegistrationConfirmation } from "../utils/emailUtils.js";

const prisma = new PrismaClient();

export const registerForEvent = async (userId, eventId, ticketId) => {
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);

    // Fetch all tickets to choose an available one if none provided
    const tickets = await tx.ticket.findMany({
      where: { eventId },
      orderBy: { price: "asc" },
    });
    if (tickets.length === 0)
      throw new AppError("No tickets available for this event", 400);

    let ticket = null;

    if (ticketId) {
      ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) throw new AppError("Ticket not found", 404);
      if (ticket.sold >= ticket.quantity)
        throw new AppError("This ticket type is sold out", 400);
    } else {
      // Auto-pick the first available ticket
      ticket = tickets.find((t) => t.sold < t.quantity);
      if (!ticket) throw new AppError("All tickets are sold out", 400);
      ticketId = ticket.id;
    }

    const existingRegistration = await tx.registration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existingRegistration)
      throw new AppError("Already registered for this event", 400);

    if (ticket.sold >= ticket.quantity)
      throw new AppError("This ticket type is sold out", 400);

    const ticketCode = generateTicketCode();
    const price = ticket.price || 0;

    // If ticket has a price, require sufficient wallet balance and charge immediately
    let wallet = null;
    if (price > 0) {
      wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < price) {
        throw new AppError(
          "Insufficient wallet balance to register for this event",
          400
        );
      }
    }

    const registration = await tx.registration.create({
      data: {
        userId,
        eventId,
        ticketId,
        ticketCode,
        status: price > 0 ? "confirmed" : "confirmed",
      },
      include: { user: true, event: true, ticket: true },
    });

    // Increment ticket sold count
    await tx.ticket.update({
      where: { id: ticketId },
      data: { sold: { increment: 1 } },
    });

    // Charge wallet if needed
    if (price > 0 && wallet) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: price,
          },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT_REGISTRATION",
          amount: price,
          reference: `registration:${registration.id}`,
        },
      });
    }

    let qrCodeUrl = null;
    try {
      const qrData = {
        registrationId: registration.id,
        ticketCode,
        eventTitle: event.title,
      };
      qrCodeUrl = await generateQRcode(qrData);
    } catch (err) {
      console.warn("QR code generation failed:", err.message);
      // Continue without QR code - not critical
    }

    const updatedRegistration = await tx.registration.update({
      where: { id: registration.id },
      data: { qrCodeUrl },
      include: { user: true, event: true, ticket: true },
    });

    // Send confirmation email (non-blocking - don't wait for it)
    try {
      await sendRegistrationConfirmation(
        registration.user.email,
        event.title,
        ticketCode
      );
    } catch (err) {
      console.warn("Email sending failed (non-critical):", err.message);
      // Don't throw - registration is already successful
    }

    return updatedRegistration;
  });
};

export const getRegistrationsByUser = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: { user: true, event: true, ticket: true },
    orderBy: { registeredAt: "desc" },
  });

  return registrations; // Return empty array instead of throwing error
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
  return await prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
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
      throw new AppError(
        "Cannot cancel registration for event that has started",
        400
      );
    }

    // Decrement ticket sold count
    await tx.ticket.update({
      where: { id: registration.ticketId },
      data: { sold: { decrement: 1 } },
    });

    // If this was a paid ticket, refund to wallet (if wallet exists)
    const price = registration.ticket?.price || 0;
    if (price > 0) {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (wallet) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: {
              increment: price,
            },
          },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "CREDIT_REFUND",
            amount: price,
            reference: `refund:${registration.id}`,
          },
        });
      }
    }

    const canceledRegistration = await tx.registration.delete({
      where: { id: registrationId },
      include: { user: true, event: true, ticket: true },
    });

    return canceledRegistration;
  });
};
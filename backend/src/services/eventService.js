import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createEvent = async (eventData, organizerId) => {
  // Validate date range
  const startTime = new Date(eventData.startTime);
  const endTime = new Date(eventData.endTime);
  
  if (endTime <= startTime) {
    throw new AppError("Event end time must be after start time", 400);
  }

  // Validate capacity
  if (eventData.capacity < 1) {
    throw new AppError("Event capacity must be at least 1", 400);
  }

  // Create event and a default ticket in one transaction so new events are always registerable
  return await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        imageUrl: eventData.imageUrl,
        startTime,
        endTime,
        timezone: eventData.timezone || "UTC",
        meetingLink: eventData.meetingLink,
        capacity: eventData.capacity,
        organizerId,
        categoryId: eventData.categoryId,
        // Allow callers (e.g. admin approval flow) to explicitly set status,
        // but default to "draft" for regular creations.
        status: eventData.status || "draft",
      },
      include: { organizer: true, category: true },
    });

    // Determine ticket data (fallback to free default)
    const userTicket = Array.isArray(eventData.tickets) && eventData.tickets[0];
    const price = typeof userTicket?.price === "number" ? userTicket.price : 0;
    const ticketName = userTicket?.name || "General Admission";
    const ticketDescription = userTicket?.description || "Default ticket";
    const ticketQuantity =
      typeof userTicket?.quantity === "number" && userTicket.quantity > 0
        ? userTicket.quantity
        : event.capacity;

    // Ensure at least one ticket exists for the event so registration works
    await tx.ticket.create({
      data: {
        eventId: event.id,
        ticketType: "general",
        name: ticketName,
        description: ticketDescription,
        price,
        quantity: ticketQuantity,
        sold: 0,
      },
    });

    // Return event with relations
    return await tx.event.findUnique({
      where: { id: event.id },
      include: { organizer: true, category: true, tickets: true },
    });
  });
};

export const getEvents = async (filters = {}) => {
  const where = {};
  
  if (filters.status) where.status = filters.status;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return await prisma.event.findMany({
    where,
    include: { 
      organizer: true, 
      category: true, 
      registrations: true,
      tickets: true
    },
    orderBy: { createdAt: "desc" },
    skip: (filters.page || 0) * (filters.limit || 10),
    take: filters.limit || 10,
  });
};

export const getEventById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { 
      organizer: true, 
      category: true, 
      registrations: {
        include: {
          user: true,
          ticket: true
        }
      }, 
      tickets: true 
    },
  });
  
  if (!event) throw new AppError("Event not found", 404);
  return event;
};

export const updateEvent = async (eventId, eventData, userId, userRole) => {
  const event = await getEventById(eventId);
  
  // Check permission: Admin can update any event, Organizer only their own
  if (userRole !== "ADMIN" && event.organizerId !== userId) {
    throw new AppError("You can only update your own events", 403);
  }

  // Validate date range if dates are being updated
  if (eventData.startTime || eventData.endTime) {
    const startTime = eventData.startTime ? new Date(eventData.startTime) : event.startTime;
    const endTime = eventData.endTime ? new Date(eventData.endTime) : event.endTime;
    
    if (endTime <= startTime) {
      throw new AppError("Event end time must be after start time", 400);
    }
  }

  // Validate capacity if being updated - cannot reduce below current registrations
  if (eventData.capacity !== undefined) {
    const newCapacity = parseInt(eventData.capacity);
    if (newCapacity < 1) {
      throw new AppError("Event capacity must be at least 1", 400);
    }
    const currentRegistrations = event.registrations?.length || 0;
    if (newCapacity < currentRegistrations) {
      throw new AppError(
        `Cannot reduce capacity below ${currentRegistrations} (current registrations)`,
        400
      );
    }
  }

  // Update basic event fields
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: eventData.title || event.title,
      description: eventData.description || event.description,
      imageUrl: eventData.imageUrl || event.imageUrl,
      startTime: eventData.startTime ? new Date(eventData.startTime) : event.startTime,
      endTime: eventData.endTime ? new Date(eventData.endTime) : event.endTime,
      meetingLink: eventData.meetingLink || event.meetingLink,
      capacity: eventData.capacity || event.capacity,
      status: eventData.status || event.status,
      // Allow changing category from the edit form
      categoryId: eventData.categoryId || event.categoryId,
    },
    include: { organizer: true, category: true, tickets: true },
  });

  // Optionally update ticket price if provided (simple single-price model)
  const newTicketPrice =
    Array.isArray(eventData.tickets) && typeof eventData.tickets[0]?.price === "number"
      ? eventData.tickets[0].price
      : null;

  if (newTicketPrice !== null) {
    await prisma.ticket.updateMany({
      where: { eventId },
      data: { price: newTicketPrice },
    });
  }

  // Return event with fresh tickets
  return await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true, category: true, tickets: true },
  });
};

// FIXED: Proper cascade deletion with transaction
export const deleteEvent = async (eventId, userId, userRole) => {
  console.log(`[DELETE EVENT] Starting deletion for eventId: ${eventId}`);
  console.log(`[DELETE EVENT] User: ${userId}, Role: ${userRole}`);

  // Fetch event first (no heavy includes needed)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, title: true, organizerId: true },
  });

  if (!event) {
    console.log(`[DELETE EVENT] Event not found: ${eventId}`);
    throw new AppError("Event not found", 404);
  }

  console.log(`[DELETE EVENT] Event found: ${event.title}`);
  console.log(`[DELETE EVENT] Organizer: ${event.organizerId}, Current User: ${userId}`);

  // Check permission: Admin can delete any event, Organizer only their own
  if (userRole !== "ADMIN" && event.organizerId !== userId) {
    console.log(`[DELETE EVENT] Permission denied`);
    throw new AppError("Not authorized to delete this event", 403);
  }

  console.log(`[DELETE EVENT] Permission granted. Starting deletion process...`);

  try {
    // First, fetch all registrations with ticket prices for refunds
    const registrationsToRefund = await prisma.registration.findMany({
      where: { eventId },
      include: { ticket: true, user: true },
    });

    // Use transaction for atomic deletion and refunds
    await prisma.$transaction(async (tx) => {
      // Step 1: Refund all paid registrations to user wallets
      console.log(`[DELETE EVENT] Step 1: Processing refunds...`);
      let refundCount = 0;
      for (const reg of registrationsToRefund) {
        const price = reg.ticket?.price || 0;
        if (price > 0) {
          const wallet = await tx.wallet.findUnique({
            where: { userId: reg.userId },
          });
          
          if (wallet) {
            await tx.wallet.update({
              where: { id: wallet.id },
              data: { balance: { increment: price } },
            });
            
            await tx.walletTransaction.create({
              data: {
                walletId: wallet.id,
                type: "CREDIT_REFUND",
                amount: price,
                reference: `event_deleted:${eventId}`,
              },
            });
            refundCount++;
          }
        }
      }
      console.log(`[DELETE EVENT] Refunded ${refundCount} registrations`);

      // Step 2: Delete all payments linked to registrations of this event
      console.log(`[DELETE EVENT] Step 2: Deleting payments...`);
      const paymentsDeleted = await tx.payment.deleteMany({
        where: {
          registration: {
            eventId: eventId,
          },
        },
      });
      console.log(`[DELETE EVENT] Deleted ${paymentsDeleted.count} payments`);

      // Step 3: Delete all registrations for the event
      console.log(`[DELETE EVENT] Step 3: Deleting registrations...`);
      const deletedRegs = await tx.registration.deleteMany({
        where: { eventId: eventId },
      });
      console.log(`[DELETE EVENT] Deleted ${deletedRegs.count} registrations`);

      // Step 4: Delete all tickets for the event
      console.log(`[DELETE EVENT] Step 4: Deleting tickets...`);
      const deletedTickets = await tx.ticket.deleteMany({
        where: { eventId: eventId },
      });
      console.log(`[DELETE EVENT] Deleted ${deletedTickets.count} tickets`);

      // Step 5: Delete the event
      console.log(`[DELETE EVENT] Step 5: Deleting event...`);
      await tx.event.delete({
        where: { id: eventId },
      });
      console.log(`[DELETE EVENT] Event deleted successfully`);
    });

    // Double-check the event is gone (defensive for rare constraint issues)
    const stillExists = await prisma.event.findUnique({ where: { id: eventId } });
    if (stillExists) {
      console.error(`[DELETE EVENT] Event still exists after deletion attempt`, {
        eventId,
      });
      throw new AppError("Failed to fully delete event. Please retry.", 500);
    }

    console.log(`[DELETE EVENT] Transaction completed successfully`);
    return { 
      success: true,
      message: "Event deleted successfully" 
    };
  } catch (error) {
    console.error(`[DELETE EVENT] Error during deletion:`, error);
    throw new AppError(`Failed to delete event: ${error.message}`, 500);
  }
};

export const publishEvent = async (eventId, userId, userRole) => {
  const event = await getEventById(eventId);
  
  // Check permission: Admin can publish any event, Organizer only their own
  if (userRole !== "ADMIN" && event.organizerId !== userId) {
    throw new AppError("You can only publish your own events", 403);
  }

  return await prisma.event.update({
    where: { id: eventId },
    data: { status: "published" },
    include: { organizer: true, category: true },
  });
};

export const getEventStats = async (eventId) => {
  const event = await getEventById(eventId);
  
  const stats = {
    totalRegistrations: event.registrations.length,
    checkedIn: event.registrations.filter(r => r.checkedIn).length,
    pending: event.registrations.filter(r => r.status === 'pending').length,
    confirmed: event.registrations.filter(r => r.status === 'confirmed').length,
    ticketsSold: event.tickets.reduce((sum, ticket) => sum + ticket.sold, 0),
    revenue: event.registrations.reduce((sum, reg) => {
      const ticket = event.tickets.find(t => t.id === reg.ticketId);
      return sum + (ticket?.price || 0);
    }, 0),
  };

  return stats;
};

// -------- Organizer proposals & admin approval flow --------

export const createEventProposal = async (eventData, organizerId) => {
  // Basic validation reused from createEvent
  const startTime = new Date(eventData.startTime);
  const endTime = new Date(eventData.endTime);

  if (endTime <= startTime) {
    throw new AppError("Event end time must be after start time", 400);
  }

  if (eventData.capacity < 1) {
    throw new AppError("Event capacity must be at least 1", 400);
  }

  const userTicket = Array.isArray(eventData.tickets) && eventData.tickets[0];
  const price =
    typeof userTicket?.price === "number" && userTicket.price >= 0
      ? userTicket.price
      : 0;

  return prisma.eventProposal.create({
    data: {
      title: eventData.title,
      description: eventData.description,
      imageUrl: eventData.imageUrl,
      startTime,
      endTime,
      capacity: eventData.capacity,
      ticketPrice: price,
      categoryId: eventData.categoryId,
      organizerId,
      status: "PENDING",
    },
    include: { organizer: true, category: true },
  });
};

export const getEventProposals = async () => {
  return prisma.eventProposal.findMany({
    include: {
      organizer: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const approveEventProposal = async (proposalId) => {
  return prisma.$transaction(async (tx) => {
    const proposal = await tx.eventProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new AppError("Proposal not found", 404);
    }

    if (proposal.status !== "PENDING") {
      throw new AppError("Proposal is not pending", 400);
    }

    // Create a real, published event using existing logic
    const event = await createEvent(
      {
        title: proposal.title,
        description: proposal.description,
        imageUrl: proposal.imageUrl ?? "",
        startTime: proposal.startTime.toISOString(),
        endTime: proposal.endTime.toISOString(),
        capacity: proposal.capacity,
        categoryId: proposal.categoryId,
        tickets: [{ price: proposal.ticketPrice }],
        status: "published",
      },
      proposal.organizerId
    );

    await tx.eventProposal.update({
      where: { id: proposalId },
      data: { status: "APPROVED" },
    });

    return event;
  });
};

export const rejectEventProposal = async (proposalId, reason) => {
  const proposal = await prisma.eventProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new AppError("Proposal not found", 404);
  }

  if (proposal.status !== "PENDING") {
    throw new AppError("Proposal is not pending", 400);
  }

  return prisma.eventProposal.update({
    where: { id: proposalId },
    data: {
      status: "REJECTED",
      rejectionReason: reason || null,
    },
  });
};
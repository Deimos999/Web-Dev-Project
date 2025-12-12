import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const createEvent = async (eventData, organizerId) => {
  return await prisma.event.create({
    data: {
      title: eventData.title,
      description: eventData.description,
      imageUrl: eventData.imageUrl,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      timezone: eventData.timezone || "UTC",
      meetingLink: eventData.meetingLink,
      capacity: eventData.capacity,
      organizerId,
      categoryId: eventData.categoryId,
      status: "draft",
    },
    include: { organizer: true, category: true },
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
    include: { organizer: true, category: true, registrations: true },
    orderBy: { createdAt: "desc" },
    skip: (filters.page || 0) * (filters.limit || 10),
    take: filters.limit || 10,
  });
};

export const getEventById = async (eventId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true, category: true, registrations: true, tickets: true },
  });
  if (!event) throw new AppError("Event not found", 404);
  return event;
};

export const updateEvent = async (eventId, eventData, userId) => {
  const event = await getEventById(eventId);
  if (event.organizerId !== userId) throw new AppError("You can only update your own events", 403);

  return await prisma.event.update({
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
    },
    include: { organizer: true, category: true },
  });
};

// CASCADE-SAFE DELETE
export const deleteEvent = async (eventId) => {
  // Fetch event with tickets and registrations
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { tickets: { include: { registrations: true } } },
  });

  if (!event) throw new AppError("Event not found", 404);

  // Delete all registrations of tickets
  for (const ticket of event.tickets) {
    await prisma.registration.deleteMany({ where: { ticketId: ticket.id } });
  }

  // Delete all tickets
  await prisma.ticket.deleteMany({ where: { eventId } });

  // Delete the event itself
  await prisma.event.delete({ where: { id: eventId } });

  return { message: "Event deleted successfully" };
};

export const publishEvent = async (eventId, userId) => {
  const event = await getEventById(eventId);
  if (event.organizerId !== userId) throw new AppError("Publish your own events", 403);

  return await prisma.event.update({
    where: { id: eventId },
    data: { status: "published" },
    include: { organizer: true, category: true },
  });
};

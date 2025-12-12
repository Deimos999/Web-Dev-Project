import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Delete events and tickets so we can reseed them
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();

  // Upsert categories (idempotent)
  const techCategory = await prisma.category.upsert({
    where: { slug: "technology" },
    update: {},
    create: { name: "Technology", slug: "technology", color: "#3B82F6" },
  });

  const marketingCategory = await prisma.category.upsert({
    where: { slug: "marketing" },
    update: {},
    create: { name: "Marketing", slug: "marketing", color: "#EC4899" },
  });

  const businessCategory = await prisma.category.upsert({
    where: { slug: "business" },
    update: {},
    create: { name: "Business", slug: "business", color: "#10B981" },
  });

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Upsert users (idempotent)
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: { email: "user@example.com", password: hashedPassword, name: "Test User", role: "user" },
  });

  const organizer1 = await prisma.user.upsert({
    where: { email: "organizer1@example.com" },
    update: {},
    create: { email: "organizer1@example.com", password: hashedPassword, name: "Sarah Johnson", role: "organizer" },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: "organizer2@example.com" },
    update: {},
    create: { email: "organizer2@example.com", password: hashedPassword, name: "Mike Chen", role: "organizer" },
  });

  // Admin user who can modify events
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", password: hashedPassword, name: "Admin User", role: "admin" },
  });

  // Define events
  const events = [
    {
      title: "Web Development Workshop",
      description: "Learn React and Node.js from industry experts",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      startTime: new Date("2024-12-20T10:00:00"),
      endTime: new Date("2024-12-20T16:00:00"),
      capacity: 100,
      organizerId: organizer1.id,
      categoryId: techCategory.id,
      status: "published",
      isFeatured: true,
    },
    {
      title: "Digital Marketing Summit 2024",
      description: "Master the latest digital marketing strategies and tools",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-aae9bf827c14?w=800",
      startTime: new Date("2024-12-22T09:00:00"),
      endTime: new Date("2024-12-22T17:00:00"),
      capacity: 150,
      organizerId: organizer2.id,
      categoryId: marketingCategory.id,
      status: "published",
      isFeatured: true,
    },
    {
      title: "JavaScript Advanced Techniques",
      description: "Deep dive into async/await, closures, and design patterns",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134ef2944f1?w=800",
      startTime: new Date("2024-12-25T14:00:00"),
      endTime: new Date("2024-12-25T18:00:00"),
      capacity: 50,
      organizerId: organizer1.id,
      categoryId: techCategory.id,
      status: "published",
      isFeatured: false,
    },
    {
      title: "Business Growth Strategies",
      description: "Learn proven strategies to scale your business to 7 figures",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      startTime: new Date("2024-12-27T10:00:00"),
      endTime: new Date("2024-12-27T15:00:00"),
      capacity: 80,
      organizerId: organizer2.id,
      categoryId: businessCategory.id,
      status: "published",
      isFeatured: false,
    },
    {
      title: "Social Media Marketing Bootcamp",
      description: "Everything you need to know about TikTok, Instagram, and LinkedIn marketing",
      imageUrl: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800",
      startTime: new Date("2024-12-28T11:00:00"),
      endTime: new Date("2024-12-28T16:00:00"),
      capacity: 120,
      organizerId: organizer1.id,
      categoryId: marketingCategory.id,
      status: "published",
      isFeatured: true,
    },
    {
      title: "Full Stack Development Masterclass",
      description: "Build production-ready applications with React, Node, and PostgreSQL",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
      startTime: new Date("2024-12-30T09:00:00"),
      endTime: new Date("2024-12-30T17:00:00"),
      capacity: 60,
      organizerId: organizer2.id,
      categoryId: techCategory.id,
      status: "published",
      isFeatured: true,
    },
    {
      title: "AI and Machine Learning Basics",
      description: "Introduction to AI/ML concepts, Python, and TensorFlow",
      imageUrl: "https://images.unsplash.com/photo-1677442d019cea3a528cd78aaf69d63a2c3a5ad0?w=800",
      startTime: new Date("2025-01-05T10:00:00"),
      endTime: new Date("2025-01-05T16:00:00"),
      capacity: 40,
      organizerId: organizer1.id,
      categoryId: techCategory.id,
      status: "published",
      isFeatured: false,
    },
    {
      title: "Startup Pitching Masterclass",
      description: "Learn how to pitch your startup to investors and get funded",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
      startTime: new Date("2025-01-08T14:00:00"),
      endTime: new Date("2025-01-08T18:00:00"),
      capacity: 100,
      organizerId: organizer2.id,
      categoryId: businessCategory.id,
      status: "published",
      isFeatured: true,
    },
  ];

  // Create events with tickets
  for (const eventData of events) {
    const event = await prisma.event.create({ data: eventData });

    // Create tickets: free, paid, VIP
    const ticketTypes = [
      { type: "free", name: "Free Ticket", price: 0, fraction: 0.3, description: "Free admission" },
      { type: "paid", name: "Premium Ticket", price: 49.99, fraction: 0.5, description: "Premium access with materials and networking" },
      { type: "vip", name: "VIP Ticket", price: 149.99, fraction: 0.2, description: "VIP access including 1-on-1 mentoring" },
    ];

    for (const t of ticketTypes) {
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          ticketType: t.type,
          name: t.name,
          description: t.description,
          price: t.price,
          quantity: Math.floor(event.capacity * t.fraction),
          sold: 0,
        },
      });
    }
  }

  console.log("✅ Seeding complete!");
  console.log("\n📋 Test Accounts:");
  console.log("   User: user@example.com / password123");
  console.log("   Organizer 1: organizer1@example.com / password123");
  console.log("   Organizer 2: organizer2@example.com / password123");
  console.log("   Admin: admin@example.com / password123");
  console.log("\n📅 Events created: " + events.length);
  console.log("🎫 Total tickets created: " + events.length * 3);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

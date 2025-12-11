import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create categories
  const techCategory = await prisma.category.create({
    data: { name: "Technology", slug: "technology", color: "#3B82F6" }
  });

  const marketingCategory = await prisma.category.create({
    data: { name: "Marketing", slug: "marketing", color: "#EC4899" }
  });

  const businessCategory = await prisma.category.create({
    data: { name: "Business", slug: "business", color: "#10B981" }
  });

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: hashedPassword,
      name: "Test User",
      role: "user"
    }
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: "organizer1@example.com",
      password: hashedPassword,
      name: "Sarah Johnson",
      role: "organizer"
    }
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: "organizer2@example.com",
      password: hashedPassword,
      name: "Mike Chen",
      role: "organizer"
    }
  });

  // Create multiple events
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
    const event = await prisma.event.create({
      data: eventData
    });

    // Create free and paid tickets for each event
    await prisma.ticket.create({
      data: {
        eventId: event.id,
        ticketType: "free",
        name: "Free Ticket",
        description: "Free admission",
        price: 0,
        quantity: Math.floor(event.capacity * 0.3),
        sold: 0
      }
    });

    await prisma.ticket.create({
      data: {
        eventId: event.id,
        ticketType: "paid",
        name: "Premium Ticket",
        description: "Premium access with materials and networking",
        price: 49.99,
        quantity: Math.floor(event.capacity * 0.5),
        sold: 0
      }
    });

    await prisma.ticket.create({
      data: {
        eventId: event.id,
        ticketType: "vip",
        name: "VIP Ticket",
        description: "VIP access including 1-on-1 mentoring",
        price: 149.99,
        quantity: Math.floor(event.capacity * 0.2),
        sold: 0
      }
    });
  }

  console.log("✅ Seeding complete!");
  console.log("\n📋 Test Accounts:");
  console.log("   User: user@example.com / password123");
  console.log("   Organizer 1: organizer1@example.com / password123");
  console.log("   Organizer 2: organizer2@example.com / password123");
  console.log("\n📅 Events created: " + events.length);
  console.log("🎫 Total tickets created: " + (events.length * 3));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addSampleEvent() {
  try {
    // Get the admin user
    const admin = await prisma.user.findUnique({
      where: { email: "admin@example.com" },
    });

    if (!admin) {
      console.error("✗ Admin user not found. Run 'node scripts/createAdmin.js' first.");
      await prisma.$disconnect();
      return;
    }

    // Get a category (or create one)
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Technology",
          slug: "technology",
          color: "#3B82F6",
        },
      });
      console.log("✓ Created category: Technology");
    }

    // Create event
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 7); // 7 days from now
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2); // 2 hour event

    const event = await prisma.event.create({
      data: {
        title: "Web Development Workshop 2025",
        description: "Learn modern web development with React, Node.js, and PostgreSQL. Perfect for beginners and intermediate developers.",
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
        startTime,
        endTime,
        timezone: "UTC",
        meetingLink: "https://zoom.us/j/123456789",
        capacity: 100,
        organizerId: admin.id,
        categoryId: category.id,
        status: "draft",
      },
      include: { organizer: true, category: true },
    });

    // Create tickets for the event
    const tickets = await Promise.all([
      prisma.ticket.create({
        data: {
          eventId: event.id,
          name: "Standard Ticket",
          ticketType: "standard",
          description: "Standard access to the workshop",
          price: 29.99,
          quantity: 80,
        },
      }),
      prisma.ticket.create({
        data: {
          eventId: event.id,
          name: "VIP Ticket",
          ticketType: "vip",
          description: "VIP access with exclusive materials and 1-on-1 mentoring",
          price: 79.99,
          quantity: 20,
        },
      }),
    ]);

    console.log(`✓ Event created successfully!`);
    console.log(`  Title: ${event.title}`);
    console.log(`  Organizer: ${event.organizer.name}`);
    console.log(`  Date: ${startTime.toLocaleString()}`);
    console.log(`  Capacity: ${event.capacity}`);
    console.log(`  Status: ${event.status} (draft - not published yet)`);
    console.log(`\n✓ Tickets created:`);
    tickets.forEach((t) => {
      console.log(`  - ${t.name}: $${t.price} (${t.quantity} available)`);
    });
  } catch (error) {
    console.error("✗ Error creating event:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleEvent();

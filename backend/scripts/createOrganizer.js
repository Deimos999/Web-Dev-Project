import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/passwordUtils.js";

const prisma = new PrismaClient();

async function createOrganizer() {
  try {
    const email = "organizer@example.com";
    const password = "password123";
    const name = "Event Organizer";

    // Check if organizer already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("✓ Organizer already exists:", email);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create organizer user
    const organizer = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "user", // Organizers are just regular users who create events
      },
    });

    console.log("✓ Organizer created successfully!");
    console.log("  Email:", organizer.email);
    console.log("  Password:", password);
    console.log("  Name:", organizer.name);
    console.log("\nYou can now log in and create events!");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error creating organizer:", error.message);
    process.exit(1);
  }
}

createOrganizer();

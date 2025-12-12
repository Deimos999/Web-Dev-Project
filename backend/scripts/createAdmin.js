import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/passwordUtils.js";

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = "admin@example.com";
  const password = "password123";
  const name = "Admin User";

  try {
    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`✓ Admin user ${email} already exists with role: ${existing.role}`);
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
      },
    });

    console.log(`✓ Admin user created successfully!`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`\n✓ You can now login with:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
  } catch (error) {
    console.error("✗ Error creating admin user:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

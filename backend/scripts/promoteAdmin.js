import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function promote(email) {
  if (!email) {
    console.error("Usage: node scripts/promoteAdmin.js <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`User ${email} promoted to ADMIN`);
  await prisma.$disconnect();
}

promote(process.argv[2]).catch((err) => {
  console.error(err);
  process.exit(1);
});

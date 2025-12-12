// Save this as: backend/test-delete.js
// Run with: node test-delete.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDelete() {
  console.log("\n=== Testing Event Deletion ===\n");

  try {
    // Step 1: Get all events
    console.log("Step 1: Fetching all events...");
    const allEvents = await prisma.event.findMany({
      include: {
        tickets: {
          include: {
            registrations: true
          }
        },
        registrations: true
      }
    });
    
    console.log(`Found ${allEvents.length} events`);
    
    if (allEvents.length === 0) {
      console.log("No events found. Run 'npm run seed' first.");
      return;
    }

    // Display events
    allEvents.forEach((event, idx) => {
      console.log(`\n${idx + 1}. ${event.title}`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Organizer: ${event.organizerId}`);
      console.log(`   Tickets: ${event.tickets.length}`);
      console.log(`   Total Registrations: ${event.registrations.length}`);
      event.tickets.forEach(ticket => {
        console.log(`   - ${ticket.name}: ${ticket.registrations.length} registrations`);
      });
    });

    // Step 2: Pick the first event to delete
    const eventToDelete = allEvents[0];
    console.log(`\n\nStep 2: Testing deletion of: ${eventToDelete.title}`);
    console.log(`Event ID: ${eventToDelete.id}`);

    // Step 3: Delete with transaction
    console.log("\nStep 3: Starting deletion transaction...");
    
    await prisma.$transaction(async (tx) => {
      // Delete payments
      console.log("  - Deleting payments...");
      for (const ticket of eventToDelete.tickets) {
        for (const registration of ticket.registrations) {
          if (registration.paymentId) {
            await tx.payment.delete({
              where: { id: registration.paymentId }
            });
            console.log(`    ✓ Deleted payment: ${registration.paymentId}`);
          }
        }
      }

      // Delete registrations
      console.log("  - Deleting registrations...");
      const deletedRegs = await tx.registration.deleteMany({
        where: { eventId: eventToDelete.id }
      });
      console.log(`    ✓ Deleted ${deletedRegs.count} registrations`);

      // Delete tickets
      console.log("  - Deleting tickets...");
      const deletedTickets = await tx.ticket.deleteMany({
        where: { eventId: eventToDelete.id }
      });
      console.log(`    ✓ Deleted ${deletedTickets.count} tickets`);

      // Delete event
      console.log("  - Deleting event...");
      await tx.event.delete({
        where: { id: eventToDelete.id }
      });
      console.log(`    ✓ Event deleted`);
    });

    console.log("\n✅ Deletion completed successfully!");

    // Step 4: Verify deletion
    console.log("\nStep 4: Verifying deletion...");
    const remainingEvents = await prisma.event.findMany();
    console.log(`Remaining events: ${remainingEvents.length}`);
    
    const deletedEvent = await prisma.event.findUnique({
      where: { id: eventToDelete.id }
    });
    
    if (deletedEvent === null) {
      console.log("✅ Event successfully deleted from database");
    } else {
      console.log("❌ Event still exists in database!");
    }

  } catch (error) {
    console.error("\n❌ Error during test:", error);
    console.error("\nFull error:", error.message);
    console.error("\nStack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
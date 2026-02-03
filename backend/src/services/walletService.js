import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();

export const getOrCreateWalletWithTransactions = async (userId) => {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: { userId },
    });

    // Re-fetch with include to keep return shape consistent
    wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  return wallet;
};

export const topUpWallet = async (userId, amount) => {
  if (amount <= 0) {
    throw new AppError("Amount must be greater than zero", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    let wallet = await tx.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId },
      });
    }

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          increment: amount,
        },
      },
    });

    const transaction = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "CREDIT_TOP_UP",
        amount,
      },
    });

    return { wallet: updatedWallet, transaction };
  });

  // Attach latest transactions for convenience
  const walletWithTransactions = await prisma.wallet.findUnique({
    where: { id: result.wallet.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return walletWithTransactions;
};

export const payForRegistrationWithWallet = async (userId, registrationId) => {
  const result = await prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { ticket: true, event: true, user: true },
    });

    if (!registration) {
      throw new AppError("Registration not found", 404);
    }

    if (registration.userId !== userId) {
      throw new AppError("You can only pay for your own registrations", 403);
    }

    if (registration.status === "confirmed") {
      throw new AppError("Registration is already confirmed", 400);
    }

    if (!registration.ticket || registration.ticket.price <= 0) {
      throw new AppError("This registration does not require payment", 400);
    }

    let wallet = await tx.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      throw new AppError("Wallet not found. Please top up first.", 400);
    }

    if (wallet.balance < registration.ticket.price) {
      throw new AppError("Insufficient wallet balance", 400);
    }

    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: {
          decrement: registration.ticket.price,
        },
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEBIT_REGISTRATION",
        amount: registration.ticket.price,
        reference: `registration:${registration.id}`,
      },
    });

    const updatedRegistration = await tx.registration.update({
      where: { id: registration.id },
      data: {
        status: "confirmed",
      },
      include: { ticket: true, event: true, user: true },
    });

    return { wallet: updatedWallet, registration: updatedRegistration };
  });

  // Attach latest transactions for convenience
  const walletWithTransactions = await prisma.wallet.findUnique({
    where: { id: result.wallet.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  return {
    wallet: walletWithTransactions,
    registration: result.registration,
  };
};



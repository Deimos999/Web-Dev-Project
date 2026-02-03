import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { AppError } from "../middleware/errorHandler.js";
import {
  validateRequest,
  validateWalletTopUp,
  validateWalletPay,
} from "../middleware/validationMiddleware.js";
import {
  getOrCreateWalletWithTransactions,
  topUpWallet,
  payForRegistrationWithWallet,
} from "../services/walletService.js";

const router = express.Router();

// GET /api/wallet/me - Get current user's wallet and recent transactions
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const wallet = await getOrCreateWalletWithTransactions(req.user.userId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
});

// POST /api/wallet/top-up - Add funds to wallet (demo: no external payment processor)
router.post(
  "/top-up",
  authenticate,
  validateWalletTopUp,
  validateRequest,
  async (req, res, next) => {
    try {
      // Only organizers and admins can top up directly
      if (!["ORGANIZER", "ADMIN"].includes(req.user.role)) {
        throw new AppError(
          "Only organizers and administrators can top up wallet balances",
          403
        );
      }

      const { amount } = req.body;
      const wallet = await topUpWallet(req.user.userId, parseFloat(amount));
      res.status(201).json(wallet);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/wallet/pay - Pay for a registration using wallet balance
router.post(
  "/pay",
  authenticate,
  validateWalletPay,
  validateRequest,
  async (req, res, next) => {
    try {
      const { registrationId } = req.body;
      const result = await payForRegistrationWithWallet(
        req.user.userId,
        registrationId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;



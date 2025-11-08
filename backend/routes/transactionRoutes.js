import express from "express";
import {
  createTransaction,
  getGroupTransactions,
  deleteTransaction,
} from "../controllers/transactionControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/transactions", createTransaction);
router.get("/:id/transactions", authenticateToken, getGroupTransactions);
router.delete("/:groupId/transactions/:transactionId", authenticateToken, deleteTransaction);

export default router;

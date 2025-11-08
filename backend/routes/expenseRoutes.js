import express from "express";
import { getExpenses, createExpense } from "../controllers/expenseControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/expense", authenticateToken, getExpenses);
router.post("/expense", authenticateToken, createExpense);

export default router;

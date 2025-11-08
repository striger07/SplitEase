import express from "express";
import { checkUserExists } from "../controllers/userControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/user-exists", authenticateToken, checkUserExists);

export default router;

import express from "express";
import {
  createGroup,
  getGroups,
  addMemberToGroup,
  getGroupMembers,
} from "../controllers/groupControllers.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("", authenticateToken, createGroup);
router.get("", authenticateToken, getGroups);
router.post("/:id/members", authenticateToken, addMemberToGroup);
router.get("/:id/members", getGroupMembers);

export default router;
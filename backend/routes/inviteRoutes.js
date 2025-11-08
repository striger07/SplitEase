import express from "express";
import { sendInvite } from "../controllers/inviteControllers.js";

const router = express.Router();

router.post("/api/send-invite", sendInvite);

export default router;

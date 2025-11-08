import express from "express";
import {
	postResults,
	getResultsTransactions,
} from "../controllers/resultsController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST route for creating results
router.get("/groups/:groupId/results", authenticateToken, postResults);

// GET route for fetching results - match the endpoint used in the React component
router.get(
	"/api/groups/:groupId/results",
	authenticateToken,
	getResultsTransactions
);

export default router;

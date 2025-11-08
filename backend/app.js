import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import userModel from "./models/userModel.js";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/authMiddleware.js";
import Expense from "./models/expenseModel.js";
import transactionModel from "./models/transactionModel.js";
import groupModel from "./models/groupModel.js";
import { calculateNetBalances } from "./helpers/calculateNetBalances.js";
import { createFlowGraphMatrix } from "./helpers/createFlowGraphMatrix.js";
import { maxFlowAlgo } from "./helpers/maxFlowAlgo.js";
import transporter from "./utils/mailer.js";

import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js"; // New route for results
import inviteRoutes from "./routes/inviteRoutes.js";
import dotenv from "dotenv"; // Import dotenv

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api", expenseRoutes);
app.use("/api", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups", transactionRoutes);
app.use("/api", resultsRoutes); // Mount results routes
app.use("/api", inviteRoutes);

mongoose
	.connect(process.env.MONGO_URI) // Use MONGO_URI from .env
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

//import Group from "./models/SplitGroup.js"; // adjust path if needed

app.post(
	"/api/groups/:groupId/results",
	authenticateToken,
	async (req, res) => {
		const { groupId } = req.params;
		const { names: users, transactions } = req.body;

		if (!Array.isArray(users) || users.length === 0) {
			return res.status(400).send("Invalid users array.");
		}

		if (!Array.isArray(transactions) || transactions.length === 0) {
			return res.status(400).send("Invalid transactions array.");
		}

		const groupTransactions = transactions.filter(
			(txn) => txn.group === groupId
		);

		if (groupTransactions.length === 0) {
			return res
				.status(404)
				.send("No transactions found for this group.");
		}

		const names = [...users];
		names.unshift("source");
		names.push("destination");

		const nameToIndex = new Map();
		names.forEach((name, index) => {
			nameToIndex.set(name, index);
		});

		const simplifiedTransactions = groupTransactions.map((txn) => ({
			payer: txn.from.username,
			payee: txn.to.username,
			amount: txn.amount,
		}));

		const { creditors, debtors } = calculateNetBalances(
			names,
			simplifiedTransactions,
			nameToIndex
		);

		const flowGraph = createFlowGraphMatrix(
			names,
			creditors,
			debtors,
			nameToIndex
		);

		const paths = [];
		const amtPending = [];

		const maxFlow = maxFlowAlgo(
			flowGraph,
			0,
			flowGraph.length - 1,
			paths,
			amtPending
		);

		try {
			const group = await groupModel
				.findById(groupId)
				.populate("members", "username");
			if (!group) return res.status(404).send("Group not found.");

			// Create a map of username -> ObjectId
			const usernameToId = new Map();
			group.members.forEach((member) => {
				usernameToId.set(member.username, member._id);
			});

			// Create transactions with user ObjectIds
			const resultPaths = paths.map((path, index) => {
				const fromUsername = names[path[1]]; // 🔁 TO pays FROM
				const toUsername = names[path[2]];

				const fromId = usernameToId.get(fromUsername);
				const toId = usernameToId.get(toUsername);

				if (!fromId || !toId) {
					throw new Error(
						`Missing user ID for ${fromUsername} or ${toUsername}`
					);
				}

				return {
					from: fromId,
					to: toId,
					amount: amtPending[index],
				};
			});

			group.resultantTransactions = resultPaths;
			await group.save();

			res.json({
				maxFlow,
				transactions: resultPaths,
			});
		} catch (err) {
			console.error(err);
			res.status(500).send("Server error while saving group result.");
		}
	}
);

app.get(
	"/api/groups/:groupId/res_transactions",
	authenticateToken,
	async (req, res) => {
		try {
			const group = await groupModel
				.findById(req.params.groupId)
				.populate({
					path: "resultantTransactions.from",
					select: "username",
				})
				.populate({
					path: "resultantTransactions.to",
					select: "username",
				});

			console.log("GROUP:", req.params.groupId, group);

			if (!group) return res.status(404).send("Group not found");

			// 🧠 Format the output using populated usernames
			const populatedResults = group.resultantTransactions.map((txn) => ({
				from: txn.from?.username || "Unknown",
				to: txn.to?.username || "Unknown",
				amount: txn.amount,
			}));

			res.json({
				groupId: group._id,
				transactions: populatedResults,
			});
		} catch (err) {
			console.error(err);
			res.status(500).send("Server error");
		}
	}
);

app.post("/api/send-invite", async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ error: "Email is required" });
	}

	try {
		const mailOptions = {
			from: "harshalrelan99@gmail.com",
			to: email,
			subject: "You're invited to SplitEase!",
			text: `Hey there! 👋\n\nYou’ve been invited to join a group on SplitEase.\n\nhttps://splitease2-1.onrender.com/register\n\n- Team SplitEase`,
		};

		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "Invite email sent successfully" });
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({ error: "Failed to send email" });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

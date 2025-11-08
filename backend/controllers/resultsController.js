import groupModel from "../models/groupModel.js";
import transactionModel from "../models/transactionModel.js";
import { calculateNetBalances } from "../helpers/calculateNetBalances.js";
import { createFlowGraphMatrix } from "../helpers/createFlowGraphMatrix.js";
import { maxFlowAlgo } from "../helpers/maxFlowAlgo.js";

export const postResults = async (req, res) => {
	try {
		console.log("Calculating results for group:", req.params.groupId);
		const { groupId } = req.params;
		const userId = req.user.id; // Get user ID from the token

		// Find the group and check if user is a member
		const group = await groupModel
			.findById(groupId)
			.populate("members", "username _id");

		if (!group) {
			return res.status(404).send("Group not found");
		}

		// Get all transactions for the group
		const transactions = await transactionModel
			.find({ group: groupId })
			.populate("from", "username")
			.populate("to", "username");

		// If there are no transactions, return an appropriate response
		if (transactions.length === 0) {
			return res.json({
				balances: group.members.map((member) => ({
					userId: member._id,
					username: member.username,
					balance: 0,
				})),
				paymentPlan: [],
				message: "No transactions found for this group",
			});
		}

		// Extract usernames for the algorithm
		const users = group.members.map((member) => member.username);

		// Prepare names array for the algorithm
		const names = [...users];
		names.unshift("source");
		names.push("destination");

		const nameToIndex = new Map();
		names.forEach((name, index) => {
			nameToIndex.set(name, index);
		});

		// Simplify transactions for the algorithm
		const simplifiedTransactions = transactions.map((txn) => ({
			payer: txn.from.username,
			payee: txn.to.username,
			amount: txn.amount,
		}));

		// Calculate net balances
		const { creditors, debtors } = calculateNetBalances(
			names,
			simplifiedTransactions,
			nameToIndex
		);

		// Create flow graph
		const flowGraph = createFlowGraphMatrix(
			names,
			creditors,
			debtors,
			nameToIndex
		);

		const paths = [];
		const amtPending = [];

		// Run max flow algorithm
		const maxFlow = maxFlowAlgo(
			flowGraph,
			0,
			flowGraph.length - 1,
			paths,
			amtPending
		);

		// Map usernames to IDs
		const usernameToId = new Map();
		group.members.forEach((member) => {
			usernameToId.set(member.username, member._id);
		});

		// Create resultant transactions
		const resultPaths = paths.map((path, index) => {
			const fromUsername = names[path[1]];
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

		// Save results to group
		group.resultantTransactions = resultPaths;
		await group.save();

		// Calculate balances for each member
		const balances = group.members.map((member) => {
			let balance = 0;

			transactions.forEach((txn) => {
				if (txn.from._id.toString() === member._id.toString()) {
					balance += txn.amount; // They paid, so they are owed
				}
				if (txn.to._id.toString() === member._id.toString()) {
					balance -= txn.amount; // They benefited, so they owe
				}
			});

			return {
				userId: member._id,
				username: member.username,
				balance: balance,
			};
		});

		// Format payment plan for the response
		const paymentPlan = resultPaths.map((path) => ({
			fromId: path.from,
			fromName:
				group.members.find(
					(m) => m._id.toString() === path.from.toString()
				)?.username || "Unknown",
			toId: path.to,
			toName:
				group.members.find(
					(m) => m._id.toString() === path.to.toString()
				)?.username || "Unknown",
			amount: path.amount,
		}));

		// Send the response in the format expected by the frontend
		res.json({
			balances,
			paymentPlan,
		});
	} catch (err) {
		console.error("Error calculating results:", err);
		res.status(500).send("Server error while calculating results");
	}
};

export const getResultsTransactions = async (req, res) => {
	try {
		const { groupId } = req.params;

		const group = await groupModel
			.findById(groupId)
			.populate({
				path: "resultantTransactions.from",
				select: "username _id",
			})
			.populate({
				path: "resultantTransactions.to",
				select: "username _id",
			})
			.populate("members", "username _id");

		if (!group) {
			return res.status(404).send("Group not found");
		}

		// Get all transactions for balance calculation
		const transactions = await transactionModel
			.find({ group: groupId })
			.populate("from", "username")
			.populate("to", "username");

		// If there are no transactions, return appropriate response
		if (transactions.length === 0) {
			return res.json({
				groupId: group._id,
				balances: group.members.map((member) => ({
					userId: member._id,
					username: member.username,
					balance: 0,
				})),
				paymentPlan: [],
				noTransactions: true,
			});
		}

		// Calculate balances for each member
		const balances = group.members.map((member) => {
			let balance = 0;

			transactions.forEach((txn) => {
				if (txn.from._id.toString() === member._id.toString()) {
					balance += txn.amount; // They paid, so they are owed
				}
				if (txn.to._id.toString() === member._id.toString()) {
					balance -= txn.amount; // They benefited, so they owe
				}
			});

			return {
				userId: member._id,
				username: member.username,
				balance: balance,
			};
		});

		// Format payment plan
		const paymentPlan = group.resultantTransactions.map((txn) => ({
			fromId: txn.from._id,
			fromName: txn.from.username || "Unknown",
			toId: txn.to._id,
			toName: txn.to.username || "Unknown",
			amount: txn.amount,
		}));

		// Send response in the format expected by the frontend
		res.json({
			groupId: group._id,
			balances,
			paymentPlan,
		});
	} catch (err) {
		console.error("Error fetching results:", err);
		res.status(500).send("Server error");
	}
};

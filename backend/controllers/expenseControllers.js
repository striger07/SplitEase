import Expense from "../models/expenseModel.js";
import Transaction from "../models/transactionModel.js";

export const getExpenses = async (req, res) => {
	try {
		const userId = req.user.id;

		// Get manually entered expenses
		const expenses = await Expense.find({ user: userId }).sort({
			createdAt: -1,
		});

		// Get transactions where the current user is the sender
		const transactions = await Transaction.find({ from: userId })
			.sort({ createdAt: -1 })
			.populate("from", "username") // Replace 'from' with user document including only 'username'
			.populate("to", "username"); // Same for 'to'

		// Get transactions where the current user is the receiver
		const receivedTransactions = await Transaction.find({ to: userId })
			.sort({ createdAt: -1 })
			.populate("from", "username") // Replace 'from' with user document including only 'username'
			.populate("to", "username"); // Same for 'to'

		res.status(200).json({
			expenses,
			transactions,
			receivedTransactions,
		});
	} catch (err) {
		console.error("Error fetching data:", err);
		res.status(500).json({
			error: "Failed to fetch expenses and transactions.",
		});
	}
};

export const createExpense = async (req, res) => {
	const { amount, category, message } = req.body;
	console.log(req.user);

	if (!amount || !category) {
		return res
			.status(400)
			.json({ error: "Amount and category are required." });
	}

	if (amount <= 0 || amount > 1e9) {
		return res
			.status(400)
			.json({ error: "Amount must be between 1 and 1e9." });
	}

	try {
		const expense = new Expense({
			amount,
			category,
			message,
			user: req.user.id,
		});

		await expense.save();

		res.status(201).json({
			message: "Expense saved successfully",
			expense,
		});
	} catch (err) {
		console.error("Expense saving error:", err);
		res.status(500).json({ error: "Failed to save expense." });
	}
};

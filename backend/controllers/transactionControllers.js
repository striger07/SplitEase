import transactionModel from "../models/transactionModel.js";

export const createTransaction = async (req, res) => {
  const { id: groupId } = req.params;
  const { from, to, amount } = req.body;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const transaction = new transactionModel({
      from,
      to,
      amount: parseFloat(amount),
      group: groupId,
    });

    await transaction.save();

    const savedTx = await transactionModel.findById(transaction._id)
      .populate("from", "username")
      .populate("to", "username");

    res.status(201).json(savedTx);
  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getGroupTransactions = async (req, res) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ error: "Invalid group ID format." });
  }
  try {
    const transactions = await transactionModel.find({ group: id })
      .populate("from", "username")
      .populate("to", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error("Failed to fetch transactions:", err.message || err);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
};





export const deleteTransaction = async (req, res) => {
  const { groupId, transactionId } = req.params;
  try {
    const transaction = await transactionModel.findOneAndDelete({
      _id: transactionId,
      group: groupId,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json({ message: "Transaction deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


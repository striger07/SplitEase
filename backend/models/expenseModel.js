// models/Expense.js

import mongoose from "mongoose";

function getISTDate() {
  const now = new Date();
  const istOffset = 330 * 60000;
  return new Date(now.getTime() + istOffset);
}

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be non-negative"],
    max: [1e9, "Amount must be less than or equal to 1e9"],
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Housing",
      "Transportation",
      "Food",
      "Health",
      "Entertainment",
      "Personal",
      "Debt & Finances",
      "Shopping",
      "Miscellaneous",
    ],
  },
  message: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: getISTDate,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // this must match the model name used in userModel.js
    required: true,
  },
});

const expenseModel =mongoose.model("Expense", expenseSchema);
export default expenseModel;

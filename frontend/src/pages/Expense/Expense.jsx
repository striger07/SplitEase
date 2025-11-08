import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
	DollarSign,
	Calendar,
	FileText,
	Tag,
	Plus,
	ArrowLeft,
	Wallet,
	ChevronDown,
	Settings,
	PieChart,
	Clock,
	Layers,
	User,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Expense = () => {
	const [formData, setFormData] = useState({
		amount: "",
		category: "",
		message: "",
	});
	const [errors, setErrors] = useState({});
	const [expenses, setExpenses] = useState([]);
	const [transactions, setTransactions] = useState([]);
	const [user, setUser] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("expenses"); // 'expenses' or 'transactions'
	const [isCheckingToken, setIsCheckingToken] = useState(true);
	const [reciever, setreciever] = useState(null);

	const navigate = useNavigate();

	const categories = [
		"Housing",
		"Transportation",
		"Food",
		"Health",
		"Entertainment",
		"Personal",
		"Debt & Finances",
		"Shopping",
		"Miscellaneous",
	];

	// Category icons mapping
	const categoryIcons = {
		Housing: <Layers size={16} />,
		Transportation: <ArrowLeft size={16} />,
		Food: <DollarSign size={16} />,
		Health: <User size={16} />,
		Entertainment: <PieChart size={16} />,
		Personal: <User size={16} />,
		"Debt & Finances": <Wallet size={16} />,
		Shopping: <Tag size={16} />,
		Miscellaneous: <Settings size={16} />,
	};

	// Category colors mapping
	const categoryColors = {
		Housing: "bg-blue-100 text-blue-600",
		Transportation: "bg-purple-100 text-purple-600",
		Food: "bg-orange-100 text-orange-600",
		Health: "bg-red-100 text-red-600",
		Entertainment: "bg-indigo-100 text-indigo-600",
		Personal: "bg-pink-100 text-pink-600",
		"Debt & Finances": "bg-emerald-100 text-emerald-600",
		Shopping: "bg-amber-100 text-amber-600",
		Miscellaneous: "bg-gray-100 text-gray-600",
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUser({ username: decoded.username, email: decoded.email });
			} catch (err) {
				console.error("Invalid token");
				toast.error("Session expired. Please log in again.");
				localStorage.removeItem("token");
				navigate("/login");
			}
		} else {
			navigate("/login");
		}
		fetchExpenseData();
		setIsCheckingToken(false);
	}, [navigate]);

	const fetchExpenseData = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const res = await axios.get(
				"https://splitease2.onrender.com/api/expense",
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			console.log(res.data.receivedTransactions);

			setExpenses(res.data.expenses || []);
			setTransactions(res.data.transactions || []);
			setreciever(res.data.receivedTransactions || []);
		} catch (err) {
			console.error("Fetch error:", err.message);
			if (err.response && err.response.status === 401) {
				toast.error("Session expired. Please log in again.");
				localStorage.removeItem("token");
				navigate("/login");
			} else {
				toast.error("Failed to fetch expenses. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const validate = () => {
		const newErrors = {};
		if (!formData.amount) {
			newErrors.amount = "Amount is required";
		} else if (isNaN(formData.amount)) {
			newErrors.amount = "Amount must be a number";
		} else if (+formData.amount <= 0) {
			newErrors.amount = "Amount must be greater than zero";
		} else if (+formData.amount > 1e9) {
			newErrors.amount = "Amount must be less than 1,000,000,000";
		}

		if (!formData.category) {
			newErrors.category = "Category is required";
		}

		return newErrors;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const validationErrors = validate();
		if (Object.keys(validationErrors).length > 0) {
			setErrors(validationErrors);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				"https://splitease2.onrender.com/api/expense",
				formData,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast.success("Expense added successfully!");
			setFormData({ amount: "", category: "", message: "" });
			setErrors({});
			setShowForm(false);
			fetchExpenseData();
		} catch (error) {
			console.error("Submit error:", error);
			if (error.response && error.response.status === 401) {
				toast.error("Session expired. Please log in again.");
				localStorage.removeItem("token");
				navigate("/login");
			} else {
				toast.error(
					error.response?.data?.error || "Failed to add expense"
				);
			}
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/");
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		date.setTime(date.getTime() - (5 * 60 * 60 * 1000 + 30 * 60 * 1000));
		return (
			date.toLocaleDateString(undefined, {
				year: "numeric",
				month: "short",
				day: "numeric",
			}) +
			" · " +
			date.toLocaleTimeString(undefined, {
				hour: "2-digit",
				minute: "2-digit",
			})
		);
	};

	const toggleForm = () => {
		setShowForm(!showForm);
	};

	if (isCheckingToken) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-emerald-50">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
					<p className="mt-4 text-lg text-gray-700">
						Loading SplitEase...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
			<ToastContainer />
			<div className="max-w-6xl mx-auto px-4 py-6">
				<header className="flex justify-between items-center mb-8">
					<div className="flex items-center">
						<a href="/" className="flex items-center">
							<div className="bg-emerald-600 text-white p-2 rounded-lg">
								<Wallet size={24} />
							</div>
							<h1 className="text-2xl ml-2 font-bold text-emerald-600">
								SplitEase
							</h1>
						</a>
					</div>

					<div className="flex items-center gap-4">
						<div className="hidden md:block">
							<p className="text-sm text-gray-500">
								Logged in as
							</p>
							<p className="font-medium">{user?.email}</p>
						</div>
						<div className="bg-emerald-100 text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center font-bold">
							{user?.username?.charAt(0).toUpperCase()}
						</div>
						<button
							onClick={handleLogout}
							className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-600 transition-colors"
						>
							Logout
						</button>
					</div>
				</header>

				<div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-100">
					<div className="bg-emerald-600 text-white p-6">
						<div className="flex justify-between items-center">
							<div>
								<h2 className="text-2xl font-bold">
									Expense Tracker
								</h2>
								<p className="text-emerald-100">
									Manage your expenses and transactions
								</p>
							</div>
							<button
								onClick={toggleForm}
								className="bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2"
							>
								<Plus size={18} />
								{showForm ? "Close Form" : "Add Expense"}
							</button>
						</div>
					</div>

					{showForm && (
						<div className="p-6 border-b border-gray-200 bg-emerald-50">
							<h3 className="text-lg font-medium mb-4">
								Add New Expense
							</h3>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Amount
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<DollarSign
													size={16}
													className="text-gray-400"
												/>
											</div>
											<input
												type="number"
												name="amount"
												value={formData.amount}
												onChange={handleChange}
												placeholder="Enter amount"
												className={`pl-10 w-full p-2 border ${
													errors.amount
														? "border-red-300"
														: "border-gray-300"
												} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
											/>
										</div>
										{errors.amount && (
											<p className="mt-1 text-sm text-red-600">
												{errors.amount}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Category
										</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<Tag
													size={16}
													className="text-gray-400"
												/>
											</div>
											<select
												name="category"
												value={formData.category}
												onChange={handleChange}
												className={`pl-10 w-full p-2 border ${
													errors.category
														? "border-red-300"
														: "border-gray-300"
												} rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white`}
											>
												<option value="">
													Select a category
												</option>
												{categories.map((cat) => (
													<option
														key={cat}
														value={cat}
													>
														{cat}
													</option>
												))}
											</select>
											<div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
												<ChevronDown
													size={16}
													className="text-gray-400"
												/>
											</div>
										</div>
										{errors.category && (
											<p className="mt-1 text-sm text-red-600">
												{errors.category}
											</p>
										)}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Note (Optional)
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<FileText
												size={16}
												className="text-gray-400"
											/>
										</div>
										<textarea
											name="message"
											value={formData.message}
											onChange={handleChange}
											placeholder="Add details about this expense"
											rows="3"
											className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
										/>
									</div>
								</div>

								<div className="flex justify-end">
									<button
										type="button"
										onClick={toggleForm}
										className="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
									>
										Save Expense
									</button>
								</div>
							</form>
						</div>
					)}

					<div className="p-6">
						<div className="flex border-b border-gray-200 mb-4">
							<button
								className={`pb-2 px-4 ${
									activeTab === "expenses"
										? "border-b-2 border-emerald-500 text-emerald-600 font-medium"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("expenses")}
							>
								My Expenses
							</button>
							<button
								className={`pb-2 px-4 ${
									activeTab === "transactions"
										? "border-b-2 border-emerald-500 text-emerald-600 font-medium"
										: "text-gray-500 hover:text-gray-700"
								}`}
								onClick={() => setActiveTab("transactions")}
							>
								Transactions
							</button>
						</div>

						{loading ? (
							<div className="text-center py-12">
								<div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
								<p className="mt-4 text-gray-500">
									Loading your data...
								</p>
							</div>
						) : activeTab === "expenses" ? (
							<>
								{expenses.length > 0 ? (
									<div className="space-y-4">
										{expenses.map((expense) => (
											<div
												key={expense._id}
												className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
											>
												<div className="flex justify-between items-start">
													<div className="flex items-start">
														<div
															className={`p-2 rounded-lg mr-4 ${
																categoryColors[
																	expense
																		.category
																] ||
																"bg-gray-100"
															}`}
														>
															{categoryIcons[
																expense.category
															] || (
																<Tag
																	size={16}
																/>
															)}
														</div>
														<div>
															<h4 className="font-medium">
																{
																	expense.category
																}
															</h4>
															{expense.message && (
																<p className="text-gray-600 text-sm mt-1">
																	{
																		expense.message
																	}
																</p>
															)}
															<div className="flex items-center mt-2 text-xs text-gray-500">
																<Clock
																	size={12}
																	className="mr-1"
																/>
																{formatDate(
																	expense.createdAt
																)}
															</div>
														</div>
													</div>
													<div className="font-bold text-lg">
														₹
														{parseFloat(
															expense.amount
														).toFixed(2)}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<DollarSign
											size={48}
											className="mx-auto text-emerald-200 mb-4"
										/>
										<h3 className="text-lg font-medium text-gray-700">
											No expenses found
										</h3>
										<p className="text-gray-500 mb-6">
											Add your first expense to start
											tracking
										</p>
										<button
											onClick={toggleForm}
											className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
										>
											Add Expense
										</button>
									</div>
								)}
							</>
						) : (
							<>
								{transactions.length > 0 ||
								reciever.length > 0 ? (
									<div className="space-y-4">
										{/* Render sent transactions */}
										{transactions.map((transaction) => (
											<div
												key={transaction._id}
												className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
											>
												<div className="flex justify-between items-start">
													<div className="flex items-start">
														<div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-4">
															<ArrowLeft
																size={16}
															/>
														</div>
														<div>
															<h4 className="font-medium">
																Payment to{" "}
																{transaction.to
																	?.username ||
																	"User"}
															</h4>
															{transaction.description && (
																<p className="text-gray-600 text-sm mt-1">
																	{
																		transaction.description
																	}
																</p>
															)}
															<div className="flex items-center mt-2 text-xs text-gray-500">
																<Clock
																	size={12}
																	className="mr-1"
																/>
																{formatDate(
																	transaction.createdAt
																)}
															</div>
														</div>
													</div>
													<div className="font-bold text-lg">
														₹
														{parseFloat(
															transaction.amount
														).toFixed(2)}
													</div>
												</div>
											</div>
										))}

										{/* Render received transactions */}
										{reciever.map((transaction) => (
											<div
												key={transaction._id}
												className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
											>
												<div className="flex justify-between items-start">
													<div className="flex items-start">
														<div className="p-2 bg-green-100 text-green-600 rounded-lg mr-4">
															<ArrowLeft
																size={16}
															/>
														</div>
														<div>
															<h4 className="font-medium">
																Payment from{" "}
																{transaction
																	.from
																	?.username ||
																	"User"}
															</h4>
															{transaction.description && (
																<p className="text-gray-600 text-sm mt-1">
																	{
																		transaction.description
																	}
																</p>
															)}
															<div className="flex items-center mt-2 text-xs text-gray-500">
																<Clock
																	size={12}
																	className="mr-1"
																/>
																{formatDate(
																	transaction.createdAt
																)}
															</div>
														</div>
													</div>
													<div className="font-bold text-lg">
														₹
														{parseFloat(
															transaction.amount
														).toFixed(2)}
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<ArrowLeft
											size={48}
											className="mx-auto text-emerald-200 mb-4"
										/>
										<h3 className="text-lg font-medium text-gray-700">
											No transactions found
										</h3>
										<p className="text-gray-500">
											Your payment history will appear
											here
										</p>
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Expense;

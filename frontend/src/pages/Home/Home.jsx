import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
	ArrowRightCircle,
	DollarSign,
	Users,
	CreditCard,
	Clock,
	Wallet,
	Receipt,
	PieChart,
	FileText,
	Tag,
	ArrowLeft,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
	const [user, setUser] = useState(null);

	const [isCheckingToken, setIsCheckingToken] = useState(true);
	const token = localStorage.getItem("token");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [groups, setGroups] = useState([]);
	const [transactionsLoading, setTransactionsLoading] = useState(false);
	const navigate = useNavigate();
	const [expenses, setExpenses] = useState([]);
	const [transactions, setTransactions] = useState([]);

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

	// Category icons mapping
	const categoryIcons = {
		Housing: <CreditCard size={16} />,
		Transportation: <ArrowLeft size={16} />,
		Food: <DollarSign size={16} />,
		Health: <Receipt size={16} />,
		Entertainment: <PieChart size={16} />,
		Personal: <Users size={16} />,
		"Debt & Finances": <Wallet size={16} />,
		Shopping: <Tag size={16} />,
		Miscellaneous: <FileText size={16} />,
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				const currentTime = Date.now() / 1000;
				if (decoded.exp && decoded.exp < currentTime) {
					console.warn("Token has expired");
					localStorage.removeItem("token");
					setUser(null);
				} else {
					setUser(decoded);
				}
			} catch (err) {
				console.error("Invalid token:", err);
				localStorage.removeItem("token");
				setUser(null);
			}
		}
		setIsCheckingToken(false);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
	};

	const hanldeCreategroup = () => {
		if (!user) {
			toast.error("You are not logged in. Please log in first.");
		} else {
			navigate("/groups");
		}
	};
	const handleProtectedAction = (action) => {
		if (!user) {
			toast.error("You are not logged in. Please log in first.");
		} else {
			if (action == "groups") {
				navigate("/groups");
			}
		}
	};

	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "long", day: "numeric" };
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", options);
	};

	useEffect(() => {
		if (user) {
			const fetchGroups = async () => {
				try {
					const res = await axios.get(
						"https://splitease2.onrender.com/api/groups",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					console.log("Groups data:", res.data);
					setGroups(res.data);
				} catch (err) {
					console.error("Error fetching groups:", err);
					setError("Failed to load groups. Please try again later.");
				} finally {
					setLoading(false);
				}
			};

			const fetchExpensesAndTransactions = async () => {
				setTransactionsLoading(true);
				try {
					const res = await axios.get(
						"https://splitease2.onrender.com/api/expense",
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);

					// Set expenses and transactions from the response
					setExpenses(res.data.expenses || []);
					setTransactions(res.data.transactions || []);
				} catch (err) {
					console.error(
						"Error fetching expenses and transactions:",
						err
					);
				} finally {
					setTransactionsLoading(false);
				}
			};

			fetchGroups();
			fetchExpensesAndTransactions();
		} else {
			setLoading(false);
		}
	}, [user, token]);

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
			{user ? (
				/* Logged-in user experience */
				<div className="max-w-6xl mx-auto px-4 py-6">
					<header className="flex justify-between items-center mb-8">
						<div className="flex items-center">
							<div className="bg-emerald-600 text-white p-2 rounded-lg">
								<Wallet size={24} />
							</div>
							<h1 className="text-2xl ml-2 font-bold text-emerald-600">
								SplitEase
							</h1>
						</div>
						<div className="flex items-center gap-4">
							<div className="hidden md:block">
								<p className="text-sm text-gray-500">
									Logged in as
								</p>
								<p className="font-medium">{user.email}</p>
							</div>
							<div className="bg-emerald-100 text-emerald-600 h-10 w-10 rounded-full flex items-center justify-center font-bold">
								{user.username.charAt(0).toUpperCase()}
							</div>
							<button
								onClick={handleLogout}
								className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-600 transition-colors"
							>
								Logout
							</button>
						</div>
					</header>

					<main>
						<div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-emerald-500">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">
								Welcome back, {user.username}!
							</h2>
							<p className="text-gray-600">
								Track expenses, split bills, and settle up with
								friends easily.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
								<div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
									<DollarSign className="text-emerald-500 mb-2" />
									<h3 className="font-medium">
										Track Expenses
									</h3>
									<p className="text-sm text-gray-600 mt-1">
										Record and categorize your spending
									</p>
								</div>
								<div className="bg-teal-50 p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow">
									<Users className="text-teal-500 mb-2" />
									<h3 className="font-medium">
										Manage Groups
									</h3>
									<p className="text-sm text-gray-600 mt-1">
										Create and join expense groups
									</p>
								</div>
								<div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 hover:shadow-md transition-shadow">
									<Receipt className="text-cyan-500 mb-2" />
									<h3 className="font-medium">Split Bills</h3>
									<p className="text-sm text-gray-600 mt-1">
										Divide expenses fairly among friends
									</p>
								</div>
								<div className="bg-green-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
									<Clock className="text-green-500 mb-2" />
									<h3 className="font-medium">
										View History
									</h3>
									<p className="text-sm text-gray-600 mt-1">
										Check past transactions and settlements
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-white rounded-xl shadow-sm p-6 col-span-2">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-medium">
										Recent Transactions
									</h3>
									<a
										href="/expense"
										className="text-sm text-emerald-600 hover:underline"
									>
										View All
									</a>
								</div>

								{transactionsLoading ? (
									<div className="flex justify-center py-12">
										<div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
									</div>
								) : expenses.length > 0 ||
								  transactions.length > 0 ? (
									<div className="space-y-3">
										{/* Show expenses first */}
										{expenses.slice(0, 3).map((expense) => (
											<div
												key={`expense-${expense._id}`}
												className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
											>
												<div className="flex items-center">
													<div
														className={`p-2 rounded-lg mr-3 ${
															categoryColors[
																expense.category
															] || "bg-gray-100"
														}`}
													>
														{categoryIcons[
															expense.category
														] || <Tag size={16} />}
													</div>
													<div>
														<p className="font-medium">
															{expense.category}
														</p>
														{expense.message && (
															<p className="text-xs text-gray-500">
																{
																	expense.message
																}
															</p>
														)}
													</div>
												</div>
												<div className="text-right">
													<p className="font-semibold">
														₹
														{parseFloat(
															expense.amount
														).toFixed(2)}
													</p>
													<p className="text-xs text-gray-500">
														{formatDate(
															expense.createdAt
														)}
													</p>
												</div>
											</div>
										))}

										{/* Then show transactions */}
										{transactions
											.slice(0, 3)
											.map((transaction) => (
												<div
													key={`transaction-${transaction._id}`}
													className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
												>
													<div className="flex items-center">
														<div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
															<ArrowLeft
																size={16}
															/>
														</div>
														<div>
															<p className="font-medium">
																Payment to{" "}
																{transaction.to
																	?.username ||
																	"User"}
															</p>
															{transaction.description && (
																<p className="text-xs text-gray-500">
																	{
																		transaction.description
																	}
																</p>
															)}
														</div>
													</div>
													<div className="text-right">
														<p className="font-semibold">
															₹
															{parseFloat(
																transaction.amount
															).toFixed(2)}
														</p>
														<p className="text-xs text-gray-500">
															{formatDate(
																transaction.createdAt
															)}
														</p>
													</div>
												</div>
											))}
									</div>
								) : (
									<div className="text-gray-500 text-center py-12">
										<PieChart
											className="mx-auto text-emerald-200 mb-4"
											size={48}
										/>
										<p>
											No recent transactions to display.
										</p>
										<button
											onClick={() => navigate("/expense")}
											className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
										>
											Add an Expense
										</button>
									</div>
								)}
							</div>
							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-medium">
										Your Groups
									</h3>
									<a
										href="/groups"
										className="text-sm text-emerald-600 hover:underline"
									>
										View All
									</a>
								</div>
								<div className="text-gray-500 text-center py-12">
									<Users
										className="mx-auto text-emerald-200 mb-4"
										size={48}
									/>
									{loading ? (
										<p>Loading groups...</p>
									) : groups.length > 0 ? (
										<ul className="list-disc list-inside text-left">
											{groups.map((group) => (
												<li
													key={group._id}
													className="mb-2"
												>
													<a
														href={`/groups/${group._id}`}
														className="text-emerald-600 hover:underline"
													>
														{group.groupName}
													</a>
												</li>
											))}
										</ul>
									) : (
										<p>
											{error ||
												"No groups found. Create a new group!"}
										</p>
									)}

									<button
										onClick={() => hanldeCreategroup()}
										className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
									>
										Create a Group
									</button>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"></div>
					</main>
				</div>
			) : (
				/* Guest user experience */
				<div className="max-w-6xl mx-auto px-4 py-10">
					<header className="flex justify-between items-center mb-12">
						<div className="flex items-center">
							<div className="bg-emerald-600 text-white p-2 rounded-lg">
								<Wallet size={24} />
							</div>
							<h1 className="text-2xl ml-2 font-bold text-emerald-600">
								SplitEase
							</h1>
						</div>
						<div className="space-x-2">
							<a
								href="/login"
								className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
							>
								Login
							</a>
							<a
								href="/register"
								className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
							>
								Register
							</a>
						</div>
					</header>

					<main>
						<div className="flex flex-col md:flex-row items-center gap-8 mb-16">
							<div className="md:w-1/2">
								<h1 className="text-4xl font-bold text-gray-800 mb-4">
									Split Expenses{" "}
									<span className="text-emerald-600">
										Without the Stress
									</span>
								</h1>
								<p className="text-lg text-gray-600 mb-6">
									The smart way to track bills, split costs,
									and settle up with friends and roommates.
								</p>
								<div className="flex gap-4">
									<a
										href="/register"
										className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
									>
										Get Started{" "}
										<ArrowRightCircle size={18} />
									</a>
								</div>
							</div>
							<div className="md:w-1/2">
								<div className="bg-gradient-to-br from-emerald-100 to-cyan-50 rounded-xl p-6 relative shadow-lg">
									<div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-emerald-400">
										<div className="flex justify-between items-center">
											<div className="flex items-center">
												<Receipt
													className="text-emerald-500 mr-2"
													size={18}
												/>
												<p className="font-medium">
													Dinner at Restaurant
												</p>
											</div>
											<p className="text-emerald-600 font-bold">
												$120.00
											</p>
										</div>
										<div className="text-sm text-gray-500 mt-2">
											Split evenly between 4 people
										</div>
										<div className="mt-3 text-xs bg-emerald-50 text-emerald-600 py-1 px-2 rounded inline-block">
											Your share: $30.00
										</div>
									</div>
									<div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-400">
										<div className="flex justify-between items-center">
											<div className="flex items-center">
												<CreditCard
													className="text-green-500 mr-2"
													size={18}
												/>
												<p className="font-medium">
													Weekend Trip
												</p>
											</div>
											<p className="text-green-600 font-bold">
												$45.00
											</p>
										</div>
										<div className="text-sm text-gray-500 mt-2">
											You are owed by 2 people
										</div>
										<div className="flex gap-1 mt-3">
											<div className="text-xs bg-green-50 text-green-600 py-1 px-2 rounded">
												Alex owes you: $22.50
											</div>
											<div className="text-xs bg-green-50 text-green-600 py-1 px-2 rounded">
												Sam owes you: $22.50
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
							<div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
								<div className="bg-emerald-100 p-3 rounded-full mb-4">
									<Receipt className="text-emerald-600" />
								</div>
								<button onClick={handleProtectedAction}>
									<h3 className="text-xl font-medium mb-2">
										Track Expenses
									</h3>
									<p className="text-gray-600">
										Easily record expenses and keep track of
										who owes what within your groups.
									</p>
								</button>
							</div>
							<div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
								<div className="bg-teal-100 p-3 rounded-full mb-4">
									<Users className="text-teal-600" />
								</div>
								<button
									onClick={() =>
										handleProtectedAction("groups")
									}
								>
									<h3 className="text-xl font-medium mb-2">
										Create Groups
									</h3>
									<p className="text-gray-600">
										Organize your expenses by creating
										different groups for different
										situations.
									</p>
								</button>
							</div>
							<div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
								<div className="bg-cyan-100 p-3 rounded-full mb-4">
									<CreditCard className="text-cyan-600" />
								</div>
								<button onClick={handleProtectedAction}>
									<h3 className="text-xl font-medium mb-2">
										Settle Up
									</h3>
									<p className="text-gray-600">
										Settle debts easily and keep track of
										your payment history.
									</p>
								</button>
							</div>
						</div>

						<div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-8 text-center shadow-lg">
							<h2 className="text-2xl font-bold mb-4 text-white">
								Ready to simplify your group expenses?
							</h2>
							<p className="text-lg text-emerald-50 mb-6 max-w-2xl mx-auto">
								Join thousands of users who are already using
								SplitEase to manage shared expenses.
							</p>
							<a
								href="/register"
								className="inline-block px-6 py-3 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
							>
								Create Your Free Account
							</a>
						</div>
					</main>

					<footer className="mt-16 py-8 border-t border-gray-200">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="flex items-center mb-4 md:mb-0">
								<div className="bg-emerald-600 text-white p-1 rounded-md">
									<Wallet size={16} />
								</div>
								<span className="ml-2 font-medium">
									SplitEase
								</span>
							</div>
							<div className="flex gap-4 text-sm text-gray-500">
								<a href="/" className="hover:text-emerald-600">
									About
								</a>
								<a href="/" className="hover:text-emerald-600">
									Contact
								</a>
								<a href="/" className="hover:text-emerald-600">
									Privacy Policy
								</a>
								<a href="/" className="hover:text-emerald-600">
									Terms of Service
								</a>
							</div>
						</div>
					</footer>
				</div>
			)}
		</div>
	);
};

export default Home;

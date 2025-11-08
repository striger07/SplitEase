import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Transactions = ({ groupId }) => {
	const navigate = useNavigate();
	const [transactions, setTransactions] = useState([]);
	const [members, setMembers] = useState([]);
	const [from, setFrom] = useState("");
	const [isValid, setIsValid] = useState(null); // null | true | false
	const [selectedToIds, setSelectedToIds] = useState([]);
	const [amount, setAmount] = useState("");
	const [loading, setLoading] = useState(true);
	const [description, setDescription] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const checkUsername = () => {
		if (!from.trim()) {
			setIsValid(null);
			return;
		}
		const found = members.find((m) => m.username === from.trim());
		setIsValid(!!found);
	};

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return navigate("/login");

		try {
			const { exp } = jwtDecode(token);
			if (Date.now() >= exp * 1000) {
				localStorage.removeItem("token");
				navigate("/login");
				return;
			}
		} catch (error) {
			console.error("Invalid token", error);
			navigate("/login");
			return;
		}

		const headers = { Authorization: `Bearer ${token}` };

		const fetchData = async () => {
			setLoading(true);
			try {
				const [txRes, membersRes] = await Promise.all([
					axios.get(
						`https://splitease2.onrender.com/api/groups/${groupId}/transactions`,
						{ headers }
					),
					axios.get(
						`https://splitease2.onrender.com/api/groups/${groupId}/members`,
						{ headers }
					),
				]);

				setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
				setMembers(membersRes.data);
			} catch (error) {
				console.error("Error fetching data:", error);
				setErrorMessage("Failed to load transactions or members");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [navigate, groupId]);

	const handleCheckboxChange = (memberId) => {
		setSelectedToIds((prev) =>
			prev.includes(memberId)
				? prev.filter((id) => id !== memberId)
				: [...prev, memberId]
		);
	};

	const handleSelectAll = () => {
		if (selectedToIds.length === members.length) {
			setSelectedToIds([]);
		} else {
			setSelectedToIds(members.map((member) => member._id));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrorMessage("");

		if (!from || !isValid || selectedToIds.length === 0 || !amount) {
			setErrorMessage(
				"Please enter a valid username and select recipients."
			);
			return;
		}

		const fromUser = members.find((m) => m.username === from);
		if (!fromUser) {
			setErrorMessage("This user is not a member of the group.");
			return;
		}

		const allInvolvedIds = [...new Set(selectedToIds)];
		let share;

		if (allInvolvedIds.includes(fromUser._id)) {
			const splitCount = allInvolvedIds.length;
			share = amount / splitCount;
		} else {
			share = amount / allInvolvedIds.length;
		}

		const token = localStorage.getItem("token");
		try {
			const newTransactions = await Promise.all(
				allInvolvedIds
					.filter((toId) => toId !== fromUser._id) // skip self-transactions
					.map(async (toId) => {
						const res = await axios.post(
							`https://splitease2.onrender.com/api/groups/${groupId}/transactions`,
							{
								from: fromUser._id,
								to: toId,
								amount: share.toFixed(2),
								description: description || "Split expense",
							},
							{
								headers: { Authorization: `Bearer ${token}` },
							}
						);
						return res.data;
					})
			);

			setTransactions((prev) => [...prev, ...newTransactions]);
			setFrom("");
			setIsValid(null);
			setSelectedToIds([]);
			setAmount("");
			setDescription("");
		} catch (error) {
			console.error("Error submitting transactions:", error);
			setErrorMessage("Failed to create transactions. Please try again.");
		}
	};

	const handleDelete = async (transactionId) => {
		const token = localStorage.getItem("token");
		try {
			await axios.delete(
				`https://splitease2.onrender.com/api/groups/${groupId}/transactions/${transactionId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setTransactions((prev) =>
				prev.filter((tx) => tx._id !== transactionId)
			);
		} catch (error) {
			console.error("Error deleting transaction:", error);
			setErrorMessage("Failed to delete transaction");
		}
	};

	const getMemberName = (id) => {
		const member = members.find((m) => m._id === id);
		return member ? member.username : "Unknown";
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center p-8">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-800 mb-4">
					Add New Expense
				</h2>

				{errorMessage && (
					<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
						<p>{errorMessage}</p>
					</div>
				)}

				{members.length > 0 ? (
					<form
						onSubmit={handleSubmit}
						className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
					>
						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Paid by:
							</label>
							<div className="flex space-x-2">
								<input
									type="text"
									value={from}
									onChange={(e) => setFrom(e.target.value)}
									onBlur={checkUsername}
									required
									placeholder="Enter username"
									className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								{isValid === true && (
									<span className="flex items-center text-green-600">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								)}
								{isValid === false && (
									<span className="flex items-center text-red-600">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								)}
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Description:
							</label>
							<input
								type="text"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="What was this expense for?"
								className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 font-medium mb-2">
								Total Amount:
							</label>
							<div className="flex items-center">
								<span className="px-4 py-2 bg-gray-100 border border-r-0 rounded-l-md text-gray-500">
									$
								</span>
								<input
									type="number"
									min="0"
									step="0.01"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									required
									placeholder="0.00"
									className="flex-grow px-4 py-2 border rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>
						</div>

						<div className="mb-4">
							<div className="flex justify-between items-center mb-2">
								<label className="block text-gray-700 font-medium">
									Split with:
								</label>
								<button
									type="button"
									onClick={handleSelectAll}
									className="text-sm text-green-600 hover:text-green-800"
								>
									{selectedToIds.length === members.length
										? "Deselect All"
										: "Select All"}
								</button>
							</div>

							<div className="bg-gray-50 p-3 rounded-md max-h-60 overflow-y-auto border">
								<ul className="space-y-1">
									{members.map((member) => (
										<li
											key={member._id}
											className="flex items-center py-1"
										>
											<label className="flex items-center space-x-2 cursor-pointer w-full">
												<input
													type="checkbox"
													value={member._id}
													checked={selectedToIds.includes(
														member._id
													)}
													onChange={() =>
														handleCheckboxChange(
															member._id
														)
													}
													className="rounded text-green-600 focus:ring-green-500 h-4 w-4"
												/>
												<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
													{member.username
														.charAt(0)
														.toUpperCase()}
												</div>
												<span>{member.username}</span>
											</label>
										</li>
									))}
								</ul>
							</div>
						</div>

						<button
							type="submit"
							disabled={!isValid}
							className={`w-full py-2 px-4 rounded-md font-medium ${
								isValid
									? "bg-green-600 hover:bg-green-700 text-white"
									: "bg-gray-300 text-gray-500 cursor-not-allowed"
							} transition`}
						>
							Add Expense
						</button>
					</form>
				) : (
					<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
						<p className="text-yellow-800">
							No members in this group. Add members first.
						</p>
					</div>
				)}
			</div>

			<div>
				<h2 className="text-xl font-semibold text-gray-800 mb-4">
					Expenses List
				</h2>

				{transactions.length === 0 ? (
					<div className="bg-gray-50 p-8 text-center rounded-lg border border-dashed border-gray-300">
						<p className="text-gray-500">
							No expenses recorded yet.
						</p>
					</div>
				) : (
					<div className="bg-white rounded-lg border overflow-hidden">
						<ul className="divide-y divide-gray-200">
							{transactions.map((tx) => (
								<li
									key={tx._id}
									className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
								>
									<div>
										<div className="flex items-center space-x-2">
											<div className="font-medium">
												{tx.from?.username ||
													getMemberName(tx.from) ||
													"Unknown"}
											</div>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 text-gray-500"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M14 5l7 7m0 0l-7 7m7-7H3"
												/>
											</svg>
											<div className="font-medium">
												{tx.to?.username ||
													getMemberName(tx.to) ||
													"Unknown"}
											</div>
										</div>
										<div className="text-sm text-gray-500 mt-1">
											{tx.description || "Split expense"}
										</div>
									</div>
									<div className="flex items-center space-x-4">
										<div className="font-semibold text-green-600">
											${parseFloat(tx.amount).toFixed(2)}
										</div>
										<button
											onClick={() => handleDelete(tx._id)}
											className="text-red-500 hover:text-red-700 p-1"
											aria-label="Delete transaction"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
};

export default Transactions;

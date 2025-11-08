import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Results = () => {
	const { groupId } = useParams();
	const navigate = useNavigate();

	const [results, setResults] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [noTransactions, setNoTransactions] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

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

		const fetchResults = async () => {
			try {
				const response = await axios.get(
					`https://splitease2.onrender.com/api/groups/${groupId}/results`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				console.log("Results response:", response.data);
				setResults(response.data);
				setNoTransactions(response.data.noTransactions || false);
			} catch (err) {
				console.error("Error fetching results:", err);
				if (
					err.response &&
					err.response.status === 404 &&
					err.response.data === "No transactions found for this group"
				) {
					setNoTransactions(true);
				} else {
					setError("Failed to load expense results");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [groupId, navigate]);

	if (loading) {
		return (
			<div className="flex justify-center items-center p-8">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
				<p>{error}</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto px-4 py-8">
			<div className="bg-white shadow rounded-lg overflow-hidden">
				<div className="bg-green-600 px-6 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-bold text-white">
							Group Expense Results
						</h1>
						<button
							onClick={() => navigate(`/groups/${groupId}`)}
							className="p-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition"
							aria-label="Back to group"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>

				{noTransactions ? (
					<div className="p-6">
						<div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
							<div className="flex">
								<div className="flex-shrink-0">
									<svg
										className="h-5 w-5 text-yellow-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-yellow-700">
										No transaction history found for this
										group. Add expenses before calculating
										results.
									</p>
								</div>
							</div>
						</div>

						<div className="mt-4 text-center">
							<button
								onClick={() => navigate(`/groups/${groupId}`)}
								className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Return to Group
							</button>
						</div>
					</div>
				) : (
					<div className="p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Member Balances
						</h2>
						<div className="bg-gray-50 rounded-lg p-4 mb-6">
							{results?.balances?.length > 0 ? (
								<ul className="divide-y divide-gray-200">
									{results.balances.map((balance) => (
										<li
											key={balance.userId}
											className="py-3 flex justify-between items-center"
										>
											<div className="flex items-center">
												<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
													{balance.username
														.charAt(0)
														.toUpperCase()}
												</div>
												<span className="text-gray-800">
													{balance.username}
												</span>
											</div>
											<div
												className={`font-semibold ${
													balance.balance > 0
														? "text-green-600"
														: balance.balance < 0
														? "text-red-600"
														: "text-gray-600"
												}`}
											>
												{balance.balance > 0 ? "+" : ""}
												${balance.balance.toFixed(2)}
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="text-gray-500 italic">
									No balance information available
								</p>
							)}
						</div>

						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Settlement Plan
						</h2>
						{results?.paymentPlan?.length > 0 ? (
							<div className="bg-white rounded-lg border border-gray-200">
								<ul className="divide-y divide-gray-200">
									{results.paymentPlan.map(
										(payment, index) => (
											<li
												key={index}
												className="p-4 hover:bg-gray-50"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-3">
														<div className="flex flex-col">
															<span className="font-medium text-gray-900">
																{
																	payment.fromName
																}
															</span>
															<span className="text-sm text-gray-500">
																pays
															</span>
														</div>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-5 w-5 text-gray-400"
															viewBox="0 0 20 20"
															fill="currentColor"
														>
															<path
																fillRule="evenodd"
																d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
																clipRule="evenodd"
															/>
														</svg>
														<div className="flex flex-col">
															<span className="font-medium text-gray-900">
																{payment.toName}
															</span>
														</div>
													</div>
													<div className="font-semibold text-green-600">
														$
														{payment.amount.toFixed(
															2
														)}
													</div>
												</div>
											</li>
										)
									)}
								</ul>
							</div>
						) : (
							<div className="bg-gray-50 p-6 text-center rounded-lg border border-dashed border-gray-300">
								<p className="text-gray-500">
									No payments needed! Everyone is settled up.
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Results;

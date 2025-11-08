import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Transactions from "../Transactions/Transactions";

const Split = () => {
	const navigate = useNavigate();
	const { groupId } = useParams();

	const [activeTab, setActiveTab] = useState("names");
	const [groupData, setGroupData] = useState(null);
	const [members, setMembers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

		const fetchGroupData = async () => {
			try {
				const membersResponse = await axios.get(
					`https://splitease2.onrender.com/api/groups/${groupId}/members`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setMembers(membersResponse.data);
			} catch (err) {
				console.error("Error fetching group data:", err);
				setError("Failed to load group data");
			} finally {
				setLoading(false);
			}
		};

		fetchGroupData();
	}, [navigate, groupId]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				<p className="mt-4 text-gray-600">Loading group data...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white shadow rounded-lg overflow-hidden">
					{/* Header with group name */}
					<div className="bg-green-600 px-6 py-4">
						<div className="flex items-center justify-between">
							<h1 className="text-xl font-bold text-white">
								{groupData?.name || "Split Expenses"}
							</h1>
							<button
								onClick={() => navigate("/groups")}
								className="p-2 rounded-full bg-green-700 text-white hover:bg-green-800 transition"
								aria-label="Back to groups"
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

					{/* Tab navigation */}
					<div className="border-b border-gray-200">
						<nav className="flex">
							<button
								onClick={() => setActiveTab("names")}
								className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
									activeTab === "names"
										? "border-green-500 text-green-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<div className="flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
									</svg>
									People
								</div>
							</button>
							<button
								onClick={() => setActiveTab("transactions")}
								className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
									activeTab === "transactions"
										? "border-green-500 text-green-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<div className="flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 mr-2"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
										<path
											fillRule="evenodd"
											d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
											clipRule="evenodd"
										/>
									</svg>
									Expenses
								</div>
							</button>
						</nav>
					</div>

					{/* Error message */}
					{error && (
						<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
							<div className="flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5 mr-2"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
								<p>{error}</p>
							</div>
						</div>
					)}

					{/* Content area */}
					<div className="p-4">
						{activeTab === "names" ? (
							<div>
								<h2 className="text-lg font-medium text-gray-900 mb-4">
									Group Members
								</h2>
								<ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg">
									{members.length > 0 ? (
										members.map((member) => (
											<li
												key={member._id}
												className="py-3 px-4 flex items-center hover:bg-gray-100"
											>
												<div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
													{member.username
														.charAt(0)
														.toUpperCase()}
												</div>
												<span className="text-gray-800">
													{member.username}
												</span>
											</li>
										))
									) : (
										<li className="py-4 px-6 text-gray-500 italic">
											No members found
										</li>
									)}
								</ul>
							</div>
						) : (
							<Transactions groupId={groupId} />
						)}
					</div>

					{/* Action buttons */}
					<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
						<button
							onClick={() => navigate(`/groups`)}
							className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
						>
							Back to Group
						</button>
						<button
							onClick={() =>
								navigate(`/groups/${groupId}/results`)
							}
							className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition flex items-center"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-1"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
									clipRule="evenodd"
								/>
							</svg>
							Calculate Results
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Split;

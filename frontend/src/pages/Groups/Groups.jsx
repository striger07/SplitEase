import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
	Wallet,
	Users,
	Plus,
	Search,
	UserPlus,
	Mail,
	ArrowRight,
	Loader,
	X,
	Check,
	Receipt,
} from "lucide-react";

const Groups = () => {
	const [groupName, setGroupName] = useState("");
	const [groups, setGroups] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [notification, setNotification] = useState(null);
	const [inviteEmail, setInviteEmail] = useState("");
	const [showEmailInput, setShowEmailInput] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const validateTokenAndFetchGroups = async () => {
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

				// fetch groups after validating token
				const res = await axios.get(
					"https://splitease2.onrender.com/api/groups",
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);

				console.log("Groups response:", res.data);
				setGroups(res.data);
				setLoading(false);
			} catch (error) {
				console.error(
					"Error during token validation or fetching groups",
					error
				);
				localStorage.removeItem("token");
				navigate("/login");
			}
		};

		validateTokenAndFetchGroups();
	}, [navigate]);

	const handleCreateGroup = async () => {
		console.log("Creating group with name:", groupName);
		if (!groupName.trim()) {
			showNotification("Please enter a group name", "error");
			return;
		}

		try {
			setLoading(true);
			const token = localStorage.getItem("token");
			const res = await axios.post(
				"https://splitease2.onrender.com/api/groups",
				{ name: groupName },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			console.log("Group created:", res.data);
			setGroups([...groups, res.data]);
			setGroupName("");
			showNotification("Group created successfully!", "success");
		} catch (err) {
			console.error("Error creating group:", err);
			showNotification("Failed to create group", "error");
		} finally {
			setLoading(false);
		}
	};

	const showNotification = (message, type = "success") => {
		setNotification({ message, type });
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	const goToGroup = (groupId) => {
		navigate(`/groups/${groupId}`);
	};

	const goToSplit = (groupId) => {
		navigate(`/groups/${groupId}/split`);
	};

	const handleSearchUser = async () => {
		if (!searchTerm.trim() || !selectedGroup) return;

		setSearching(true);
		setShowEmailInput(false);
		try {
			const token = localStorage.getItem("token");
			const res = await axios.get(
				`https://splitease2.onrender.com/api/user-exists?username=${searchTerm}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			console.log("Search results:", res.data);
			if (res.data.exists) {
				setSearchResults([searchTerm]);
			} else {
				setSearchResults([]);
				setShowEmailInput(true);
				setInviteEmail(""); // Clear any previous email
			}
		} catch (err) {
			console.error("Error searching for users:", err);
			setSearchResults([]);
			setShowEmailInput(true);
		} finally {
			setSearching(false);
		}
	};

	const handleAddUser = async (uname) => {
		try {
			const token = localStorage.getItem("token");
			console.log(`Adding user ${uname} to group ${selectedGroup._id}`);
			// first check if the user is already a member of the group
			const groupMembers = await axios.get(
				`https://splitease2.onrender.com/api/groups/${selectedGroup._id}/members`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			console.log("Group members:", groupMembers);
			const isMember = groupMembers.data.some(
				(member) => member.username === uname
			);
			if (isMember) {
				showNotification(
					"User is already a member of the group",
					"error"
				);
				return;
			}
			await axios.post(
				`https://splitease2.onrender.com/api/groups/${selectedGroup._id}/members`,
				{ username: uname },
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			showNotification("User added to group successfully!", "success");
			setSearchTerm("");
			setSearchResults([]);
		} catch (err) {
			console.error("Error adding user to group:", err);
			showNotification("Failed to add user to group", "error");
		}
	};

	const handleInviteUser = async () => {
		if (!inviteEmail.trim()) {
			showNotification("Please enter an email address", "error");
			return;
		}

		try {
			const token = localStorage.getItem("token");
			await axios.post(
				`https://splitease2.onrender.com/api/send-invite`,
				{
					email: inviteEmail,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			showNotification("Invitation sent successfully!", "success");
			setSearchTerm("");
			setShowEmailInput(false);
			setInviteEmail("");
		} catch (err) {
			console.error("Error sending invitation:", err);
			showNotification("Failed to send invitation", "error");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
			<header className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center">
						<div className="bg-emerald-600 text-white p-2 rounded-lg mr-2">
							<Wallet size={24} />
						</div>
						<h1 className="text-xl font-bold text-gray-800">
							SplitEase
						</h1>
					</div>
					<nav>
						<button
							onClick={() => navigate("/")}
							className="px-4 py-2 text-gray-600 hover:text-emerald-600"
						>
							Dashboard
						</button>
					</nav>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-8">
				{notification && (
					<div
						className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
							notification.type === "success"
								? "bg-green-50 text-green-700"
								: "bg-red-50 text-red-700"
						}`}
					>
						<div className="flex items-center">
							{notification.type === "success" ? (
								<Check size={18} className="mr-2" />
							) : (
								<X size={18} className="mr-2" />
							)}
							{notification.message}
						</div>
						<button
							onClick={() => setNotification(null)}
							className="text-gray-500 hover:text-gray-700"
						>
							<X size={16} />
						</button>
					</div>
				)}

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="md:col-span-1">
						<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
							<h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
								<Users className="mr-2 text-emerald-600" />
								Create a Group
							</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="groupName"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Group Name
									</label>
									<input
										id="groupName"
										type="text"
										placeholder="Weekend Trip, Roommates, etc."
										value={groupName}
										onChange={(e) =>
											setGroupName(e.target.value)
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
									/>
								</div>
								<button
									onClick={handleCreateGroup}
									disabled={loading}
									className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
								>
									{loading ? (
										<Loader
											size={18}
											className="animate-spin"
										/>
									) : (
										<>
											<Plus size={18} className="mr-2" />
											Create Group
										</>
									)}
								</button>
							</div>
						</div>
					</div>

					<div className="md:col-span-2">
						<div className="bg-white rounded-xl shadow-sm p-6">
							<h2 className="text-xl font-semibold mb-4 text-gray-800">
								Your Groups
							</h2>

							{loading ? (
								<div className="text-center py-8">
									<Loader
										size={24}
										className="animate-spin mx-auto text-emerald-600"
									/>
									<p className="text-gray-500 mt-2">
										Loading your groups...
									</p>
								</div>
							) : groups.length === 0 ? (
								<div className="text-center py-8 bg-gray-50 rounded-lg">
									<Users
										size={48}
										className="mx-auto text-gray-300 mb-3"
									/>
									<p className="text-gray-500">
										You haven't created any groups yet.
									</p>
									<p className="text-gray-500 text-sm mt-1">
										Create a group to start splitting
										expenses with friends.
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{groups.map((group) => (
										<div
											key={group._id}
											className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
												selectedGroup?._id === group._id
													? "border-emerald-500 bg-emerald-50"
													: "border-gray-200"
											}`}
											onClick={() =>
												setSelectedGroup(group)
											}
										>
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-medium">
														{group.groupName}
													</h3>
													<p className="text-sm text-gray-500 mt-1">
														{group.members
															?.length || 0}{" "}
														members
													</p>
												</div>
												<div className="flex space-x-2">
													<button
														onClick={(e) => {
															e.stopPropagation();
															goToSplit(
																group._id
															);
														}}
														className="text-emerald-600 hover:bg-emerald-50 p-1 rounded flex items-center"
														title="Split Expenses"
													>
														<Receipt size={18} />
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															goToGroup(
																group._id
															);
														}}
														className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
														title="View Group"
													>
														<ArrowRight size={18} />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{selectedGroup && (
							<div className="bg-white rounded-xl shadow-sm p-6 mt-6">
								<h3 className="text-lg font-medium mb-4">
									Add People to "{selectedGroup.groupName}"
								</h3>

								<div className="relative mb-4">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
										<Search size={18} />
									</div>
									<input
										type="text"
										placeholder="Search by username"
										value={searchTerm}
										onChange={(e) =>
											setSearchTerm(e.target.value)
										}
										onKeyPress={(e) =>
											e.key === "Enter" &&
											handleSearchUser()
										}
										className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
									/>
									<button
										onClick={handleSearchUser}
										className="absolute inset-y-0 right-0 px-3 flex items-center bg-emerald-600 text-white rounded-r-lg hover:bg-emerald-700"
									>
										{searching ? (
											<Loader
												size={16}
												className="animate-spin"
											/>
										) : (
											"Search"
										)}
									</button>
								</div>

								{searchResults.length > 0 ? (
									<div className="border rounded-lg divide-y">
										{searchResults.map((user) => (
											<div
												key={user._id}
												className="p-3 flex justify-between items-center"
											>
												<div>
													<p className="font-medium">
														{searchTerm}
													</p>
												</div>
												<button
													onClick={() =>
														handleAddUser(
															searchTerm
														)
													}
													className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 px-3 py-1 rounded-lg flex items-center text-sm"
												>
													<UserPlus
														size={16}
														className="mr-1"
													/>
													Add to Group
												</button>
											</div>
										))}
									</div>
								) : showEmailInput ? (
									<div className="border rounded-lg p-4">
										<div className="text-center">
											<p className="text-gray-500 mb-3">
												No user found with username "
												{searchTerm}". Enter an email
												address to send an invitation:
											</p>
											<div className="flex space-x-2 mb-3">
												<input
													type="email"
													placeholder="Email address"
													value={inviteEmail}
													onChange={(e) =>
														setInviteEmail(
															e.target.value
														)
													}
													className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
												/>
											</div>
											<button
												onClick={handleInviteUser}
												className="bg-emerald-100 text-emerald-600 hover:bg-emerald-200 px-4 py-2 rounded-lg flex items-center mx-auto"
											>
												<Mail
													size={16}
													className="mr-2"
												/>
												Send Invitation
											</button>
										</div>
									</div>
								) : null}
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default Groups;

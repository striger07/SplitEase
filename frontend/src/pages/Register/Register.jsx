import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
	Wallet,
	User,
	Mail,
	Lock,
	ArrowRight,
	Loader,
	Eye,
	EyeOff,
} from "lucide-react";

const Register = () => {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleRegister = () => {
		if (!username || !email || !password) {
			setError("Please fill in all fields.");
			return;
		}

		if (!isPasswordValid(password)) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		setLoading(true);
		setError("");

		axios
			.post("https://splitease2.onrender.com/api/register", {
				username,
				email,
				password,
			})
			.then((res) => {
				console.log("Registration response:", res.data);
				localStorage.setItem("token", res.data.token);
				navigate("/");
			})
			.catch((err) => {
				console.error("Registration error:", err);
				setError(
					err.response?.data?.error ||
						"Registration failed. Try again later."
				);
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const isPasswordValid = (password) => {
		return password.length >= 8;
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleRegister();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
			<div className="max-w-md w-full">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center bg-emerald-600 text-white p-3 rounded-xl mb-4">
						<Wallet size={32} />
					</div>
					<h1 className="text-3xl font-bold text-gray-800">
						Create an Account
					</h1>
					<p className="text-gray-600 mt-2">
						Join SplitEase and manage shared expenses easily
					</p>
				</div>

				<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
					{error && (
						<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
							{error}
						</div>
					)}

					<div className="mb-4">
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Username
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
								<User size={18} />
							</div>
							<input
								id="username"
								placeholder="Your username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								onKeyPress={handleKeyPress}
								className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
							/>
						</div>
					</div>

					<div className="mb-4">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Email
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
								<Mail size={18} />
							</div>
							<input
								id="email"
								placeholder="you@example.com"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onKeyPress={handleKeyPress}
								className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
							/>
						</div>
					</div>

					<div className="mb-6">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Password
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
								<Lock size={18} />
							</div>
							<input
								id="password"
								placeholder="Create a password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyPress={handleKeyPress}
								className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
							/>
							<div
								className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-gray-400"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff size={18} />
								) : (
									<Eye size={18} />
								)}
							</div>
						</div>
						<p className="text-xs text-gray-500 mt-1">
							Password must be at least 8 characters long
						</p>
					</div>

					<button
						onClick={handleRegister}
						disabled={loading}
						className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
					>
						{loading ? (
							<>
								<Loader
									size={18}
									className="animate-spin mr-2"
								/>
								Creating Account...
							</>
						) : (
							<>
								Create Account
								<ArrowRight size={18} className="ml-2" />
							</>
						)}
					</button>
				</div>

				<div className="text-center">
					<p className="text-gray-600">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-emerald-600 font-medium hover:underline"
						>
							Sign In
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Register;

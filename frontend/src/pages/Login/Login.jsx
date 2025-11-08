import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Wallet, Mail, Lock, ArrowRight, Loader } from "lucide-react";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	

	const handleLogin = () => {
		if (!email || !password) {
			setError("Please fill in all fields.");
			return;
		}		

		setLoading(true);
		setError("");

		axios
			.post("https://splitease2.onrender.com/api/login", { email, password })
			.then((res) => {
				const { token } = res.data;
				localStorage.setItem("token", token);
				navigate("/");
			})
			.catch((err) => {
				console.error("Login error:", err);
				setError("Invalid email or password. Please try again.");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleLogin();
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
						Welcome Back
					</h1>
					<p className="text-gray-600 mt-2">
						Sign in to your SplitEase account
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
						<div className="flex justify-between items-center mb-1">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
						</div>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
								<Lock size={18} />
							</div>
							<input
								id="password"
								placeholder="Enter your password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyPress={handleKeyPress}
								className="w-full py-3 pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
							/>
						</div>
					</div>

					<button
						onClick={handleLogin}
						disabled={loading}
						className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
					>
						{loading ? (
							<>
								<Loader
									size={18}
									className="animate-spin mr-2"
								/>
								Signing In...
							</>
						) : (
							<>
								Sign In
								<ArrowRight size={18} className="ml-2" />
							</>
						)}
					</button>
				</div>

				<div className="text-center">
					<p className="text-gray-600">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-emerald-600 font-medium hover:underline"
						>
							Create Account
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;

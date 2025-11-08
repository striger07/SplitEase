import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Expense from "./pages/Expense/Expense";
import Split from "./pages/Split/Split";
import Groups from "./pages/Groups/Groups";
import Results from "./pages/Results/Results";

function App() {
	return (
		<div className="App">
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/expense" element={<Expense />} />
				<Route path="/groups" element={<Groups />} />
				<Route path="/groups/:groupId" element={<Split />} />
				<Route path="/groups/:groupId/results" element={<Results />} />
			</Routes>
		</div>
	);
}

export default App;

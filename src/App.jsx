import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AgentsPage from "./pages/AgentsPage";
import ChatPage from "./pages/ChatPage";
import Navbar from "./components/NavBar";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <Navbar />
        <main className="p-6 space-y-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

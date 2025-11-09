import { useState, useEffect, useRef } from "react";
import { AgentAPI } from "../api/apiClient";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasFetched = useRef(false);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await AgentAPI.list();
      setAgents(res.data.agents || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAgents();
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3">
          🧠 Active Agents
        </h3>

        {loading ? (
          <p className="text-gray-500 italic">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="text-gray-500 italic">No agents registered yet</p>
        ) : (
          <ul className="space-y-2 text-gray-300">
            {agents.map((a) => (
              <li
                key={a.agentId}
                className="p-3 rounded-md border border-gray-700 bg-gray-800/40 hover:bg-gray-800/70 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-cyan-300 font-medium">{a.agentId}</span>{" "}
                    <span className="text-sm text-gray-500">({a.type})</span>
                  </div>
                  <span className="text-xs text-gray-400">{a.endpoint}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

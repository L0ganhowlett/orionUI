import { useState, useEffect, useRef } from "react";
import { AgentAPI, ToolAPI } from "../api/apiClient";

export default function ToolsPage() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToolForm, setShowToolForm] = useState(false);
  const [toolData, setToolData] = useState({ name: "", description: "", schema: "" });

  const hasFetched = useRef(false);

  // 🔹 Fetch existing agents (from AgentAPI)
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

  // 🔹 Fetch tools for selected agent
  const fetchTools = async (agent) => {
    if (!agent) return;
    try {
      const res = await ToolAPI.list(agent.endpoint);
      setTools(res.data || []);
    } catch (err) {
      console.error("Error fetching tools:", err);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) fetchTools(selectedAgent);
  }, [selectedAgent]);

  // 🔹 Register a new tool
  const registerTool = async () => {
    if (!selectedAgent) {
      alert("Please select an agent first!");
      return;
    }
    try {
      const schemaObj = JSON.parse(toolData.schema);
      await ToolAPI.register(selectedAgent.endpoint, {
        name: toolData.name,
        description: toolData.description,
        schema: schemaObj,
      });
      setToolData({ name: "", description: "", schema: "" });
      setShowToolForm(false);
      fetchTools(selectedAgent);
    } catch (err) {
      alert("Invalid schema JSON or server error");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 🔹 Agent List */}
      <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
        <h3 className="text-lg font-semibold text-cyan-300 mb-3">Available Agents</h3>
        {loading ? (
          <p className="text-gray-500 italic">Loading agents...</p>
        ) : agents.length === 0 ? (
          <p className="text-gray-500 italic">No agents registered</p>
        ) : (
          <ul className="space-y-2 text-gray-300">
            {agents.map((a) => (
              <li
                key={a.agentId}
                onClick={() => setSelectedAgent(a)}
                className={`p-3 rounded-md border transition-all cursor-pointer ${
                  selectedAgent?.agentId === a.agentId
                    ? "bg-cyan-800/30 border-cyan-600"
                    : "bg-gray-800/40 border-gray-700 hover:bg-gray-800/70"
                }`}
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

      {/* 🔹 Tool Section */}
      {selectedAgent && (
        <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-cyan-300">
              Tools for {selectedAgent.agentId}
            </h3>
            <button
              onClick={() => setShowToolForm(!showToolForm)}
              className="bg-blue-600 px-3 py-1.5 rounded-lg text-white hover:bg-blue-500"
            >
              {showToolForm ? "Cancel" : "➕ Add Tool"}
            </button>
          </div>

          {/* 🔹 Tool Form */}
          {showToolForm && (
            <div className="space-y-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <input
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
                placeholder="Tool Name"
                value={toolData.name}
                onChange={(e) => setToolData({ ...toolData, name: e.target.value })}
              />
              <input
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100"
                placeholder="Description"
                value={toolData.description}
                onChange={(e) => setToolData({ ...toolData, description: e.target.value })}
              />
              <textarea
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-100 text-sm font-mono"
                rows="5"
                placeholder='Schema (JSON format) — e.g. {"type":"object","properties":{"beneficiary":{"type":"string"}}}'
                value={toolData.schema}
                onChange={(e) => setToolData({ ...toolData, schema: e.target.value })}
              />
              <button
                onClick={registerTool}
                className="bg-cyan-600 hover:bg-cyan-500 px-3 py-2 rounded-lg text-white"
              >
                💾 Register Tool to {selectedAgent.agentId}
              </button>
            </div>
          )}

          {/* 🔹 Tool List */}
          {tools.length === 0 ? (
            <p className="text-gray-500 italic mt-3">No tools registered for this agent</p>
          ) : (
            <ul className="space-y-2 mt-3">
              {tools.map((t) => (
                <li
                  key={t.name}
                  className="bg-gray-800/40 border border-gray-700 rounded-lg p-3 text-sm text-gray-200"
                >
                  <strong className="text-cyan-400">{t.name}</strong> —{" "}
                  <span className="text-gray-400">{t.description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

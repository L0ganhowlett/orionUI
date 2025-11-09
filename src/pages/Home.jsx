// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { initSSE, addSSEListener } from "../api/sseListener";
import { ChatAPI } from "../api/apiClient";
import ChatConsole from "../components/ChatConsole";
import AgentGraph3D from "../components/AgentGraph";

export default function Home() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [orchestratorWait, setOrchestratorWait] = useState(null); // 🧠 Modal state for orchestration pause

  // --- Initialize SSE Stream ---
  useEffect(() => {
    initSSE();
    const unsubscribe = addSSEListener((event) => {
      console.log("📡 SSE Event Received:", event);
      setMessages((prev) => [...prev, event]);
      setLiveFeed((prev) => [...prev.slice(-50), event]);

      // 🧠 Handle orchestrator pause events
      if (event.type === "orchestrator_wait") {
        setOrchestratorWait(event);
      }

      // 🪄 Append reasoning and status updates to chat console
      if (
        event.type === "reasoning" ||
        event.type === "agent_status_update" ||
        event.type === "chat_result"
      ) {
        setMessages((prev) => [...prev, event]);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Send user chat to orchestrator ---
  const handleSend = async () => {
    if (!chatInput.trim()) return;

    const userEvent = {
      timestamp: new Date().toISOString(),
      type: "user_input",
      message: chatInput,
      agentId: "user",
    };

    setMessages((prev) => [...prev, userEvent]);
    setChatInput("");

    try {
      const sessionId = `session-${Date.now()}`;
      await ChatAPI.sendMessage(sessionId, chatInput);
    } catch (err) {
      console.error("❌ Chat send failed:", err);
    }
  };

  // --- Handle user decision (retry / skip / abort / provide_input) ---
  const handleUserDecision = async (choice, input = null) => {
    if (!orchestratorWait) return;
    try {
      await ChatAPI.userDecision(orchestratorWait.sessionId, choice, input);
      console.log("✅ User decision sent:", choice, input);
      setOrchestratorWait(null); // Close modal
    } catch (err) {
      console.error("❌ Failed to send user decision:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="p-4 bg-cyan-700 text-white font-semibold text-lg shadow">
        🤖 Agentic AI Orchestration Console
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat console */}
        <div className="w-1/2 flex flex-col border-r border-gray-800">
          <div className="flex-1 overflow-y-auto">
            <ChatConsole messages={messages} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900 flex items-center gap-2">
            <input
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-cyan-500 outline-none"
              placeholder="Type a message to orchestrator..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500 transition"
            >
              Send
            </button>
          </div>
        </div>

        {/* Right: Live Agent Graph */}
        <div className="w-1/2 bg-gray-900 p-4 overflow-hidden border-l border-gray-800">
          <h2 className="text-md font-semibold mb-2 text-cyan-300">
            🕸 Agent Communication Graph
          </h2>
          <AgentGraph3D liveFeed={liveFeed} />
        </div>
      </div>

      {/* ⚠️ Orchestrator Wait Modal */}
      {orchestratorWait && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-md text-center space-y-4 shadow-lg">
            <h3 className="text-xl font-semibold text-cyan-300">
              ⚠️ Orchestrator Paused
            </h3>
            <p className="text-gray-300 text-sm">
              <strong>{orchestratorWait.agentId}</strong> requires a decision.
            </p>
            <p className="text-gray-400 text-sm italic">
              {orchestratorWait.reason || orchestratorWait.message}
            </p>

            {/* 📝 Input field for 'provide_input' */}
            {orchestratorWait.options?.includes("provide_input") && (
              <input
                type="text"
                placeholder="Provide missing input..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-100 text-sm"
                value={orchestratorWait.input || ""}
                onChange={(e) =>
                  setOrchestratorWait({
                    ...orchestratorWait,
                    input: e.target.value,
                  })
                }
              />
            )}

            {/* Decision buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {(orchestratorWait.options || ["retry", "skip", "abort"]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() =>
                      handleUserDecision(opt, orchestratorWait.input || null)
                    }
                    className={`px-4 py-2 rounded-md font-medium capitalize ${
                      opt === "retry"
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : opt === "abort"
                        ? "bg-rose-600 hover:bg-rose-500"
                        : opt === "provide_input"
                        ? "bg-cyan-600 hover:bg-cyan-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white transition`}
                  >
                    {opt.replace("_", " ")}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

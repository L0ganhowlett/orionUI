import { useEffect, useState } from "react";
import { DashboardAPI, AgentAPI, ChatAPI } from "../api/apiClient";
import DashboardStats from "../components/DashboardStats";
import AgentGraph3D from "../components/AgentGraph";
import ChatConsole from "../components/ChatConsole";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [agentCount, setAgentCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [liveFeed, setLiveFeed] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  // 🧠 Fetch agent stats periodically
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const agents = await AgentAPI.list();
        setAgentCount(agents.data.agents?.length || 0);
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔴 Subscribe to SSE for live updates
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8080/messages/stream");
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setLiveFeed((prev) => [...prev.slice(-50), data]);
      setMessages((prev) => [...prev, data]);
    };
    return () => eventSource.close();
  }, []);

  // 💬 Send chat to orchestrator
  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = {
      timestamp: new Date().toISOString(),
      type: "user_input",
      message: chatInput,
      agentId: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    const sessionId = `session-${Date.now()}`;
    setChatInput("");

    try {
      await ChatAPI.sendMessage(sessionId, chatInput);
    } catch (err) {
      console.error("❌ Chat send failed:", err);
    }
  };

  // 🧠 Handle orchestrator wait options inline
  const handleUserDecision = async (sessionId, choice, input = null) => {
    try {
      await ChatAPI.userDecision(sessionId, choice, input);
      setMessages((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          type: "user_decision",
          agentId: "user",
          message:
            choice === "provide_input"
              ? `📝 Provided input: ${input}`
              : `✅ Selected option: ${choice}`,
        },
      ]);
    } catch (err) {
      console.error("❌ Failed to send user decision:", err);
    }
  };

  function OrchestratorWaitMessage({ msg, onDecision }) {
    const [inputValue, setInputValue] = useState("");
    const [inputMode, setInputMode] = useState(false); // 🆕 toggles input mode
    const options = msg.options || ["provide_input", "skip", "abort", "retry"];

    const handleClick = (opt) => {
      if (opt === "provide_input") {
        // 🧠 Enable input field instead of calling immediately
        setInputMode(true);
        return;
      }
      onDecision(msg.sessionId, opt, null);
    };

    const handleSubmitInput = () => {
      if (!inputValue.trim()) return;
      onDecision(msg.sessionId, "provide_input", inputValue.trim());
      setInputValue("");
      setInputMode(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-3 bg-gray-800/70 border border-gray-700 rounded-lg text-gray-200 space-y-2"
      >
        <div className="text-cyan-400 font-semibold">
          🧠 {msg.agentId || "orchestrator"} paused
        </div>
        <p className="text-sm text-gray-300 italic">
          {msg.reason || msg.message}
        </p>

        {/* 🧩 Show text input when provide_input is active */}
        {inputMode && (
          <div className="flex flex-col gap-2 mt-2">
            <input
              type="text"
              placeholder="Enter your input..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-sm text-gray-200 rounded px-3 py-1 focus:outline-none focus:ring focus:ring-cyan-500"
            />
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSubmitInput}
                className="px-3 py-1.5 text-xs rounded font-medium bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                Submit Input
              </button>
              <button
                onClick={() => setInputMode(false)}
                className="px-3 py-1.5 text-xs rounded font-medium bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 🧠 Show choice buttons only when not typing input */}
        {!inputMode && (
          <div className="flex flex-wrap gap-2 mt-2">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleClick(opt)}
                className={`px-3 py-1.5 text-xs rounded font-medium capitalize ${opt === "retry"
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
            ))}
          </div>
        )}
      </motion.div>
    );
  }



  return (
    <div className="space-y-8">
      {/* Top stats */}
      <DashboardStats
        agentCount={agentCount}
        sessionCount={sessionCount}
        messageCount={messages.length}
      />

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Agent Network Graph */}
        <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800">
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">
            3D Agent Network
          </h3>
          <AgentGraph3D liveFeed={liveFeed} />
        </div>

        {/* Right: Reasoning Feed + Chat */}
        <div className="bg-gray-900/40 rounded-xl p-4 border border-gray-800 flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto h-[600px]">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">
              🧠 Live Agent Reasoning / Chat
            </h3>
            <div className="space-y-2 text-sm font-mono">
              {messages.map((msg, i) => {
                if (msg.type === "orchestrator_wait") {
                  return (
                    <OrchestratorWaitMessage
                      key={i}
                      msg={msg}
                      onDecision={handleUserDecision}
                    />
                  );
                }

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded border ${msg.agentId === "user"
                      ? "bg-cyan-900/40 border-cyan-700 text-cyan-100"
                      : "bg-gray-800/60 border-gray-700 text-gray-200"
                      }`}
                  >
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.timestamp} —{" "}
                      <span className="text-cyan-400">{msg.agentId}</span>
                    </div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: msg.message || msg.phase || "",
                      }}
                    />
                  </motion.div>
                );
              })}

            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-700 pt-3">
            <div className="flex mt-3 gap-2">
              <input
                className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring focus:ring-cyan-500 outline-none"
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
        </div>
      </div>
    </div>
  );
}

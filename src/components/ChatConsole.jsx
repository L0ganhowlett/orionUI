// src/components/ChatConsole.jsx
import React, { useEffect, useRef } from "react";

export default function ChatConsole({ messages = [] }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const safeToString = (val) => {
    if (val == null) return "";
    if (typeof val === "string") return val;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  return (
    <div className="bg-gray-900/60 rounded-lg p-4 h-full flex flex-col space-y-2 overflow-y-auto">
      {messages.length === 0 ? (
        <p className="text-gray-500 italic">No messages yet — start chatting!</p>
      ) : (
        messages.map((msg, i) => {
          const isObj = typeof msg === "object" && msg !== null;
          const agentId = isObj ? msg.agentId || "system" : "system";
          const content =
            isObj && (msg.message || msg.phase)
              ? msg.message || msg.phase
              : safeToString(msg);

          const isUser = agentId === "user" || msg.type === "user_input";
          const isAgent =
            agentId && agentId !== "user" && agentId !== "system";
          const colorClass = isUser
            ? "bg-cyan-600/20 text-cyan-200 self-end"
            : isAgent
            ? "bg-emerald-600/20 text-emerald-200"
            : "bg-gray-800/70 text-gray-200";

          return (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[80%] ${colorClass}`}
              style={{
                alignSelf: isUser ? "flex-end" : "flex-start",
                border: "1px solid rgba(255,255,255,0.05)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div className="text-xs text-gray-400 mb-1">
                {isUser
                  ? "👤 You"
                  : isAgent
                  ? `🤖 ${agentId}`
                  : "📡 System"}
              </div>
              <div className="text-sm">{safeToString(content)}</div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}

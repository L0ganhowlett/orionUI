// src/api/apiClient.jsx
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 ---- AGENT ENDPOINTS ----
export const AgentAPI = {
  list: () => api.get("/agents"),
  create: (type, id) => api.post("/agents", { type, id }),
  spawnOrchestrator: () => api.post("/agents/spawn-orchestrator"),
};


export const ChatAPI = {
  // 💬 Send message to orchestrator
  async sendMessage(sessionId, message) {
    const envelope = {
      senderId: "user",
      recipientId: "orchestrator-agent",
      type: "chat",
      payload: {
        sessionId,
        message,
      },
    };
    console.log("📤 Sending message to kernel:", envelope);
    return axios.post(`${API_BASE_URL}/messages`, envelope);
  },

  // 🧠 Send user decision (for orchestrator_wait)
  async userDecision(sessionId, choice, input = null) {
    const body = {
      sessionId,
      choice,
    };
    if (input) body.input = input;
    console.log("📤 Sending user decision:", body);
    return axios.post(`${API_BASE_URL}/messages/user-decision`, body);
  },
};
// 🧰 ---- TOOL ENDPOINTS ----
export const ToolAPI = {
  list: (agentEndpoint) => axios.get(`${agentEndpoint}/tools/list`),
  register: (agentEndpoint, tool) =>
    axios.post(`${agentEndpoint}/tools/register`, tool),
  execute: (agentEndpoint, tool, input) =>
    axios.post(`${agentEndpoint}/tools/execute`, { tool, input }),
};
// 📊 ---- SESSION & EVENTS ----
export const SessionAPI = {
  getAudit: (sessionId) => api.get(`/chat/${sessionId}/audit`),
  getReasoning: (sessionId) => api.get(`/chat/${sessionId}/history`),
};

export const DashboardAPI = {
  getAgents: () => api.get("/agents"),
};




export default api;

// src/api/sseListener.js
let eventSource = null;
let listeners = new Set();

export function initSSE(baseUrl = "http://localhost:8080/messages/stream") {
  if (eventSource) return eventSource; // prevent duplicates

  eventSource = new EventSource(baseUrl, { withCredentials: false });

  console.log("🔌 SSE Connected:", baseUrl);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📡 SSE Event:", data);

      listeners.forEach((cb) => cb(data)); // broadcast to subscribers
    } catch (e) {
      console.error("SSE parse error:", e, event.data);
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ SSE Error:", err);
    eventSource.close();
    eventSource = null;
    setTimeout(() => initSSE(baseUrl), 3000); // auto-reconnect
  };

  return eventSource;
}

export function addSSEListener(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback); // cleanup
}

export function closeSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    console.log("🔌 SSE connection closed.");
  }
}

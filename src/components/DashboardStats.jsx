import { Cpu, Network, MessageSquare } from "lucide-react";

export default function DashboardStats({ agentCount = 0, sessionCount = 0, messageCount = 0 }) {
  const stats = [
    { label: "Active Agents", value: agentCount, icon: <Cpu /> },
    { label: "Sessions", value: sessionCount, icon: <Network /> },
    { label: "Messages Exchanged", value: messageCount, icon: <MessageSquare /> },
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="card flex items-center space-x-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
          <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-300">
            {s.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{s.label}</h3>
            <p className="text-2xl font-bold text-cyan-400">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, MessageSquare, Users, Home } from "lucide-react";

export default function NavBar() {
 const links = [
  { to: "/", label: "Dashboard", icon: <Cpu size={18} /> },
  { to: "/agents", label: "Agents", icon: <Users size={18} /> },
];


  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 px-6 py-3 shadow-lg">
      {/* Left: Brand */}
      <div className="flex items-center space-x-2">
        <Cpu className="text-cyan-400" size={20} />
        <span className="text-cyan-300 font-semibold tracking-wide">
          Agentic Protocol
        </span>
      </div>

      {/* Right: Nav links */}
      <div className="flex space-x-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-cyan-600/20 text-cyan-300 border border-cyan-600/40"
                  : "text-gray-400 hover:text-cyan-300 hover:bg-gray-800/60"
              }`
            }
          >
            {link.icon}
            {link.label}
            {({ isActive }) =>
              isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 rounded-full"
                />
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import React, { useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { AgentAPI } from "../api/apiClient";
import * as THREE from "three";

function AgentNode({ id, position, color }) {
  const ref = React.useRef();
  useFrame(() => { ref.current.rotation.y += 0.005; });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
      <Html distanceFactor={10}>
        <div className="text-xs text-cyan-300 bg-gray-900/70 px-2 py-0.5 rounded border border-gray-700">
          {id}
        </div>
      </Html>
    </group>
  );
}

function Scene({ agents, links }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} />
      {agents.map((a) => (
        <AgentNode key={a.agentId} id={a.agentId} position={a.position} color={a.color} />
      ))}
      {links.map((link, i) => (
        <Line key={i} points={[link.from.position, link.to.position]} color="#22d3ee" lineWidth={2} />
      ))}
    </>
  );
}

export default function AgentGraph3D({ liveFeed }) {
  const [agents, setAgents] = useState([]);
  const [links, setLinks] = useState([]);

  // Fetch agents
  useEffect(() => {
    AgentAPI.list().then((res) => {
      const data = res.data.agents || [];
      const positioned = data.map((a, i) => ({
        ...a,
        position: new THREE.Vector3(
          Math.cos(i * 2) * 5,
          Math.random() * 2 - 1,
          Math.sin(i * 2) * 5
        ),
        color: a.agentId === "orchestrator-agent" ? "#0ea5e9" : "#10b981",
      }));
      setAgents(positioned);
    });
  }, []);

  // Listen to live delegations
  useEffect(() => {
    if (!liveFeed.length) return;
    const e = liveFeed[liveFeed.length - 1];
    if (e.type === "delegation" && e.targetAgent) {
      setLinks((prev) => {
        const from = agents.find((a) => a.agentId === e.agentId);
        const to = agents.find((a) => a.agentId === e.targetAgent);
        return from && to ? [...prev, { from, to }] : prev;
      });
    }
  }, [liveFeed]);

  return (
    <div className="h-[500px] bg-black rounded-lg border border-gray-800">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        <Scene agents={agents} links={links} />
      </Canvas>
    </div>
  );
}

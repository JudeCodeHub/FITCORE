"use client";

import { useState } from "react";
import {
  QrCode,
  CalendarCheck,
  CreditCard,
  BarChart3,
  UserCheck,
  Wrench,
  Dumbbell,
} from "lucide-react";
import { cn } from "cn";

interface SatelliteNode {
  id: string;
  label: string;
  icon: typeof QrCode;
  left: string;
  top: string;
  spokeX: number;
  spokeY: number;
}

// Pre-calculated constant coordinates to guarantee 100% identical SSR & client hydration
const NODES: SatelliteNode[] = [
  {
    id: "qr",
    label: "QR Check-In",
    icon: QrCode,
    left: "50%",
    top: "13%",
    spokeX: 200,
    spokeY: 52,
  },
  {
    id: "booking",
    label: "Class Booking",
    icon: CalendarCheck,
    left: "82.04%",
    top: "31.5%",
    spokeX: 328.17,
    spokeY: 126,
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: CreditCard,
    left: "82.04%",
    top: "68.5%",
    spokeX: 328.17,
    spokeY: 274,
  },
  {
    id: "analytics",
    label: "Live Analytics",
    icon: BarChart3,
    left: "50%",
    top: "87%",
    spokeX: 200,
    spokeY: 348,
  },
  {
    id: "trainer",
    label: "Trainer Portal",
    icon: UserCheck,
    left: "17.96%",
    top: "68.5%",
    spokeX: 71.83,
    spokeY: 274,
  },
  {
    id: "equipment",
    label: "Equipment Care",
    icon: Wrench,
    left: "17.96%",
    top: "31.5%",
    spokeX: 71.83,
    spokeY: 126,
  },
];

export function EcosystemOrbital() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="relative mx-auto flex h-[380px] w-full max-w-[440px] items-center justify-center sm:h-[440px] sm:max-w-[480px]">
      {/* Background SVG Orbits & Spokes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle radial background glow */}
        <defs>
          <radialGradient
            id="hubGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
            <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#hubGlow)" />

        {/* Outer orbital track with subtle dashes */}
        <circle
          cx="200"
          cy="200"
          r="182"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Primary node orbit ring */}
        <circle
          cx="200"
          cy="200"
          r="148"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="1"
        />

        {/* Inner hub ring */}
        <circle
          cx="200"
          cy="200"
          r="86"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="1"
        />

        {/* Radial Spokes from Center to Nodes */}
        {NODES.map((node) => {
          const isActive = activeNode === node.id;

          return (
            <line
              key={`spoke-${node.id}`}
              x1="200"
              y1="200"
              x2={node.spokeX}
              y2={node.spokeY}
              stroke={
                isActive
                  ? "var(--primary)"
                  : "rgba(255, 255, 255, 0.08)"
              }
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={isActive ? "none" : "3 3"}
              className="transition-colors duration-300"
            />
          );
        })}

        {/* Faint ambient orbit sparkle dots */}
        <circle cx="200" cy="18" r="1.5" fill="rgba(255, 255, 255, 0.3)" />
        <circle cx="340" cy="90" r="1.5" fill="rgba(255, 255, 255, 0.2)" />
        <circle cx="375" cy="200" r="1.5" fill="rgba(255, 255, 255, 0.3)" />
        <circle cx="320" cy="320" r="1.5" fill="rgba(255, 255, 255, 0.2)" />
        <circle cx="200" cy="382" r="1.5" fill="rgba(255, 255, 255, 0.3)" />
        <circle cx="75" cy="315" r="1.5" fill="rgba(255, 255, 255, 0.2)" />
        <circle cx="25" cy="200" r="1.5" fill="rgba(255, 255, 255, 0.3)" />
        <circle cx="70" cy="85" r="1.5" fill="rgba(255, 255, 255, 0.2)" />
      </svg>

      {/* Center Core Hub Card */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="group relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/15 bg-zinc-900/90 shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-300 hover:border-primary/50 sm:h-28 sm:w-28">
          <div className="absolute inset-0 rounded-2xl bg-primary/5 transition-opacity group-hover:opacity-100" />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105 sm:h-14 sm:w-14">
            <Dumbbell className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>
        </div>
        <span className="mt-2.5 text-[10px] font-semibold tracking-widest text-white/50 uppercase">
          FitCore Hub
        </span>
      </div>

      {/* Orbiting Satellite Nodes */}
      {NODES.map((node) => {
        const Icon = node.icon;
        const isActive = activeNode === node.id;

        return (
          <div
            key={node.id}
            className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: node.left, top: node.top }}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
          >
            <div
              className={cn(
                "group flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border bg-zinc-900/90 shadow-xl backdrop-blur-md transition-all duration-300 sm:h-14 sm:w-14",
                isActive
                  ? "scale-110 border-primary bg-zinc-800 text-primary shadow-primary/20"
                  : "border-white/10 text-white/80 hover:scale-105 hover:border-white/30 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
            </div>

            <span
              className={cn(
                "mt-1.5 text-[10px] font-medium tracking-tight transition-colors duration-200 sm:text-[11px]",
                isActive ? "text-primary font-semibold" : "text-white/60",
              )}
            >
              {node.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

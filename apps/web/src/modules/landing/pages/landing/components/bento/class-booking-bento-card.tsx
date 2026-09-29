"use client";

import { useState } from "react";
import Image from "next/image";
import { Zap, ShieldCheck, Check, Clock, Flame } from "lucide-react";
import { featuresStyles as styles } from "../features-section.styles";

const INITIAL_SPOTS = [
  { id: 1, label: "MK" },
  { id: 2, label: "JD" },
  { id: 3, label: "SL" },
  { id: 4, label: "TC" },
  { id: 5, label: "RL" },
  { id: 6, label: "EN" },
  { id: 7, label: "KP" },
  { id: 8, label: "BA" },
  { id: 9, label: "DW" },
  { id: 10, label: "CH" },
  { id: 11, label: "JM" },
  { id: 12, label: "YOU" },
];

export function ClassBookingBentoCard() {
  const [isBooked, setIsBooked] = useState(false);

  return (
    <div className={styles.rowGrid}>
      {/* Left Column: Borderless Image Blended Seamlessly into Background (lg:order-1) */}
      <div className={styles.imageCol("lg:order-1")}>
        <Image
          src="/images/features/hiit-studio.jpg"
          alt="FitCore HIIT Workout Studio"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={styles.imageElement}
          unoptimized
        />

        {/* Multi-Directional Gradient Fades melting directly into #000000 background */}
        <div className={styles.edgeFadeTop} />
        <div className={styles.edgeFadeBottom} />
        <div className={styles.edgeFadeLeft} />
        <div className={styles.edgeFadeRight} />
        <div className={styles.radialVignette} />
      </div>

      {/* Right Column: Text & Open Seat Grid (lg:order-2) */}
      <div className={styles.textCol("lg:order-2")}>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              <Zap className="h-3.5 w-3.5" />
              02 / STUDIO BOOKINGS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
              HIGH INTENSITY
            </span>
          </div>

          <h3 className="mt-5 font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Live Studio Seat Radar
          </h3>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-lg leading-relaxed">
            Reserve spots in real time with row-level transaction locks. Zero duplicate seat allocations during rush drops.
          </p>
        </div>

        {/* Open Class Booking Matrix (No enclosing box) */}
        <div className="mt-8 space-y-5 max-w-xl">
          {/* Header & Status */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="font-heading text-base font-bold text-white">Morning HIIT & Burn</p>
              <p className="text-xs text-white/50">07:00 AM (45m) · Coach Aria · Studio A</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                isBooked
                  ? "border border-red-500/40 bg-red-500/15 text-red-400"
                  : "border border-primary/40 bg-primary/15 text-primary"
              }`}
            >
              {isBooked ? "12 / 12 FULL" : "11 / 12 Booked"}
            </span>
          </div>

          {/* 12-Spot Matrix */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/50 mb-2.5">
              <span>Studio Floor Layout (Select Spot 12)</span>
              <span className="text-primary font-mono text-[11px]">Real-Time Sync</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {INITIAL_SPOTS.map((spot) => {
                const isUserSpot = spot.id === 12;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => isUserSpot && setIsBooked(!isBooked)}
                    className={`flex h-11 items-center justify-center rounded-lg border text-xs font-bold transition-all duration-300 ${
                      isUserSpot && isBooked
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105 cursor-pointer"
                        : isUserSpot && !isBooked
                        ? "border-dashed border-primary/60 bg-primary/10 text-primary animate-pulse hover:bg-primary/20 cursor-pointer"
                        : "border-white/10 bg-white/[0.03] text-white/70 cursor-default"
                    }`}
                  >
                    {isUserSpot ? (
                      isBooked ? (
                        <span className="inline-flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> YOU
                        </span>
                      ) : (
                        "SPOT 12"
                      )
                    ) : (
                      spot.label
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Row-level database locks prevent race conditions.</span>
            </div>

            <button
              type="button"
              onClick={() => setIsBooked(!isBooked)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                isBooked
                  ? "border border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
              }`}
            >
              {isBooked ? "Release Spot" : "Claim Spot #12"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

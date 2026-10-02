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
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-amber-800 uppercase">
              <Zap className="h-3.5 w-3.5" />
              02 / STUDIO BOOKINGS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
              HIGH INTENSITY
            </span>
          </div>

          <h3 className="mt-5 font-heading text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.1]">
            Live Studio Seat Radar
          </h3>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
            Reserve spots in real time with row-level transaction locks. Zero duplicate seat allocations during rush drops.
          </p>
        </div>

        {/* Open Class Booking Matrix */}
        <div className="mt-8 space-y-5 max-w-xl">
          {/* Header & Status */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="font-heading text-base font-bold text-slate-900">Morning HIIT & Burn</p>
              <p className="text-xs text-slate-500">07:00 AM (45m) · Coach Aria · Studio A</p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                isBooked
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {isBooked ? "12 / 12 FULL" : "11 / 12 Booked"}
            </span>
          </div>

          {/* 12-Spot Matrix */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
              <span>Studio Floor Layout (Select Spot 12)</span>
              <span className="text-emerald-600 font-mono text-[11px] font-semibold">Real-Time Sync</span>
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
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105 cursor-pointer"
                        : isUserSpot && !isBooked
                        ? "border-dashed border-emerald-500 bg-emerald-50 text-emerald-700 animate-pulse hover:bg-emerald-100 cursor-pointer"
                        : "border-slate-200 bg-white text-slate-700 shadow-xs cursor-default"
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
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Row-level database locks prevent race conditions.</span>
            </div>

            <button
              type="button"
              onClick={() => setIsBooked(!isBooked)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                isBooked
                  ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:brightness-110 shadow-sm shadow-emerald-500/20"
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

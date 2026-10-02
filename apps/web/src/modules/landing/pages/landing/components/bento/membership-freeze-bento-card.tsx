"use client";

import { useState } from "react";
import Image from "next/image";
import { CreditCard, Snowflake, Check, Download } from "lucide-react";
import { featuresStyles as styles } from "../features-section.styles";

export function MembershipFreezeBentoCard() {
  const [isFrozen, setIsFrozen] = useState(false);

  return (
    <div className={styles.rowGrid}>
      {/* Left Column: Borderless Image Blended Seamlessly into Background (lg:order-1) */}
      <div className={styles.imageCol("lg:order-1")}>
        <Image
          src="/images/features/vacation-freeze.jpg"
          alt="FitCore Athlete Vacation Freeze"
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

      {/* Right Column: Text & Open Freeze Simulator (lg:order-2) */}
      <div className={styles.textCol("lg:order-2")}>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-slate-800 uppercase">
              <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
              04 / VACATION HOLD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              <Snowflake className="h-3 w-3 text-cyan-600" />
              ZERO DRAMA
            </span>
          </div>

          <h3 className="mt-5 font-heading text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.1]">
            1-Tap Vacation Freeze
          </h3>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
            Pause billing anytime directly in the mobile app. $0 charged while away, auto-resumes on return.
          </p>
        </div>

        {/* Open Freeze Controls */}
        <div className="mt-8 space-y-4 max-w-xl">
          {/* FitCore Digital Metal Card Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 shadow-xl text-white">
            {isFrozen && (
              <div className="pointer-events-none absolute inset-0 bg-cyan-500/10 backdrop-blur-[2px] border border-cyan-400/40 z-10 transition-all duration-300" />
            )}

            <div className="relative z-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-black font-extrabold text-[10px]">
                  FC
                </div>
                <span className="font-heading text-xs font-bold tracking-widest text-white">FITCORE ELITE</span>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  isFrozen
                    ? "border border-cyan-400/50 bg-cyan-400/20 text-cyan-200"
                    : "border border-emerald-400/40 bg-emerald-400/20 text-emerald-300"
                }`}
              >
                {isFrozen ? "❄️ Vacation Hold" : "● Active All-Access"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-white/70">
              <span>•••• •••• •••• 8492</span>
              <span className="text-xs">Alex Rivera</span>
            </div>
          </div>

          {/* Toggle Switch Controller */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <p className="font-heading text-sm font-bold text-slate-900">Vacation Freeze Switch</p>
              <p className="text-xs text-slate-500">
                {isFrozen ? "Membership paused until return" : "Pause payments with 1 tap"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isFrozen ? "bg-cyan-600 shadow-md shadow-cyan-600/20" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isFrozen ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Status Message */}
          <div
            className={`rounded-lg border p-3.5 text-xs transition-all duration-300 shadow-xs ${
              isFrozen
                ? "border-cyan-200 bg-cyan-50 text-cyan-800"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {isFrozen ? (
              <p className="font-medium text-cyan-900 flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5 text-cyan-600 shrink-0" />
                14 Vacation Days remaining · Auto-resumes Nov 15 ($0 charged).
              </p>
            ) : (
              <p className="font-medium text-slate-900 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Active Plan: $79/mo · Next renewal Nov 01.
              </p>
            )}
          </div>

          {/* Micro-Note Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Zero phone calls required · Instant automated pause</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              <Download className="h-3 w-3 text-emerald-600" />
              <span>Invoice PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

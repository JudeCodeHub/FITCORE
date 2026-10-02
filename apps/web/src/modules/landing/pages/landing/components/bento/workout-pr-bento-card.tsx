"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, CheckCircle2, Dumbbell, Award } from "lucide-react";
import { featuresStyles as styles } from "../features-section.styles";

export function WorkoutPrBentoCard() {
  const [set1Done, setSet1Done] = useState(true);
  const [set2Done, setSet2Done] = useState(true);
  const [set3Done, setSet3Done] = useState(false);

  return (
    <div className={styles.rowGrid}>
      {/* Left Column: Text & Open Workout PR Logger (lg:order-1) */}
      <div className={styles.textCol("lg:order-1")}>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-amber-800 uppercase">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              03 / PR TRACKER
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <Award className="h-3.5 w-3.5 text-amber-600" />
              CLUB MILESTONE
            </span>
          </div>

          <h3 className="mt-5 font-heading text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.1]">
            Deadlift PR Tracker
          </h3>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
            In-gym workout logging with real-time personal records and automatic club celebration milestones.
          </p>
        </div>

        {/* Open Workout Sets & Celebration */}
        <div className="mt-8 space-y-4 max-w-xl">
          {/* Exercise Details */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                <Dumbbell className="h-4 w-4" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-slate-900">Barbell Deadlift</p>
                <p className="text-xs text-slate-500">Target: 315 lbs · Heavy Working Sets</p>
              </div>
            </div>

            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-700 shadow-xs">
              RPE 8.5
            </span>
          </div>

          {/* Rep Sets List */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSet1Done(!set1Done)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="font-mono text-slate-800">Set 1: 225 lbs × 8 reps</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${set1Done ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {set1Done ? "Warm-up Done" : "Mark"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSet2Done(!set2Done)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors shadow-xs"
            >
              <span className="font-mono text-slate-800">Set 2: 275 lbs × 5 reps</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${set2Done ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {set2Done ? "Working Done" : "Mark"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSet3Done(!set3Done)}
              className={`w-full flex items-center justify-between rounded-lg border p-3 text-xs cursor-pointer transition-all duration-300 shadow-xs ${
                set3Done
                  ? "border-amber-400 bg-amber-50 shadow-sm"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">Set 3: 315 lbs × 3 reps</span>
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  PR ATTEMPT
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {set3Done ? "PR SMASHED! 🏆" : "Tap to Log"}
              </span>
            </button>
          </div>

          {/* Celebration Pill / Milestone Result */}
          <div
            className={`rounded-xl border p-3.5 transition-all duration-300 shadow-sm ${
              set3Done
                ? "border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 text-slate-900"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-sm font-bold text-slate-900">
                  {set3Done ? "🏆 315 lbs All-Time Record!" : "315 lbs Milestone Target"}
                </p>
                <p className="text-xs text-slate-600">
                  {set3Done ? "+20 lbs milestone · Top 5% of club athletes" : "Tap Set 3 to simulate logging this milestone"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSet3Done(!set3Done)}
                className="rounded-md border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200 cursor-pointer shadow-xs"
              >
                {set3Done ? "Reset" : "Test PR"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Borderless Image Blended Seamlessly into Background (lg:order-2) */}
      <div className={styles.imageCol("lg:order-2")}>
        <Image
          src="/images/features/deadlift-pr.jpg"
          alt="FitCore Athlete Deadlift PR"
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
    </div>
  );
}

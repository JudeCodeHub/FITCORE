"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Users, QrCode, CheckCircle2, ScanLine, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { featuresStyles as styles } from "../features-section.styles";

export function FloorPassBentoCard() {
  const [mounted, setMounted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [occupancy, setOccupancy] = useState(142);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulateScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsUnlocked(true);
      setOccupancy((prev) => (prev === 142 ? 143 : 142));
      setTimeout(() => {
        setIsUnlocked(false);
      }, 3500);
    }, 500);
  };

  return (
    <div className={styles.rowGrid}>
      {/* Left Column: Text & Open Turnstile Controls (lg:order-1) */}
      <div className={styles.textCol("lg:order-1")}>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-slate-800 uppercase">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              01 / TURNSTILE PASS
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE RADAR
            </span>
          </div>

          <h3 className="mt-5 font-heading text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 leading-[1.1]">
            Sub-Second QR Entry
          </h3>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed">
            142 Athletes currently training. Optical barcode turnstile unlock in under 200ms with zero wait times.
          </p>
        </div>

        {/* Open Live Capacity & Gate Controls */}
        <div className="mt-8 space-y-6 max-w-xl">
          {/* Capacity Header & Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-3xl font-bold text-slate-950">{occupancy}</span>
                <span className="text-xs text-slate-500">/ 180 Max Floor Capacity</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 shadow-xs">Weights: 84</span>
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 shadow-xs">Cardio: 38</span>
              </div>
            </div>

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-emerald-600" style={{ width: "47%" }} />
              <div className="h-full bg-emerald-400" style={{ width: "21%" }} />
              <div className="h-full bg-teal-400" style={{ width: "11%" }} />
            </div>
          </div>

          {/* Interactive Gate Trigger Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Small QR Thumbnail */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 pr-4 shrink-0 shadow-sm">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-1.5 shadow-xs flex items-center justify-center h-14 w-14 shrink-0">
                {mounted ? (
                  <QRCodeSVG
                    value="FITCORE-ATHLETE-84920-ENTRY"
                    size={48}
                    level="M"
                    bgColor="#f8fafc"
                    fgColor="#000000"
                  />
                ) : (
                  <div className="h-12 w-12 bg-slate-200 animate-pulse rounded" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Alex Rivera</p>
                <p className="text-[10px] font-mono text-slate-500">FC-84920 · All Access</p>
              </div>
            </div>

            {/* Live Gate Status Pill */}
            <div
              className={`flex-1 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all duration-300 shadow-sm ${
                isUnlocked
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isScanning
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isUnlocked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                ) : isScanning ? (
                  <ScanLine className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
                ) : (
                  <QrCode className="h-4 w-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {isUnlocked
                      ? "Gate #02 Unlocked (0.18s)"
                      : isScanning
                      ? "Scanning optical barcode..."
                      : "Gate #02 Ready"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isUnlocked ? "Welcome Alex! Have a great workout." : "Apple & Google Wallet Ready"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 py-2 px-3.5 text-xs font-bold text-black shadow-sm shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>{isScanning ? "..." : isUnlocked ? "Scan Again" : "Tap Scan"}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Borderless Image Blended Seamlessly into Background (lg:order-2) */}
      <div className={styles.imageCol("lg:order-2")}>
        <Image
          src="/images/features/turnstile-gate.jpg"
          alt="FitCore Turnstile Gate Entry with QR Pass"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className={styles.imageElement}
          priority
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

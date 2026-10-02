import type { ReactNode } from "react";
import Link from "next/link";
import { Dumbbell } from "lucide-react";

export function AuthSplitLayout({
  eyebrow,
  headline,
  children,
}: {
  eyebrow: string;
  headline: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full bg-[#fafafc] text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* LEFT SHOWCASE COLUMN (Desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-200/80 bg-[#f4f6f8] p-12 lg:flex xl:p-16">
        {/* Ambient Soft Emerald Glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] bg-[size:40px_40px] opacity-70"
          aria-hidden="true"
        />

        {/* Top: Brand Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-md shadow-emerald-500/20">
              <Dumbbell className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-slate-950">
              FitCore
            </span>
          </Link>
        </div>

        {/* Center: Eyebrow + Headline (Clean & focused) */}
        <div className="relative z-10 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            {eyebrow}
          </p>
          <h1 className="max-w-md font-heading text-3xl font-bold leading-tight tracking-tight text-slate-950 lg:text-4xl">
            {headline}
          </h1>
        </div>

        {/* Bottom: Clean minimalist note */}
        <div className="relative z-10">
          <p className="text-xs text-slate-500">
            Gym management, end to end.
          </p>
        </div>
      </div>

      {/* RIGHT FORM CONTAINER */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        {/* Subtle glow */}
        <div
          className="pointer-events-none absolute h-[400px] w-[400px] rounded-full bg-emerald-500/[0.04] blur-[120px]"
          aria-hidden="true"
        />

        {/* Mobile Header */}
        <div className="mb-8 flex w-full max-w-sm items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-black shadow-md shadow-emerald-500/20">
              <Dumbbell className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-slate-950">FitCore</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-sm animate-in fade-in duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}




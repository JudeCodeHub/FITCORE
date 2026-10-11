"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, MailCheck, ShieldCheck } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { loginStyles as styles } from "@/modules/auth/pages/login/login.styles";
import { authService } from "@/modules/auth/services/auth.service";

type VerificationState = "loading" | "success" | "error";

export function VerifyEmailPage() {
  const started = useRef(false);
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Checking your verification link…");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    url.searchParams.delete("token");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    if (!token) {
      queueMicrotask(() => {
        setState("error");
        setMessage("This verification link is missing its token.");
      });
      return;
    }
    void authService.verifyEmail(token).then(
      () => {
        setState("success");
        setMessage("Your email address is confirmed. You can now sign in to FitCore.");
      },
      () => {
        setState("error");
        setMessage("This link is invalid or has expired. Request a new link from the login page.");
      },
    );
  }, []);

  return (
    <AuthSplitLayout eyebrow="Account security" headline="One quick check. Full access.">
      <div aria-live="polite">
        <div className={styles.header}>
          <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border ${state === "error" ? "border-red-100 bg-red-50 text-red-600" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            {state === "loading" ? <MailCheck className="h-5 w-5" aria-hidden="true" /> : state === "success" ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : <CircleAlert className="h-5 w-5" aria-hidden="true" />}
          </div>
          <h1 className={styles.title}>
            {state === "loading" ? "Verifying your email" : state === "success" ? "Email verified" : "Link unavailable"}
          </h1>
          <p className={styles.subtitle}>
            {state === "loading"
              ? "Hold on while we confirm your email address. This only takes a moment."
              : state === "success"
                ? "Your account is ready whenever you are."
                : "We couldn’t confirm this link, but you can request another one."}
          </p>
        </div>

        {state === "loading" ? (
          <div role="status" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" aria-hidden="true" />
            {message}
          </div>
        ) : state === "success" ? (
          <div role="status" className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              {message}
            </div>
            <Link href="/login" className={styles.submitBtn}>
              <span>Continue to log in</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">{message}</p>
            <Link href="/login" className={styles.submitBtn}>
              <span>Go to log in</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="text-center text-xs leading-relaxed text-slate-500">After entering your details, choose “Send a new verification link”.</p>
          </div>
        )}

        {state !== "loading" && (
          <p className={styles.footer}>
            <Link href="/" className={`inline-flex items-center gap-2 ${styles.footerLink}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to home
            </Link>
          </p>
        )}
      </div>
    </AuthSplitLayout>
  );
}

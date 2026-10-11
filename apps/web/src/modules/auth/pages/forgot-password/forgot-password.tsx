"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CircleCheck, Mail } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { loginStyles as styles } from "@/modules/auth/pages/login/login.styles";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiError } from "@/shared/api-client/http";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not send the request. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthSplitLayout eyebrow="Account recovery" headline="A fresh start is one link away.">
      <div className={styles.header}>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
          {sent ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
        </div>
        <h1 className={styles.title}>{sent ? "Check your inbox" : "Forgot your password?"}</h1>
        <p className={styles.subtitle}>
          {sent
            ? "If an account exists for this email, we’ve sent a password reset link."
            : "Enter your email and we’ll send you a link to reset your password."}
        </p>
      </div>

      {sent ? (
        <div role="status" className="space-y-5">
          <div className="rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
            Check your local mail inbox for the reset link. The link may take a moment to arrive.
          </div>
          <button
            type="button"
            onClick={() => { setSent(false); setError(null); }}
            className="text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800 hover:underline"
          >
            Try another email address
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="recovery-email" className={styles.label}>Email address</label>
            <div className={styles.inputWrap}>
              <Mail className={styles.inputIcon} aria-hidden="true" />
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={styles.input}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}
          <button type="submit" disabled={busy} className={styles.submitBtn}>
            <span>{busy ? "Sending link…" : "Send reset link"}</span>
            {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>
      )}

      <p className={styles.footer}>
        <Link href="/login" className={`inline-flex items-center gap-2 ${styles.footerLink}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

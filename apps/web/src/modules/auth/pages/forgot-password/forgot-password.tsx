"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
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
    <AuthSplitLayout eyebrow="Account recovery" headline="Reset your password.">
      <div className="space-y-5">
        <h1 className="font-heading text-2xl font-bold text-slate-950">Forgot password?</h1>
        {sent ? (
          <p role="status" className="text-sm text-slate-600">
            If this email is registered, a reset link has been created. In local development, find it in the API console.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="recovery-email" className="block text-sm font-medium text-slate-700">Email address</label>
            <input id="recovery-email" type="email" autoComplete="email" required value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <Link href="/login" className="inline-block text-sm font-semibold text-emerald-700 hover:underline">Back to login</Link>
      </div>
    </AuthSplitLayout>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";

export function ResetPasswordPage() {
  const { logout } = useAuth();
  const loaded = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const url = new URL(window.location.href);
    const value = url.searchParams.get("token");
    url.searchParams.delete("token");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    queueMicrotask(() => {
      setToken(value);
      if (!value) setError("This reset link is missing its token.");
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await authService.resetPassword(token, password);
      await logout();
      setToken(null);
      setDone(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not reset your password. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthSplitLayout eyebrow="Account recovery" headline="Choose a new password.">
      <div className="space-y-5">
        <h1 className="font-heading text-2xl font-bold text-slate-950">Reset password</h1>
        {done ? (
          <p role="status" className="text-sm text-slate-600">Your password was reset. Sign in with your new password.</p>
        ) : token ? (
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">New password</label>
            <input id="new-password" type="password" autoComplete="new-password" required minLength={8}
              value={password} onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">Confirm new password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8}
              value={confirm} onChange={(event) => setConfirm(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {busy ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : (
          <p role="alert" className="text-sm text-red-700">{error ?? "Checking your reset link…"}</p>
        )}
        <Link href="/login" className="inline-block text-sm font-semibold text-emerald-700 hover:underline">Go to login</Link>
      </div>
    </AuthSplitLayout>
  );
}

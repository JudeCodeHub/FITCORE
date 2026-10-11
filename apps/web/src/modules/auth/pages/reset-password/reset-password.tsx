"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { loginStyles as styles } from "@/modules/auth/pages/login/login.styles";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";

export function ResetPasswordPage() {
  const { logout } = useAuth();
  const loaded = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    <AuthSplitLayout eyebrow="Account recovery" headline="Get back to what moves you.">
      <div className={styles.header}>
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
          {done ? <CircleCheck className="h-5 w-5" aria-hidden="true" /> : error && !token ? <CircleAlert className="h-5 w-5" aria-hidden="true" /> : <KeyRound className="h-5 w-5" aria-hidden="true" />}
        </div>
        <h1 className={styles.title}>{done ? "Password updated" : token ? "Create a new password" : error ? "Link unavailable" : "Checking your link"}</h1>
        <p className={styles.subtitle}>
          {done ? "Your account is ready. Sign in with your new password to continue."
            : token ? "Choose a password you haven’t used before to secure your account."
              : error ? "Request a new reset link and we’ll help you get back in."
                : "We’re checking your password reset link."}
        </p>
      </div>

      {done ? (
        <div role="status" className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-relaxed text-slate-700">
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
            Your password has been reset. Your old sessions have been signed out for security.
          </div>
          <Link href="/login" className={styles.submitBtn}><span>Go to log in</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      ) : token ? (
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="new-password" className={styles.label}>New password</label>
            <div className={styles.inputWrap}>
              <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
              <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8}
                value={password} onChange={(event) => setPassword(event.target.value)} className={styles.inputPassword} aria-describedby="password-hint" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword} aria-label={showPassword ? "Hide new password" : "Show new password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="password-hint" className="text-xs text-slate-500">Use at least 8 characters.</p>
          </div>
          <div className={styles.field}>
            <label htmlFor="confirm-password" className={styles.label}>Confirm new password</label>
            <div className={styles.inputWrap}>
              <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
              <input id="confirm-password" type={showConfirm ? "text" : "password"} autoComplete="new-password" required minLength={8}
                value={confirm} onChange={(event) => setConfirm(event.target.value)} className={styles.inputPassword} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={styles.togglePassword} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={styles.submitBtn}>
            <span>{busy ? "Updating password…" : "Update password"}</span>
            {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          <p className="text-center text-xs text-slate-500">Your password is encrypted and never shown to staff.</p>
        </form>
      ) : error ? (
        <div className="space-y-5">
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          <Link href="/forgot-password" className={styles.submitBtn}><span>Request a new link</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      ) : (
        <div role="status" className="h-11 animate-pulse rounded-xl bg-slate-100" />
      )}

      {!done && <p className={styles.footer}>
        <Link href="/login" className={`inline-flex items-center gap-2 ${styles.footerLink}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to log in
        </Link>
      </p>}
    </AuthSplitLayout>
  );
}

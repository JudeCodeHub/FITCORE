"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { loginStyles as styles } from "@/modules/auth/pages/login/login.styles";
import { authService } from "@/modules/auth/services/auth.service";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";
import { ROLE_HOME } from "@/lib/nav-config";

type Invite = { email: string; role: string };

export function StaffOnboardingPage() {
  const router = useRouter();
  const { completeInvite } = useAuth();
  const started = useRef(false);
  const [token, setToken] = useState<string | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const url = new URL(window.location.href);
    const value = url.searchParams.get("token");
    url.searchParams.delete("token");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    if (!value) {
      queueMicrotask(() => {
        setError("This invitation link is missing its token.");
        setLoading(false);
      });
      return;
    }
    void authService.getInvite(value).then(
      (details) => {
        setToken(value);
        setInvite(details);
        setLoading(false);
      },
      () => {
        setError("This invitation has expired or is invalid. Ask your gym administrator for a new link.");
        setLoading(false);
      },
    );
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
      const user = await completeInvite(token, name, password);
      router.replace(ROLE_HOME[user.role]);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not accept this invitation. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const roleLabel = invite?.role.replaceAll("_", " ").toLowerCase();

  return (
    <AuthSplitLayout eyebrow="Staff invitation" headline="Your place on the team starts here.">
      <div className={styles.header}>
        <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border ${!loading && !invite ? "border-red-100 bg-red-50 text-red-600" : "border-teal-100 bg-teal-50 text-teal-700"}`}>
          {!loading && !invite ? <CircleAlert className="h-5 w-5" aria-hidden="true" /> : <UsersRound className="h-5 w-5" aria-hidden="true" />}
        </div>
        <h1 className={styles.title}>{loading ? "Checking your invitation" : invite ? "Join the FitCore team" : "Invitation unavailable"}</h1>
        <p className={styles.subtitle}>
          {loading
            ? "We’re confirming your invitation before you set up your account."
            : invite
              ? "Set up your staff account to access your gym workspace."
              : "This link can’t be used. Your gym administrator can send you a new one."}
        </p>
      </div>

      {loading ? (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" aria-hidden="true" />
          Checking your invitation…
        </div>
      ) : invite ? (
        <form onSubmit={submit} className={styles.form}>
          <div className="rounded-xl border border-teal-100 bg-teal-50/70 px-4 py-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />Your invitation
            </div>
            <p className="mt-2 text-sm font-semibold capitalize text-slate-900">{roleLabel}</p>
            <p className="mt-1 flex items-center gap-2 break-all text-xs text-slate-600"><Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{invite.email}</p>
          </div>

          <div className={styles.field}>
            <label htmlFor="staff-name" className={styles.label}>Full name</label>
            <div className={styles.inputWrap}>
              <UserRound className={styles.inputIcon} aria-hidden="true" />
              <input id="staff-name" type="text" autoComplete="name" required minLength={2} value={name}
                onChange={(event) => setName(event.target.value)} className={styles.input} placeholder="Your full name" />
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="staff-password" className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
              <input id="staff-password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8}
                value={password} onChange={(event) => setPassword(event.target.value)} className={styles.inputPassword} aria-describedby="staff-password-hint" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={styles.togglePassword} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p id="staff-password-hint" className="text-xs text-slate-500">Use at least 8 characters.</p>
          </div>
          <div className={styles.field}>
            <label htmlFor="staff-confirm" className={styles.label}>Confirm password</label>
            <div className={styles.inputWrap}>
              <LockKeyhole className={styles.inputIcon} aria-hidden="true" />
              <input id="staff-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" required minLength={8}
                value={confirm} onChange={(event) => setConfirm(event.target.value)} className={styles.inputPassword} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={styles.togglePassword} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className={styles.submitBtn}>
            <span>{busy ? "Setting up account…" : "Accept invitation"}</span>
            {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
          <p className="text-center text-xs text-slate-500">This invitation is for {invite.email} only.</p>
        </form>
      ) : (
        <div role="alert" className="space-y-5">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">{error}</p>
          <Link href="/login" className={styles.submitBtn}><span>Go to log in</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      )}

      <p className={styles.footer}>
        <Link href="/login" className={`inline-flex items-center gap-2 ${styles.footerLink}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
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

  return (
    <AuthSplitLayout eyebrow="Staff invitation" headline="Join your gym team.">
      <div className="space-y-5">
        <h1 className="font-heading text-2xl font-bold text-slate-950">Set up your account</h1>
        {loading ? <p role="status" className="text-sm text-slate-600">Checking your invitation…</p> : invite ? (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-slate-600">Invited as {invite.role.replaceAll("_", " ").toLowerCase()} at {invite.email}.</p>
            <label htmlFor="staff-name" className="block text-sm font-medium text-slate-700">Full name</label>
            <input id="staff-name" type="text" autoComplete="name" required minLength={2} value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <label htmlFor="staff-password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="staff-password" type="password" autoComplete="new-password" required minLength={8} value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <label htmlFor="staff-confirm" className="block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="staff-confirm" type="password" autoComplete="new-password" required minLength={8} value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">
              {busy ? "Creating account…" : "Accept invitation"}
            </button>
          </form>
        ) : <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Link href="/login" className="inline-block text-sm font-semibold text-emerald-700 hover:underline">Go to login</Link>
      </div>
    </AuthSplitLayout>
  );
}

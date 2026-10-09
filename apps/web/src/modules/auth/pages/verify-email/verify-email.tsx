"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { authService } from "@/modules/auth/services/auth.service";

export function VerifyEmailPage() {
  const started = useRef(false);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

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
        setMessage("Your email is verified. You can now sign in.");
      },
      () => {
        setState("error");
        setMessage("This verification link is invalid or has expired.");
      },
    );
  }, []);

  return (
    <AuthSplitLayout eyebrow="Account security" headline="Confirm your email address.">
      <div role="status" aria-live="polite" className="space-y-5">
        <h1 className="font-heading text-2xl font-bold text-slate-950">
          {state === "loading" ? "Checking your link" : state === "success" ? "Email verified" : "Verification failed"}
        </h1>
        <p className="text-sm text-slate-600">{message}</p>
        {state !== "loading" && (
          <Link href="/login" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
            Go to login
          </Link>
        )}
      </div>
    </AuthSplitLayout>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { ApiError } from "@/shared/api-client/http";
import { authService } from "@/modules/auth/services/auth.service";
import { useAuth } from "@/shared/auth/auth-context";
import { ROLE_HOME } from "@/lib/nav-config";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginStyles as styles } from "./login.styles";

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendMessage(null);
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      router.push(ROLE_HOME[user.role]);
    } catch (err) {
      setNeedsVerification(err instanceof ApiError && err.status === 403);
      setError(
        err instanceof ApiError ? err.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendVerification() {
    try {
      const result = await authService.resendVerification(email);
      setResendMessage(result.message + " In local development, check the API console.");
      setNeedsVerification(false);
    } catch {
      setResendMessage("Could not request a new link. Try again.");
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Welcome back"
      headline="Run your gym from one dashboard."
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Log in</h1>
        <p className={styles.subtitle}>Enter your details to continue.</p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 border-red-200 bg-red-50 text-red-700"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>

      )}

      {needsVerification && (
        <button type="button" onClick={resendVerification}
          className="mb-4 text-sm font-semibold text-emerald-700 hover:underline">
          Send a new verification link
        </button>
      )}
      {resendMessage && <p role="status" className="mb-4 text-sm text-slate-700">{resendMessage}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <div className={styles.inputWrap}>
            <Mail className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <div className={styles.inputWrap}>
            <Lock className={styles.inputIcon} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputPassword}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-emerald-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "Logging in…" : "Log in"}</span>
        </button>
      </form>

      <p className={styles.footer}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={styles.footerLink}>
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}



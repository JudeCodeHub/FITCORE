"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout } from "@/modules/auth/components/auth-split-layout";
import { ApiError } from "@/shared/api-client/http";
import { useAuth } from "@/shared/auth/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signupStyles as styles } from "./signup.styles";

export function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      setCreated(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthSplitLayout
      eyebrow="Get started"
      headline="Join as a member and start tracking progress."
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          Staff accounts are set up by invite, not here.
        </p>
      </div>

      {error && (
        <Alert
          variant="destructive"
          className="mb-4 border-red-200 bg-red-50 text-red-700"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      {created ? (
        <div role="status" className="space-y-3 text-sm text-slate-700">
          <p>Account created. Verify your email before signing in.</p>
          <p>For local development, the verification link appears in the API console.</p>
          <Link href="/login" className={styles.footerLink}>Go to login</Link>
        </div>
      ) : <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Full name
          </label>
          <div className={styles.inputWrap}>
            <User className={styles.inputIcon} />
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email address
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
              minLength={8}
              autoComplete="new-password"
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

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "Creating account…" : "Sign up"}</span>
        </button>
      </form>}

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.footerLink}>
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}


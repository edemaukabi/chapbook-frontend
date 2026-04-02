"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    if (!authLoading && user) router.replace(next);
  }, [user, authLoading, next, router]);

  // Don't flash the form while auth is resolving
  if (authLoading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.replace(next);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { non_field_errors?: string[]; detail?: string } } })
          ?.response?.data?.non_field_errors?.[0] ??
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Invalid credentials";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 36px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-lg)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <BookOpen size={24} color="white" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 6, color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Sign in to your Chapbook account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <Link
              href="/forgot-password"
              style={{ fontSize: "0.82rem", color: "var(--accent-primary)", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-primary)",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity var(--transition-fast)",
              marginTop: 4,
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

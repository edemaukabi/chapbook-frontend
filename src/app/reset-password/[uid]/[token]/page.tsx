"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, BookOpen, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: "0.8rem", color: "var(--error)", fontWeight: 500 }}>
      <AlertCircle size={12} />
      {msg}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { password: "", confirm: "" };
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!confirm) newErrors.confirm = "Please confirm your password";
    else if (password !== confirm) newErrors.confirm = "Passwords do not match";
    if (newErrors.password || newErrors.confirm) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      await api.post("/auth/password/reset/confirm/", {
        uid,
        token,
        new_password1: password,
        new_password2: confirm,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const msg =
        data?.token?.[0] ??
        data?.uid?.[0] ??
        data?.new_password2?.[0] ??
        "This reset link has expired or is invalid.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
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
            {done ? "Password updated" : "Set a new password"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {done ? "Redirecting you to sign in…" : "Choose a strong password for your account."}
          </p>
        </div>

        {!done && (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                New password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: 44, ...(errors.password ? { borderColor: "var(--error)" } : {}) }}
                  onFocus={(e) => { if (!errors.password) e.target.style.borderColor = "var(--accent-primary)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.password ? "var(--error)" : "var(--border-color)"; }}
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
              <FieldError msg={errors.password} />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" })); }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                style={{ ...inputStyle, ...(errors.confirm ? { borderColor: "var(--error)" } : {}) }}
                onFocus={(e) => { if (!errors.confirm) e.target.style.borderColor = "var(--accent-primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = errors.confirm ? "var(--error)" : "var(--border-color)"; }}
              />
              <FieldError msg={errors.confirm} />
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
                marginTop: 4,
              }}
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setEmailError("Email is required"); return; }
    if (!emailRegex.test(email)) { setEmailError("Enter a valid email address"); return; }
    setEmailError("");
    setLoading(true);
    try {
      await api.post("/auth/password/reset/", { email });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
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
            Reset your password
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {sent
              ? "Check your email for a reset link."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: "var(--bg-elevated)",
                  border: `1px solid ${emailError ? "var(--error)" : "var(--border-color)"}`,
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                onFocus={(e) => { if (!emailError) e.target.style.borderColor = "var(--accent-primary)"; }}
                onBlur={(e) => { e.target.style.borderColor = emailError ? "var(--error)" : "var(--border-color)"; }}
              />
              {emailError && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: "0.8rem", color: "var(--error)", fontWeight: 500 }}>
                  <AlertCircle size={12} />
                  {emailError}
                </div>
              )}
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
              }}
            >
              {loading ? "Sending…" : "Send reset link"}
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: "0.8rem", color: "var(--error)", fontWeight: 500 }}>
      <AlertCircle size={12} />
      {msg}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, refetchUser } = useAuth();
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password1: "",
    password2: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ first_name: "", last_name: "", email: "", password1: "", password2: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/dashboard");
  }, [user, authLoading, router]);

  if (authLoading) return <div style={{ minHeight: "80vh" }} />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { first_name: "", last_name: "", email: "", password1: "", password2: "" };
    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.password1) newErrors.password1 = "Password is required";
    else if (form.password1.length < 8) newErrors.password1 = "Password must be at least 8 characters";
    if (!form.password2) newErrors.password2 = "Please confirm your password";
    else if (form.password1 !== form.password2) newErrors.password2 = "Passwords do not match";
    if (Object.values(newErrors).some(Boolean)) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      await api.post("/auth/registration/", form);
      await refetchUser();
      toast.success("Account created! Welcome to Chapbook.");
      router.replace("/dashboard");
    } catch (err: unknown) {
      type ErrData = { email?: string[]; password1?: string[]; non_field_errors?: string[] };
      const data = (err as { response?: { data?: ErrData } })?.response?.data;
      const msg =
        data?.email?.[0] ??
        data?.password1?.[0] ??
        data?.non_field_errors?.[0] ??
        "Registration failed";
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

  const focus = (key: keyof typeof errors) => (e: React.FocusEvent<HTMLInputElement>) => {
    if (!errors[key]) e.target.style.borderColor = "var(--accent-primary)";
  };
  const blur = (key: keyof typeof errors) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = errors[key] ? "var(--error)" : "var(--border-color)";
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
            Create your account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Join thousands of writers on Chapbook
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                First name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={set("first_name")}
                placeholder="John"
                autoComplete="given-name"
                style={{ ...inputStyle, ...(errors.first_name ? { borderColor: "var(--error)" } : {}) }}
                onFocus={focus("first_name")}
                onBlur={blur("first_name")}
              />
              <FieldError msg={errors.first_name} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
                Last name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={set("last_name")}
                placeholder="Doe"
                autoComplete="family-name"
                style={{ ...inputStyle, ...(errors.last_name ? { borderColor: "var(--error)" } : {}) }}
                onFocus={focus("last_name")}
                onBlur={blur("last_name")}
              />
              <FieldError msg={errors.last_name} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
              style={{ ...inputStyle, ...(errors.email ? { borderColor: "var(--error)" } : {}) }}
              onFocus={focus("email")}
              onBlur={blur("email")}
            />
            <FieldError msg={errors.email} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password1}
                onChange={set("password1")}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                style={{ ...inputStyle, paddingRight: 44, ...(errors.password1 ? { borderColor: "var(--error)" } : {}) }}
                onFocus={focus("password1")}
                onBlur={blur("password1")}
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
            <FieldError msg={errors.password1} />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={form.password2}
              onChange={set("password2")}
              placeholder="Repeat password"
              autoComplete="new-password"
              style={{ ...inputStyle, ...(errors.password2 ? { borderColor: "var(--error)" } : {}) }}
              onFocus={focus("password2")}
              onBlur={blur("password2")}
            />
            <FieldError msg={errors.password2} />
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
              marginTop: 6,
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

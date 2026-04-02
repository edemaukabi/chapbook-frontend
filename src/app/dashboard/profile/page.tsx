"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Camera, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Profile } from "@/types";

const GENDER_OPTIONS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
];

export default function EditProfilePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    gender: "M",
    country: "",
    city: "",
    twitter_handle: "",
    about_me: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/profiles/me/");
        const p: Profile = data.profile ?? data;
        setProfile(p);
        setForm({
          first_name: p.first_name ?? "",
          last_name: p.last_name ?? "",
          phone_number: p.phone_number ?? "",
          gender: p.gender ?? "M",
          country: p.country ?? "",
          city: p.city ?? "",
          twitter_handle: p.twitter_handle ?? "",
          about_me: p.about_me ?? "",
        });
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (photoFile) formData.append("profile_photo", photoFile);

      const { data } = await api.patch("/profiles/me/update/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(data.profile ?? data);
      toast.success("Profile updated!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color var(--transition-fast)",
  };

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--accent-primary)");
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--border-color)");

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ height: 400, background: "var(--bg-card)", borderRadius: "var(--radius-xl)", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    );
  }

  const avatarSrc = photoPreview ?? profile?.profile_photo ?? null;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 80px" }}>
      {/* Back */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.85rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          marginBottom: 28,
        }}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: 32, color: "var(--text-primary)" }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Photo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ position: "relative" }}>
            {avatarSrc ? (
              <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden" }}>
                <Image
                  src={avatarSrc}
                  alt="Profile photo"
                  width={80}
                  height={80}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: "white",
                  fontSize: "1.75rem",
                }}
              >
                {user?.first_name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--accent-primary)",
                border: "2px solid var(--bg-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
              }}
            >
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              {form.first_name} {form.last_name}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Click the camera icon to update your photo
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: "none" }}
          />
        </div>

        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              First name
            </label>
            <input type="text" value={form.first_name} onChange={set("first_name")} style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Last name
            </label>
            <input type="text" value={form.last_name} onChange={set("last_name")} style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        {/* Phone + Gender */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Phone
            </label>
            <input type="tel" value={form.phone_number} onChange={set("phone_number")} placeholder="+234..." style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Gender
            </label>
            <select value={form.gender} onChange={set("gender")} style={{ ...inputStyle, cursor: "pointer" }} onFocus={focus} onBlur={blur}>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City + Country */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              City
            </label>
            <input type="text" value={form.city} onChange={set("city")} placeholder="Lagos" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              Country
            </label>
            <input type="text" value={form.country} onChange={set("country")} placeholder="Nigeria" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>
        </div>

        {/* Twitter */}
        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            Twitter / X handle
          </label>
          <input type="text" value={form.twitter_handle} onChange={set("twitter_handle")} placeholder="@yourhandle" style={inputStyle} onFocus={focus} onBlur={blur} />
        </div>

        {/* Bio */}
        <div>
          <label style={{ display: "block", marginBottom: 5, fontSize: "0.82rem", fontWeight: 500, color: "var(--text-secondary)" }}>
            About me
          </label>
          <textarea
            value={form.about_me}
            onChange={set("about_me")}
            placeholder="Tell the world about yourself…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={focus}
            onBlur={blur}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px",
            borderRadius: "var(--radius-md)",
            background: "var(--gradient-primary)",
            border: "none",
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "opacity var(--transition-fast)",
            boxShadow: "0 4px 16px rgba(124,111,255,0.3)",
          }}
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

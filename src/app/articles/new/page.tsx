"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ImagePlus, X, Send } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 400,
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    ),
  }
);

const SUGGESTED_TAGS = [
  "Technology", "Science", "Culture", "Writing", "Design", "Business", "Health",
];

export default function NewArticlePage() {
  const { user, loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const addTag = (tag: string) => {
    const cleaned = tag.toLowerCase().trim();
    if (!cleaned || tags.includes(cleaned) || tags.length >= 5) return;
    setTags((prev) => [...prev, cleaned]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (title.length > 255) { toast.error("Title must be 255 characters or less"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    if (description.length > 255) { toast.error("Description must be 255 characters or less"); return; }
    if (!body || body === "<p></p>") { toast.error("Article body is required"); return; }

    setPublishing(true);
    try {
      let responseData;

      if (bannerFile) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("body", body);
        // Send tags as JSON string — TagListField on backend handles parsing
        formData.append("tags", JSON.stringify(tags));
        formData.append("banner_image", bannerFile);
        const { data } = await api.post("/articles/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        responseData = data;
      } else {
        const { data } = await api.post("/articles/", { title, description, body, tags });
        responseData = data;
      }

      // ArticlesJSONRenderer wraps the created article as { articles: { ...fields } }
      const article = responseData.articles ?? responseData.article ?? responseData;
      if (!article?.slug) {
        toast.error("Article created but could not redirect — check your dashboard");
        router.push("/dashboard");
        return;
      }
      toast.success("Article published!");
      router.push(`/articles/${article.slug}`);
    } catch (err: unknown) {
      const response = (err as { response?: { data?: unknown; status?: number } })?.response;
      const raw = response?.data;

      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        toast.error(`Server error (${response?.status ?? "unknown"}) — please try again`);
        return;
      }

      const data = raw as Record<string, unknown>;
      // ArticlesJSONRenderer may nest errors under "articles"
      const inner = (typeof data.articles === "object" && data.articles !== null && !Array.isArray(data.articles)
        ? data.articles
        : data) as Record<string, unknown>;

      const msg =
        (inner.detail as string) ??
        (inner.non_field_errors as string[] | undefined)?.join(", ") ??
        Object.entries(inner)
          .filter(([k]) => k !== "status_code")
          .map(([, v]) => (Array.isArray(v) ? v[0] : v))
          .filter(Boolean)
          .join(", ") ??
        "Failed to publish article";

      toast.error(String(msg) || "Failed to publish article");
    } finally {
      setPublishing(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text-primary)",
    fontFamily: "inherit",
  };

  if (authLoading || !user) return null;

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "40px 16px 80px" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 36,
        }}
      >
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
          New article
        </h1>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 22px",
            borderRadius: "var(--radius-full)",
            background: "var(--gradient-primary)",
            border: "none",
            color: "white",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: publishing ? "not-allowed" : "pointer",
            opacity: publishing ? 0.7 : 1,
            boxShadow: "0 4px 14px rgba(124,111,255,0.4)",
          }}
        >
          <Send size={14} />
          {publishing ? "Publishing…" : "Publish"}
        </button>
      </div>

      {/* Banner image */}
      <div style={{ marginBottom: 28 }}>
        {bannerPreview ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <Image src={bannerPreview} alt="Banner preview" fill style={{ objectFit: "cover" }} />
            <button
              type="button"
              onClick={() => { setBannerFile(null); setBannerPreview(null); }}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                border: "none",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: "100%",
              padding: "28px",
              borderRadius: "var(--radius-lg)",
              border: "2px dashed var(--border-color)",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              transition: "border-color var(--transition-fast)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--accent-primary)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)")
            }
          >
            <ImagePlus size={24} />
            <span style={{ fontSize: "0.875rem" }}>Add a banner image</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleBanner}
          style={{ display: "none" }}
        />
      </div>

      {/* Title */}
      <textarea
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Article title…"
        rows={2}
        style={{
          ...inputStyle,
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          resize: "none",
          marginBottom: 16,
          display: "block",
        }}
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 255))}
        placeholder="A short description (shown in previews)…"
        rows={2}
        style={{
          ...inputStyle,
          fontSize: "1.05rem",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          resize: "none",
          marginBottom: 8,
          display: "block",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 24,
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: description.length > 230 ? "var(--accent-secondary)" : "var(--text-muted)",
          }}
        >
          {description.length}/255
        </span>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                background: "rgba(124,111,255,0.15)",
                border: "1px solid rgba(124,111,255,0.3)",
                color: "var(--accent-primary)",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  padding: 0,
                  display: "flex",
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {tags.length < 5 && (
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="Add tags (enter to confirm)…"
              style={{
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                minWidth: 160,
              }}
            />
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t.toLowerCase())).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-color)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <RichTextEditor content={body} onChange={setBody} />

      {/* Word count */}
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: 8,
          textAlign: "right",
        }}
      >
        {body.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length} words
      </p>
    </div>
  );
}

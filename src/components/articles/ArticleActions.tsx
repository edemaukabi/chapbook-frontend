"use client";

import { useState } from "react";
import { Heart, Bookmark, Star } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Article } from "@/types";

export default function ArticleActions({ article }: { article: Article }) {
  const { user } = useAuth();
  const [claps, setClaps] = useState(article.claps_count);
  const [clapped, setClapped] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [rated, setRated] = useState(false);

  const handleClap = async () => {
    if (!user) { toast.error("Log in to clap for this article"); return; }
    try {
      if (clapped) {
        await api.delete(`/articles/${article.id}/clap/`);
        setClaps((c) => c - 1);
        setClapped(false);
      } else {
        await api.post(`/articles/${article.id}/clap/`);
        setClaps((c) => c + 1);
        setClapped(true);
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleBookmark = async () => {
    if (!user) { toast.error("Log in to bookmark this article"); return; }
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/remove_bookmark/${article.id}/`);
        setBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await api.post(`/bookmarks/bookmark_article/${article.id}/`);
        setBookmarked(true);
        toast.success("Article bookmarked");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Something went wrong");
    }
  };

  const handleRate = async (value: number) => {
    if (!user) { toast.error("Log in to rate this article"); return; }
    if (rated) { toast.info("You have already rated this article"); return; }
    try {
      await api.post(`/ratings/rate_article/${article.id}/`, { rating: value });
      setRating(value);
      setRated(true);
      toast.success(`Rated ${value} star${value !== 1 ? "s" : ""}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Something went wrong");
    }
  };

  return (
    <div
      style={{
        padding: "24px 0",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        marginBottom: 48,
        display: "flex",
        alignItems: "center",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Clap */}
      <button
        onClick={handleClap}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: "var(--radius-full)",
          border: `1px solid ${clapped ? "var(--accent-secondary)" : "var(--border-color)"}`,
          background: clapped ? "rgba(255,107,157,0.1)" : "transparent",
          color: clapped ? "var(--accent-secondary)" : "var(--text-secondary)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "all var(--transition-fast)",
        }}
      >
        <Heart size={16} fill={clapped ? "currentColor" : "none"} />
        {claps} {claps === 1 ? "Clap" : "Claps"}
      </button>

      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: "var(--radius-full)",
          border: `1px solid ${bookmarked ? "var(--accent-primary)" : "var(--border-color)"}`,
          background: bookmarked ? "rgba(124,111,255,0.1)" : "transparent",
          color: bookmarked ? "var(--accent-primary)" : "var(--text-secondary)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "all var(--transition-fast)",
        }}
      >
        <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        {bookmarked ? "Saved" : "Save"}
      </button>

      {/* Star rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginRight: 4 }}>
          Rate:
        </span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => handleRate(star)}
            disabled={rated}
            style={{
              background: "transparent",
              border: "none",
              cursor: rated ? "default" : "pointer",
              padding: 2,
              color:
                star <= (hoveredStar || rating)
                  ? "var(--accent-amber)"
                  : "var(--text-muted)",
              transition: "color var(--transition-fast)",
            }}
          >
            <Star
              size={20}
              fill={star <= (hoveredStar || rating) ? "currentColor" : "none"}
            />
          </button>
        ))}
        {article.average_rating && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: 4 }}>
            ({article.average_rating.toFixed(1)})
          </span>
        )}
      </div>
    </div>
  );
}

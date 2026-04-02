"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PenSquare, Bookmark, Trash2, Edit2, BookOpen, BookmarkX } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/types";

type Tab = "articles" | "bookmarks";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function MyArticleCard({ article, onDelete }: { article: Article; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/articles/${article.id}/`);
      onDelete(article.id);
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <ArticleCard article={article} />
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          display: "flex",
          gap: 6,
          zIndex: 2,
        }}
      >
        <Link href={`/articles/${article.slug}/edit`}>
          <button
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <Edit2 size={12} />
            Edit
          </button>
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-color)",
            color: "var(--accent-secondary)",
            cursor: deleting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: "0.75rem",
            fontWeight: 500,
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    const fetchMyArticles = async () => {
      setLoadingArticles(true);
      try {
        const { data } = await api.get("/articles/");
        setMyArticles(data.articles ?? data.results ?? []);
      } catch {
        // silently fail
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchMyArticles();
  }, []);

  useEffect(() => {
    if (activeTab !== "bookmarks") return;
    const fetchBookmarks = async () => {
      setLoadingBookmarks(true);
      try {
        // Fetch all articles and filter bookmarked — API doesn't have a dedicated bookmarks list endpoint
        // We re-use the articles list which includes bookmarks_count but there's no "my bookmarks" list
        // For now show a helpful message
        setBookmarks([]);
      } catch {
        // silently fail
      } finally {
        setLoadingBookmarks(false);
      }
    };
    fetchBookmarks();
  }, [activeTab]);

  const handleArticleDeleted = (id: string) => {
    setMyArticles((prev) => prev.filter((a) => a.id !== id));
  };

  const tabStyle = (tab: Tab) => ({
    padding: "8px 20px",
    borderRadius: "var(--radius-full)",
    border: "none",
    background: activeTab === tab ? "var(--gradient-primary)" : "transparent",
    color: activeTab === tab ? "white" : "var(--text-secondary)",
    fontWeight: activeTab === tab ? 600 : 400,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    boxShadow: activeTab === tab ? "0 4px 12px rgba(124,111,255,0.3)" : "none",
  });

  return (
    <div className="container" style={{ padding: "40px 16px 80px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 36,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 6,
              color: "var(--text-primary)",
            }}
          >
            Welcome back, <span className="gradient-text">{user?.first_name}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Manage your articles and bookmarks
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard/profile">
            <button
              style={{
                padding: "9px 18px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-color)",
                background: "transparent",
                color: "var(--text-secondary)",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Edit profile
            </button>
          </Link>
          <Link href="/articles/new">
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 18px",
                borderRadius: "var(--radius-full)",
                border: "none",
                background: "var(--gradient-primary)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124,111,255,0.3)",
              }}
            >
              <PenSquare size={15} />
              Write
            </button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 32,
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-full)",
          padding: 4,
          width: "fit-content",
        }}
      >
        <button onClick={() => setActiveTab("articles")} style={tabStyle("articles")}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} />
            My Articles
          </span>
        </button>
        <button onClick={() => setActiveTab("bookmarks")} style={tabStyle("bookmarks")}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Bookmark size={14} />
            Saved
          </span>
        </button>
      </div>

      {/* Articles tab */}
      {activeTab === "articles" && (
        <>
          {loadingArticles ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)",
                    height: 300,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : myArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
              <PenSquare size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
                No articles yet
              </p>
              <p style={{ fontSize: "0.875rem", marginBottom: 20 }}>
                Share your first story with the world
              </p>
              <Link href="/articles/new">
                <button
                  style={{
                    padding: "10px 24px",
                    borderRadius: "var(--radius-full)",
                    background: "var(--gradient-primary)",
                    border: "none",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(124,111,255,0.3)",
                  }}
                >
                  Write your first article
                </button>
              </Link>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {myArticles.map((article) => (
                <motion.div key={article.id} variants={item}>
                  <MyArticleCard article={article} onDelete={handleArticleDeleted} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Bookmarks tab */}
      {activeTab === "bookmarks" && (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <BookmarkX size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
            Bookmarks coming soon
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Save articles by clicking the bookmark button on any article
          </p>
        </div>
      )}
    </div>
  );
}

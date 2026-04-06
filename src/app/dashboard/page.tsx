"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PenSquare, Bookmark, Trash2, Edit2, BookOpen, BookmarkX, Users, UserMinus } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article, Profile } from "@/types";

type Tab = "articles" | "bookmarks" | "following";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

function DeleteModal({ title, onConfirm, onCancel, deleting }: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)", padding: "32px 28px",
          maxWidth: 420, width: "100%", boxShadow: "var(--shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(255,107,107,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Trash2 size={22} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            Delete article?
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <strong>&ldquo;{title}&rdquo;</strong> will be permanently deleted. This cannot be undone.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: "9px 20px", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-color)", background: "transparent",
              color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              padding: "9px 20px", borderRadius: "var(--radius-full)",
              border: "none", background: "var(--accent-secondary)",
              color: "white", fontWeight: 600, fontSize: "0.875rem",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SavedArticleCard({ article, onRemove }: { article: Article; onRemove: (id: string) => void }) {
  const [removing, setRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`/bookmarks/remove_bookmark/${article.id}/`);
      onRemove(article.id);
      toast.success("Bookmark removed");
    } catch {
      toast.error("Failed to remove bookmark");
      setRemoving(false);
    }
    setShowConfirm(false);
  };

  return (
    <>
      {showConfirm && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => setShowConfirm(false)}
        >
          <div
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-xl)", padding: "32px 28px", maxWidth: 400, width: "100%", boxShadow: "var(--shadow-lg)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(124,111,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <BookmarkX size={22} style={{ color: "var(--accent-primary)" }} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
              Remove bookmark?
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              <strong>&ldquo;{article.title}&rdquo;</strong> will be removed from your saved articles.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={removing}
                style={{ padding: "9px 20px", borderRadius: "var(--radius-full)", border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                style={{ padding: "9px 20px", borderRadius: "var(--radius-full)", border: "none", background: "var(--gradient-primary)", color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: removing ? "not-allowed" : "pointer", opacity: removing ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6 }}
              >
                <BookmarkX size={14} />
                {removing ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={{ position: "relative" }}>
        <ArticleCard article={article} />
        <button
          onClick={() => setShowConfirm(true)}
          style={{ position: "absolute", top: 12, right: 12, zIndex: 2, padding: "6px 10px", borderRadius: "var(--radius-md)", background: "var(--bg-elevated)", border: "1px solid var(--border-color)", color: "var(--accent-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 500 }}
        >
          <BookmarkX size={12} />
          Remove
        </button>
      </div>
    </>
  );
}

function MyArticleCard({ article, onDelete }: { article: Article; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/articles/${article.id}/`);
      onDelete(article.id);
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
      setDeleting(false);
    }
    setShowModal(false);
  };

  return (
    <>
      {showModal && (
        <DeleteModal
          title={article.title}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
          deleting={deleting}
        />
      )}
      <div style={{ position: "relative" }}>
        <ArticleCard article={article} />
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6, zIndex: 2 }}>
          <Link href={`/articles/${article.slug}/edit`}>
            <button
              style={{
                padding: "6px 10px", borderRadius: "var(--radius-md)",
                background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                color: "var(--text-secondary)", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontSize: "0.75rem", fontWeight: 500,
              }}
            >
              <Edit2 size={12} />
              Edit
            </button>
          </Link>
          <button
            onClick={() => setShowModal(true)}
            disabled={deleting}
            style={{
              padding: "6px 10px", borderRadius: "var(--radius-md)",
              background: "var(--bg-elevated)", border: "1px solid var(--border-color)",
              color: "var(--accent-secondary)", cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 4,
              fontSize: "0.75rem", fontWeight: 500, opacity: deleting ? 0.6 : 1,
            }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

function FollowingCard({ profile, onUnfollow }: { profile: Profile; onUnfollow: (id: string) => void }) {
  const [unfollowing, setUnfollowing] = useState(false);

  const handleUnfollow = async () => {
    setUnfollowing(true);
    try {
      await api.post(`/profiles/${profile.id}/unfollow/`);
      onUnfollow(profile.id);
      toast.success(`Unfollowed ${profile.first_name}`);
    } catch {
      toast.error("Failed to unfollow");
      setUnfollowing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px",
        background: "var(--bg-card)", border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <Link href={`/authors/${profile.id}`} style={{ flexShrink: 0 }}>
        {profile.profile_photo ? (
          <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden" }}>
            <Image
              src={profile.profile_photo}
              alt={profile.full_name}
              width={52}
              height={52}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "var(--gradient-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: "white", fontSize: "1.2rem",
          }}>
            {profile.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </Link>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Link href={`/authors/${profile.id}`} style={{ textDecoration: "none" }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: 2 }}>
            {profile.full_name}
          </p>
        </Link>
        {profile.about_me && (
          <p style={{
            fontSize: "0.8rem", color: "var(--text-secondary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {profile.about_me}
          </p>
        )}
      </div>

      <button
        onClick={handleUnfollow}
        disabled={unfollowing}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 14px", borderRadius: "var(--radius-full)",
          border: "1px solid var(--border-color)", background: "transparent",
          color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 500,
          cursor: unfollowing ? "not-allowed" : "pointer",
          opacity: unfollowing ? 0.6 : 1, flexShrink: 0,
          transition: "all var(--transition-fast)",
        }}
        onMouseEnter={(e) => {
          if (!unfollowing) {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-secondary)";
            (e.currentTarget as HTMLElement).style.color = "var(--accent-secondary)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
        }}
      >
        <UserMinus size={13} />
        {unfollowing ? "Unfollowing…" : "Unfollow"}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [bookmarks, setBookmarks] = useState<Article[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    const fetchMyArticles = async () => {
      setLoadingArticles(true);
      try {
        const { data } = await api.get(`/articles/?author_pkid=${authUser.pk}`);
        setMyArticles(data.articles?.results ?? data.results ?? []);
      } catch {
        // silently fail
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchMyArticles();
  }, [authUser]);

  useEffect(() => {
    if (activeTab !== "following") return;
    const fetchFollowing = async () => {
      setLoadingFollowing(true);
      try {
        const { data } = await api.get("/profiles/me/following/");
        setFollowing(data.following ?? []);
      } catch {
        // silently fail
      } finally {
        setLoadingFollowing(false);
      }
    };
    fetchFollowing();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "bookmarks") return;
    const fetchBookmarks = async () => {
      setLoadingBookmarks(true);
      try {
        const { data } = await api.get("/bookmarks/");
        setBookmarks(data.bookmarks ?? []);
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

  const handleUnfollowed = (id: string) => {
    setFollowing((prev) => prev.filter((p) => p.id !== id));
  };

  const handleBookmarkRemoved = (id: string) => {
    setBookmarks((prev) => prev.filter((a) => a.id !== id));
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

  if (authLoading || !user) return null;

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
        <button onClick={() => setActiveTab("following")} style={tabStyle("following")}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={14} />
            Following
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
        <>
          {loadingBookmarks ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", height: 300, animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
              <BookmarkX size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>No saved articles</p>
              <p style={{ fontSize: "0.875rem", marginBottom: 20 }}>
                Bookmark articles by clicking the Save button while reading
              </p>
              <Link href="/articles">
                <button style={{ padding: "10px 24px", borderRadius: "var(--radius-full)", background: "var(--gradient-primary)", border: "none", color: "white", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(124,111,255,0.3)" }}>
                  Browse articles
                </button>
              </Link>
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {bookmarks.map((article) => (
                <motion.div key={article.id} variants={item}>
                  <SavedArticleCard article={article} onRemove={handleBookmarkRemoved} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Following tab */}
      {activeTab === "following" && (
        <>
          {loadingFollowing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-lg)", height: 84,
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : following.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
              <Users size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
              <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
                Not following anyone yet
              </p>
              <p style={{ fontSize: "0.875rem", marginBottom: 20 }}>
                Discover writers and follow them to keep up with their work
              </p>
              <Link href="/authors">
                <button
                  style={{
                    padding: "10px 24px", borderRadius: "var(--radius-full)",
                    background: "var(--gradient-primary)", border: "none",
                    color: "white", fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(124,111,255,0.3)",
                  }}
                >
                  Browse writers
                </button>
              </Link>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640 }}
            >
              {following.map((profile) => (
                <motion.div key={profile.id} variants={item}>
                  <FollowingCard profile={profile} onUnfollow={handleUnfollowed} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

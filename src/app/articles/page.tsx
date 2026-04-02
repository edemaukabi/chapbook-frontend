"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import api from "@/lib/api";
import type { Article } from "@/types";

const TAGS = ["All", "Technology", "Science", "Culture", "Writing", "Design", "Business", "Health"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchArticles = useCallback(
    async (pageNum = 1, reset = false) => {
      setLoading(true);
      try {
        // Use public Elasticsearch endpoint — works for both logged-in and anonymous users
        const params: Record<string, string> = { page: String(pageNum) };
        if (search) params.search = search;
        if (activeTag !== "All") params.tags = activeTag.toLowerCase();

        const { data } = await api.get("/elastic/search/", { params });
        const results: Article[] = data.results ?? [];
        const count: number = data.count ?? results.length;

        setArticles((prev) => (reset || pageNum === 1 ? results : [...prev, ...results]));
        setTotal(count);
        setHasMore(!!data.next);
        setPage(pageNum);
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoading(false);
      }
    },
    [search, activeTag]
  );

  useEffect(() => {
    fetchArticles(1, true);
  }, [fetchArticles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles(1, true);
  };

  return (
    <div className="container" style={{ padding: "40px 16px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          <span className="gradient-text">All Articles</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          {total > 0 ? `${total} articles from the community` : "Discover stories from writers worldwide"}
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 24, position: "relative" }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by title..."
          style={{
            width: "100%",
            padding: "12px 16px 12px 44px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color var(--transition-fast)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
      </form>

      {/* Tag filter */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 32,
        }}
      >
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.82rem",
              fontWeight: activeTag === tag ? 600 : 400,
              background:
                activeTag === tag ? "var(--gradient-primary)" : "var(--bg-card)",
              border: `1px solid ${activeTag === tag ? "transparent" : "var(--border-color)"}`,
              color: activeTag === tag ? "white" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              boxShadow: activeTag === tag ? "0 4px 12px rgba(124,111,255,0.3)" : "none",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {loading && articles.length === 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            color: "var(--text-muted)",
          }}
        >
          <BookOpen size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
            No articles found
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            Try a different search term or tag filter
          </p>
        </div>
      ) : (
        <>
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
            {articles.map((article) => (
              <motion.div key={article.id} variants={item}>
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button
                onClick={() => fetchArticles(page + 1)}
                disabled={loading}
                style={{
                  padding: "10px 28px",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  transition: "all var(--transition-fast)",
                }}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "var(--bg-elevated)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            height: 12,
            width: "60%",
            background: "var(--bg-elevated)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            height: 20,
            width: "90%",
            background: "var(--bg-elevated)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            height: 14,
            width: "75%",
            background: "var(--bg-elevated)",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

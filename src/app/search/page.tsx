"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, BookOpen } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL;

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API}/articles/?title=${encodeURIComponent(q.trim())}&ordering=-created_at`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(data.articles?.results ?? data.results ?? []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) doSearch(initialQuery);
  }, [initialQuery, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setActiveQuery(inputValue);
    router.replace(`/search?q=${encodeURIComponent(inputValue)}`);
    doSearch(inputValue);
  };

  return (
    <div className="container" style={{ padding: "40px 16px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
          <span className="gradient-text">Search</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Search articles by title or tags
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 40, position: "relative" }}>
        <Search
          size={20}
          style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search articles…"
          autoFocus
          style={{
            width: "100%", padding: "14px 100px 14px 52px",
            background: "var(--bg-card)", border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-full)", color: "var(--text-primary)",
            fontSize: "1rem", outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
        />
        <button
          type="submit"
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            padding: "8px 20px", borderRadius: "var(--radius-full)",
            background: "var(--gradient-primary)", border: "none",
            color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)", height: 280, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : searched && articles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <BookOpen size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8 }}>
            No results for &ldquo;{activeQuery}&rdquo;
          </p>
          <p style={{ fontSize: "0.875rem" }}>Try different keywords</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: 24 }}>
            {articles.length} result{articles.length !== 1 ? "s" : ""} for &ldquo;{activeQuery}&rdquo;
          </p>
          <motion.div
            variants={container} initial="hidden" animate="show"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}
          >
            {articles.map((article) => (
              <motion.div key={article.id} variants={item}>
                <ArticleCard article={article} />
              </motion.div>
            ))}
          </motion.div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
          <Search size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
          <p style={{ fontSize: "1rem" }}>Start typing to search articles</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}

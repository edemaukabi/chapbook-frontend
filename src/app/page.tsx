import Link from "next/link";
import { PenSquare, BookOpen, Users, Zap } from "lucide-react";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Article } from "@/types";

async function getArticles(): Promise<Article[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/articles/?ordering=-created_at&page=1`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: Article[] = data.articles?.results ?? data.results ?? [];
    return results.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "80px 0 60px", position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute", top: "10%", left: "20%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute", top: "30%", right: "15%",
            width: 300, height: 300, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ textAlign: "center", position: "relative" }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-color)",
              background: "rgba(124, 111, 255, 0.08)",
              fontSize: "0.8rem", color: "var(--accent-primary)",
              fontWeight: 500, marginBottom: 28,
            }}
          >
            <Zap size={13} />
            A new kind of publishing platform
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 800,
              lineHeight: 1.15, letterSpacing: "-0.03em",
              marginBottom: 24, color: "var(--text-primary)",
            }}
          >
            Read &amp; Write Stories{" "}
            <span className="gradient-text">That Matter</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--text-secondary)", maxWidth: 560,
              margin: "0 auto 40px", lineHeight: 1.7,
            }}
          >
            Discover thoughtful articles from writers who care about their craft.
            Share your ideas with a community that values great storytelling.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/articles"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: "var(--radius-full)",
                background: "var(--gradient-primary)", color: "white",
                fontWeight: 600, fontSize: "0.95rem",
                boxShadow: "0 8px 32px rgba(124,111,255,0.35)",
              }}
            >
              <BookOpen size={17} />
              Start Reading
            </Link>
            <Link
              href="/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 28px", borderRadius: "var(--radius-full)",
                background: "transparent", border: "1px solid var(--border-color)",
                color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem",
              }}
            >
              <PenSquare size={17} />
              Start Writing
            </Link>
          </div>

          <div
            style={{
              display: "flex", gap: 40, justifyContent: "center",
              marginTop: 56, flexWrap: "wrap",
            }}
          >
            {[
              { label: "Articles published", value: "1,000+" },
              { label: "Writers", value: "500+" },
              { label: "Readers", value: "10K+" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: "1.75rem", fontWeight: 800,
                    background: "var(--gradient-primary)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {value}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section style={{ padding: "60px 0" }}>
        <div className="container">
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)", fontSize: "0.8rem",
                color: "var(--accent-primary)", textTransform: "uppercase",
                letterSpacing: "0.15em", display: "block", marginBottom: 10,
              }}
            >
              Latest
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", fontWeight: 800,
                color: "var(--text-primary)", letterSpacing: "-0.02em",
              }}
            >
              Fresh from the Community
            </h2>
            <div className="glow-divider" style={{ margin: "14px auto 0" }} />
          </div>

          {articles.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
              }}
            >
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-muted)" }}>
              <BookOpen size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
              <p>No articles yet. Be the first to write one.</p>
            </div>
          )}

          {articles.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link
                href="/articles"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 24px", borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-color)", color: "var(--text-primary)",
                  fontWeight: 500, fontSize: "0.9rem",
                }}
              >
                View all articles →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 0 80px" }}>
        <div className="container">
          <div
            style={{
              borderRadius: "var(--radius-xl)", background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "clamp(32px, 5vw, 60px)", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 50% 0%, rgba(124,111,255,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <Users size={40} style={{ margin: "0 auto 20px", color: "var(--accent-primary)", position: "relative" }} />
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 800,
                letterSpacing: "-0.02em", marginBottom: 14, position: "relative",
              }}
            >
              Join thousands of{" "}
              <span className="gradient-text">writers &amp; readers</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)", fontSize: "1rem",
                maxWidth: 480, margin: "0 auto 28px", position: "relative",
              }}
            >
              Create your free account and start sharing your stories with the world today.
            </p>
            <Link
              href="/register"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 32px", borderRadius: "var(--radius-full)",
                background: "var(--gradient-primary)", color: "white",
                fontWeight: 600, fontSize: "1rem",
                boxShadow: "0 8px 32px rgba(124,111,255,0.35)", position: "relative",
              }}
            >
              Create free account →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

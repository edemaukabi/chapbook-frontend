import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Eye, Calendar } from "lucide-react";
import { cookies } from "next/headers";
import ArticleActions from "@/components/articles/ArticleActions";
import CommentSection from "@/components/comments/CommentSection";
import { formatDate } from "@/lib/utils";
import type { Article } from "@/types";

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Look up by slug filter — public endpoint, no auth needed for listing
    const listRes = await fetch(
      `${process.env.INTERNAL_API_URL}/articles/?slug=${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 30 },
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    );
    if (!listRes.ok) return null;

    const listData = await listRes.json();
    // ArticlesJSONRenderer wraps as { articles: { results: [...] } }
    const results: Article[] =
      listData.articles?.results ?? listData.results ?? [];
    const match = results.find((a: Article) => a.slug === slug);
    if (!match) return null;

    // Fetch full article detail by UUID for view recording and full data
    const detailRes = await fetch(
      `${process.env.INTERNAL_API_URL}/articles/${match.id}/`,
      {
        next: { revalidate: 30 },
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
      }
    );
    if (!detailRes.ok) return match; // fall back to list data

    const detailData = await detailRes.json();
    // ArticleJSONRenderer wraps as { article: {...} }
    return detailData.article ?? detailData;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      images: article.banner_image ? [article.banner_image] : [],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <div style={{ maxWidth: 768, margin: "0 auto", padding: "40px 16px 80px" }}>
      {/* Tags */}
      {article.tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {article.tags.map((tag) => (
            <Link key={tag} href={`/articles?tag=${tag}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
          marginBottom: 16,
          color: "var(--text-primary)",
        }}
      >
        {article.title}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--text-secondary)",
          lineHeight: 1.65,
          marginBottom: 28,
        }}
      >
        {article.description}
      </p>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 24,
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: 32,
        }}
      >
        <Link
          href={`/authors/${article.author_info?.id}`}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "white",
              fontSize: "0.9rem",
              flexShrink: 0,
            }}
          >
            {article.author_info?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              {article.author_info?.full_name ?? "Unknown"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Author</p>
          </div>
        </Link>

        <div style={{ width: 1, height: 32, background: "var(--border-subtle)" }} />

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <MetaStat icon={<Calendar size={14} />} value={formatDate(article.created_at)} />
          <MetaStat icon={<Clock size={14} />} value={`${article.estimated_reading_time} min read`} />
          <MetaStat icon={<Eye size={14} />} value={`${article.views} views`} />
        </div>
      </div>

      {/* Banner image */}
      {article.banner_image && (
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: 40,
          }}
        >
          <Image
            src={article.banner_image}
            alt={article.title}
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
      )}

      {/* Body */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: article.body }}
        style={{ marginBottom: 48 }}
      />

      <ArticleActions article={article} />
      <CommentSection articleId={article.id} />
    </div>
  );
}

function MetaStat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: "0.82rem",
        color: "var(--text-muted)",
      }}
    >
      {icon}
      {value}
    </span>
  );
}

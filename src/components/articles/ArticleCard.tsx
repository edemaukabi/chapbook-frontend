import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Heart, Bookmark, Star } from "lucide-react";
import type { Article } from "@/types";
import { formatRelativeDate, truncate } from "@/lib/utils";

interface Props {
  article: Article;
}

export default function ArticleCard({ article }: Props) {
  return (
    <Link href={`/articles/${article.slug}`} className="block group">
      <article
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          transition: "all var(--transition-normal)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        className="group-hover:border-[var(--border-hover)] group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lg)]"
      >
        {/* Banner image */}
        {article.banner_image && (
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16/9",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Image
              src={article.banner_image}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              style={{ objectFit: "cover", transition: "transform 0.4s ease" }}
              className="group-hover:scale-105"
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,8,16,0.6) 0%, transparent 60%)",
              }}
            />
          </div>
        )}

        {/* Content */}
        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 12,
          }}
        >
          {/* Tags */}
          {article.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {article.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title + description */}
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1.05rem",
                lineHeight: 1.4,
                color: "var(--text-primary)",
                marginBottom: 8,
                transition: "color var(--transition-fast)",
              }}
              className="group-hover:text-[var(--accent-primary)]"
            >
              {truncate(article.title, 80)}
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {article.description}
            </p>
          </div>

          {/* Author row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingTop: 8,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {article.author_info?.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              {article.author_info?.full_name ?? "Unknown"}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              ·
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {formatRelativeDate(article.created_at)}
            </span>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Stat icon={<Clock size={13} />} value={`${article.estimated_reading_time} min`} />
            <Stat icon={<Eye size={13} />} value={article.views} />
            <Stat icon={<Heart size={13} />} value={article.claps_count} />
            <Stat icon={<Bookmark size={13} />} value={article.bookmarks_count} />
            {article.average_rating && (
              <Stat
                icon={<Star size={13} />}
                value={article.average_rating.toFixed(1)}
                color="var(--accent-amber)"
              />
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Stat({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: "0.75rem",
        color: color ?? "var(--text-muted)",
      }}
    >
      {icon}
      {value}
    </span>
  );
}

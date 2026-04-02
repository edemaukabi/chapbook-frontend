import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, X as TwitterIcon } from "lucide-react";
import FollowButton from "@/components/profile/FollowButton";
import ArticleCard from "@/components/articles/ArticleCard";
import type { Profile, Article } from "@/types";

async function getProfile(id: string): Promise<Profile | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/profiles/all/?page_size=200`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data: { profiles?: Profile[]; results?: Profile[] } = await res.json();
    const profiles: Profile[] = data.profiles ?? data.results ?? [];
    return profiles.find((p) => p.id === id) ?? null;
  } catch {
    return null;
  }
}

async function getAuthorArticles(authorId: string): Promise<Article[]> {
  try {
    // Use public search endpoint filtered by author — avoids auth requirement
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/elastic/search/?author=${authorId}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data: { results?: Article[] } = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return { title: "Author not found" };
  return {
    title: `${profile.full_name} — Chapbook`,
    description: profile.about_me || `Articles by ${profile.full_name}`,
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, articles] = await Promise.all([
    getProfile(id),
    getAuthorArticles(id),
  ]);

  if (!profile) notFound();

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 16px 80px" }}>
      {/* Profile header */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-xl)",
          padding: "36px",
          marginBottom: 40,
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          {profile.profile_photo ? (
            <div style={{ width: 96, height: 96, borderRadius: "50%", overflow: "hidden" }}>
              <Image
                src={profile.profile_photo}
                alt={profile.full_name}
                width={96}
                height={96}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "white",
                fontSize: "2rem",
              }}
            >
              {profile.first_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
                {profile.full_name}
              </h1>
              {(profile.city || profile.country) && (
                <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <MapPin size={13} />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <FollowButton authorId={id} />
          </div>

          {profile.about_me && (
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.65, marginTop: 12 }}>
              {profile.about_me}
            </p>
          )}

          <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            {profile.twitter_handle && (
              <a
                href={`https://twitter.com/${profile.twitter_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem", color: "var(--accent-primary)", textDecoration: "none" }}
              >
                <TwitterIcon size={13} />
                {profile.twitter_handle}
              </a>
            )}
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {articles.length} article{articles.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Articles */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24, color: "var(--text-primary)" }}>
        Articles by {profile.first_name}
      </h2>

      {articles.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          No articles published yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

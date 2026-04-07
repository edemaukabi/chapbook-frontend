import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";
import type { Profile } from "@/types";

async function getAuthors(): Promise<Profile[]> {
  try {
    // Request a large page_size to get all profiles in one call
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/profiles/all/?page_size=200`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // ProfilesJSONRenderer wraps as { profiles: { count, results: [...] } }
    return data.profiles?.results ?? data.profiles ?? data.results ?? [];
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Authors — Chapbook",
  description: "Discover writers on Chapbook",
};

export default async function AuthorsPage() {
  const authors = await getAuthors();

  return (
    <div className="container" style={{ padding: "40px 16px 80px" }}>
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          <span className="gradient-text">Our Writers</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          {authors.length > 0
            ? `${authors.length} writers sharing their stories`
            : "Discover talented writers on Chapbook"}
        </p>
      </div>

      {authors.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
          <Users size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No authors yet</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}
    </div>
  );
}

function AuthorCard({ author }: { author: Profile }) {
  return (
    <Link
      href={`/authors/${author.id}`}
      style={{ textDecoration: "none" }}
    >
      <div className="author-card">
        {author.profile_photo ? (
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
            <Image
              src={author.profile_photo}
              alt={author.full_name}
              width={72}
              height={72}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "white",
              fontSize: "1.5rem",
              flexShrink: 0,
            }}
          >
            {author.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", marginBottom: 4 }}>
            {author.full_name}
          </p>
          {author.city && author.country && (
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 6 }}>
              {author.city}, {author.country}
            </p>
          )}
          {author.about_me && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {author.about_me}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

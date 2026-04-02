import Link from "next/link";
import { BookOpen, GitFork, X } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        padding: "40px 0 24px",
        marginTop: "auto",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 32,
            marginBottom: 32,
          }}
          className="md:grid-cols-4"
        >
          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={14} color="white" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                }}
              >
                Chapbook
              </span>
            </Link>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                maxWidth: 220,
              }}
            >
              A modern platform for writers and readers who value great
              storytelling.
            </p>
          </div>

          {/* Links */}
          <FooterCol
            title="Explore"
            links={[
              { href: "/articles", label: "Articles" },
              { href: "/authors", label: "Authors" },
              { href: "/search", label: "Search" },
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              { href: "/login", label: "Log in" },
              { href: "/register", label: "Get started" },
              { href: "/dashboard", label: "Dashboard" },
            ]}
          />
          <FooterCol
            title="Write"
            links={[
              { href: "/articles/new", label: "New article" },
              { href: "/dashboard", label: "My articles" },
            ]}
          />
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: 20,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Chapbook. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-muted)" }}
              aria-label="Twitter"
            >
              <X size={16} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--text-muted)" }}
              aria-label="GitHub"
            >
              <GitFork size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 14,
        }}
      >
        {title}
      </h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                transition: "color var(--transition-fast)",
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

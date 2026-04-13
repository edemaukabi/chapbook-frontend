import Link from "next/link";
import { BookOpen } from "lucide-react";

const EXPLORE_LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/authors", label: "Authors" },
  { href: "/search", label: "Search" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Log in" },
  { href: "/register", label: "Get started" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/articles/new", label: "Write an article" },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        marginTop: "auto",
      }}
    >
      {/* Main footer content */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 32px",
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <div style={{ flex: "1 1 220px", maxWidth: 280 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-sm)",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOpen size={15} color="white" strokeWidth={2.5} />
            </div>
            <span
              style={{
                fontWeight: 700,
                color: "var(--text-primary)",
                fontSize: "1.05rem",
                letterSpacing: "-0.01em",
              }}
            >
              Chapbook
            </span>
          </Link>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--text-muted)",
              lineHeight: 1.7,
            }}
          >
            A modern platform for writers and readers who value great
            storytelling. Write, discover, and connect.
          </p>
        </div>

        {/* Nav columns */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 40,
          }}
        >
          <FooterCol title="Explore" links={EXPLORE_LINKS} />
          <FooterCol title="Account" links={ACCOUNT_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
          © {new Date().getFullYear()} Chapbook. All rights reserved.
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
          Built for writers, by{" "}
          <a
            href="https://edemaukabi.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-attribution-link"
          >
            Edema Ukabi
          </a>
          .
        </p>
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
    <div style={{ minWidth: 130 }}>
      <h4
        style={{
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 16,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h4>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="footer-link"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

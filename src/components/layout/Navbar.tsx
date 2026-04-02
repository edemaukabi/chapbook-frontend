"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  PenSquare,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/authors", label: "Authors" },
  { href: "/search", label: "Search" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: "var(--nav-height)",
        background: scrolled ? "var(--bg-primary)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--border-color)"
          : "1px solid transparent",
        transition: "all var(--transition-normal)",
      }}
    >
      <div className="container h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-sm)",
              background: "var(--gradient-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BookOpen size={17} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Chapbook
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.9rem",
                fontWeight: isActive(href) ? 600 : 400,
                color: isActive(href)
                  ? "var(--accent-primary)"
                  : "var(--text-secondary)",
                background: isActive(href)
                  ? "rgba(124, 111, 255, 0.1)"
                  : "transparent",
                transition: "all var(--transition-fast)",
              }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <>
              {/* Write button */}
              <Link
                href="/articles/new"
                className="hidden md:flex items-center gap-2"
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--gradient-primary)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 16px rgba(124, 111, 255, 0.3)",
                  transition: "all var(--transition-fast)",
                }}
              >
                <PenSquare size={14} />
                Write
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-full)",
                    background: "var(--gradient-primary)",
                    border: "none",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {user.first_name[0].toUpperCase()}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 8px)",
                        width: 200,
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "var(--shadow-lg)",
                        overflow: "hidden",
                        zIndex: 100,
                      }}
                    >
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {user.first_name} {user.last_name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: 2,
                          }}
                        >
                          {user.email}
                        </p>
                      </div>
                      <UserMenuItem
                        href="/dashboard"
                        icon={<LayoutDashboard size={15} />}
                        label="Dashboard"
                      />
                      <UserMenuItem
                        href="/dashboard/profile"
                        icon={<User size={15} />}
                        label="Profile"
                      />
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 16px",
                          background: "transparent",
                          border: "none",
                          color: "var(--accent-secondary)",
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          transition: "background var(--transition-fast)",
                        }}
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "transparent",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  transition: "all var(--transition-fast)",
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                style={{
                  padding: "7px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--gradient-primary)",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 16px rgba(124, 111, 255, 0.3)",
                }}
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: "var(--bg-primary)",
              borderBottom: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            <div
              className="container"
              style={{
                padding: "16px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    color: isActive(href)
                      ? "var(--accent-primary)"
                      : "var(--text-secondary)",
                    fontWeight: isActive(href) ? 600 : 400,
                    background: isActive(href)
                      ? "rgba(124, 111, 255, 0.1)"
                      : "transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/articles/new"
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Write Article
                  </Link>
                  <Link
                    href="/dashboard"
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--accent-secondary)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Link
                    href="/login"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "10px",
                      borderRadius: "var(--radius-full)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "10px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--gradient-primary)",
                      color: "white",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function UserMenuItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        color: "var(--text-secondary)",
        fontSize: "0.875rem",
        transition: "all var(--transition-fast)",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

// Middleware intentionally left without auth guards.
// JWT cookies are set by the API on its own domain (cross-origin), so they are
// not visible to Next.js middleware running on the frontend domain.
// Route protection is handled client-side via useAuth() in each protected page.
export function middleware() {}

export const config = {
  matcher: [],
};

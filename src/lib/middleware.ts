/**
 * Route protection specification for /admin
 * Requests to /admin and /api/admin must verify owner authentication.
 * Unauthenticated requests receive 404 Not Found to prevent discovery.
 */
export function adminMiddleware(pathname: string, isAuthenticated: boolean) {
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!isAuthenticated) {
      return { status: 404, message: "this page wasn't saved." };
    }
    return { status: 200, allowed: true };
  }
  return { status: 200, allowed: true };
}

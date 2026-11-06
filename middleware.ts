import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

export default convexAuthNextjsMiddleware();

export const config = {
  // Only the admin area uses auth. /api/auth is the Convex Auth proxy route; the OAuth flow
  // returns to /admin/enrichments (see components/admin/enrichments-admin.tsx).
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/auth/:path*"]
};

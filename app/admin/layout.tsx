import ConvexAuthProvider from "@/components/providers/convex-auth-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

// Auth is only needed for the admin area. Keeping it out of the root layout lets public pages be cached.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexAuthProvider>{children}</ConvexAuthProvider>
    </ConvexAuthNextjsServerProvider>
  );
}

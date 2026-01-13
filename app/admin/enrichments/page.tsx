import EnrichmentsAdmin from "@/components/admin/enrichments-admin";
import { getUserEmail, isAdminEmail, ADMIN_EMAIL } from "@/lib/admin-auth";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

type AdminPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminEnrichmentsPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = await convexAuthNextjsToken();
  const user = token ? await fetchQuery(api.users.currentUser, {}, { token }) : null;
  const email = getUserEmail(user as { email?: unknown } | null);

  return (
    <EnrichmentsAdmin
      userEmail={email}
      isAuthorized={isAdminEmail(email)}
      allowedEmail={ADMIN_EMAIL}
      authError={resolvedSearchParams?.error ?? null}
    />
  );
}

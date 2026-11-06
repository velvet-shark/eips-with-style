import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import FeedbackAdmin from "@/components/admin/feedback-admin";
import { api } from "@/convex/_generated/api";
import { getUserEmail, isAdminEmail } from "@/lib/admin-auth";

// Sign-in lives on /admin/enrichments; anyone who isn't the admin is sent there.
export default async function AdminFeedbackPage() {
  const token = await convexAuthNextjsToken();
  const user = token ? await fetchQuery(api.users.currentUser, {}, { token }) : null;
  const email = getUserEmail(user as { email?: unknown } | null);

  if (!email || !isAdminEmail(email)) {
    redirect("/admin/enrichments");
  }

  return <FeedbackAdmin userEmail={email} />;
}

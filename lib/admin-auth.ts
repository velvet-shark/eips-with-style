import "server-only";

export { ADMIN_EMAIL, isAdminEmail } from "@/convex/admin_email";

type UserWithEmail = {
  email?: unknown;
} | null | undefined;

export const getUserEmail = (user: UserWithEmail): string | null => {
  if (!user) return null;

  const directEmail = typeof user.email === "string" ? user.email.trim() : "";
  return directEmail.length > 0 ? directEmail : null;
};

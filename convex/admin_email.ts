// No imports on purpose: shared with the Next.js app (lib/admin-auth.ts).
// Single source of truth for who may edit enrichments.
export const ADMIN_EMAIL = "mail@velvetshark.com";

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
};

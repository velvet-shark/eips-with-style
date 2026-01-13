import "server-only";

type UserWithEmail = {
  email?: unknown;
} | null | undefined;

export const ADMIN_EMAIL = "mail@velvetshark.com";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return normalizeEmail(email) === ADMIN_EMAIL;
};

export const getUserEmail = (user: UserWithEmail): string | null => {
  if (!user) return null;

  const directEmail = typeof user.email === "string" ? user.email.trim() : "";
  return directEmail.length > 0 ? directEmail : null;
};

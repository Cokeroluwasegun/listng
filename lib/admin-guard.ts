import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export class AdminAuthError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new AdminAuthError();
  }
  return session;
}

export function isAdmin(session: { user?: { role?: string | null } | null } | null): boolean {
  return session?.user?.role === "ADMIN";
}

export { db };
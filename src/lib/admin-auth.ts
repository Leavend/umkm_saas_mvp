import { type Session } from "next-auth";
import { getServerAuthSession } from "~/lib/auth";

const ADMIN_EMAILS = ["tiohadybayu@gmail.com"];

export async function isUserAdmin(
  session: Session | null = null,
): Promise<boolean> {
  const authSession = session ?? (await getServerAuthSession());

  if (!authSession?.user?.email) {
    return false;
  }

  return ADMIN_EMAILS.includes(authSession.user.email);
}

export async function requireAdmin(): Promise<Session> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const isAdmin = await isUserAdmin(session);

  if (!isAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized: Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden: Admin access required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

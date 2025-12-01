import { NextResponse, type NextRequest } from "next/server";
import { getServerAuthSession } from "~/lib/auth";
import { migrateGuestSessionToUser } from "~/server/repositories/guest-repository";
import { getGuestSessionCredentials } from "~/server/auth/guest-session";
import {
  ensureDailyCreditForGuest,
  validateGuestSessionCredentials,
} from "~/server/services/guest-session-service";
import {
  NotFoundError,
  UnauthorizedError,
  logError,
  toError,
} from "~/lib/errors";
import {
  GUEST_ACCESS_TOKEN_COOKIE,
  GUEST_FINGERPRINT_COOKIE,
  GUEST_SESSION_COOKIE,
  GUEST_SESSION_SECRET_COOKIE,
} from "~/server/auth/guest-session";

// ... imports

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No authenticated user found" },
        { status: 401 },
      );
    }

    const guestCredentials = await getGuestSessionCredentials(request.headers);
    if (!guestCredentials.sessionId) {
      return NextResponse.json({
        success: true,
        message: "No guest session to migrate",
        migrated: false,
      });
    }

    const guestSession = await validateGuest(request, guestCredentials);
    if (!guestSession) {
      return createExpiredSessionResponse();
    }

    const migrationResult = await migrateGuestSessionToUser(
      guestSession.id,
      userId,
    );

    logMigration(guestSession.id, userId, migrationResult.transferredCredits);

    const response = NextResponse.json({
      success: true,
      message: "Guest session migrated successfully",
      migrated: true,
      transferredCredits: migrationResult.transferredCredits,
      transferredProjects: migrationResult.transferredProjects,
    });

    clearGuestCookies(response);
    return response;
  } catch (error: unknown) {
    logError("Guest migration failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to migrate guest session. Your account was created but guest data may not have transferred.",
      },
      { status: 500 },
    );
  }
}

async function getAuthenticatedUserId() {
  const session = await getServerAuthSession();
  return session?.user?.id;
}

async function validateGuest(request: NextRequest, guestCredentials: any) {
  try {
    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const guestSession = await validateGuestSessionCredentials({
      ...guestCredentials,
      ipAddress,
      userAgent,
    });
    await ensureDailyCreditForGuest(guestSession.id);
    return guestSession;
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      return null;
    }
    throw toError(error);
  }
}

function createExpiredSessionResponse() {
  const response = NextResponse.json({
    success: true,
    message: "Guest session expired before migration",
    migrated: false,
  });
  clearGuestCookies(response);
  return response;
}

function logMigration(guestSessionId: string, userId: string, credits: number) {
  console.log("Guest migrated:", { guestSessionId, userId, credits });
}

function clearGuestCookies(response: NextResponse) {
  response.cookies.delete(GUEST_SESSION_COOKIE);
  response.cookies.delete(GUEST_ACCESS_TOKEN_COOKIE);
  response.cookies.delete(GUEST_SESSION_SECRET_COOKIE);
  response.cookies.delete(GUEST_FINGERPRINT_COOKIE);
}

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

export async function POST(request: NextRequest) {
  try {
    // Get the current session (user just signed up)
    const session = await getServerAuthSession();

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No authenticated user found" },
        { status: 401 },
      );
    }

    // Get guest session ID from cookies
    const guestCredentials = await getGuestSessionCredentials(request.headers);

    if (!guestCredentials.sessionId) {
      return NextResponse.json({
        success: true,
        message: "No guest session to migrate",
        migrated: false,
      });
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      undefined;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    let guestSession: Awaited<
      ReturnType<typeof validateGuestSessionCredentials>
    > | null = null;
    try {
      guestSession = await validateGuestSessionCredentials({
        ...guestCredentials,
        ipAddress,
        userAgent,
      });
      // Ensure guest session has latest credits before migration
      await ensureDailyCreditForGuest(guestSession.id);
    } catch (error: unknown) {
      if (
        error instanceof NotFoundError ||
        error instanceof UnauthorizedError
      ) {
        const response = NextResponse.json({
          success: true,
          message: "Guest session expired before migration",
          migrated: false,
        });

        response.cookies.delete(GUEST_SESSION_COOKIE);
        response.cookies.delete(GUEST_ACCESS_TOKEN_COOKIE);
        response.cookies.delete(GUEST_SESSION_SECRET_COOKIE);
        response.cookies.delete(GUEST_FINGERPRINT_COOKIE);

        return response;
      }

      throw toError(error);
    }

    if (!guestSession) {
      return NextResponse.json({
        success: true,
        message: "Guest session expired before migration",
        migrated: false,
      });
    }

    // Migrate guest session to user
    const migrationResult = await migrateGuestSessionToUser(
      guestSession.id,
      userId,
    );

    const response = NextResponse.json({
      success: true,
      message: "Guest session migrated successfully",
      migrated: true,
      transferredCredits: migrationResult.transferredCredits,
      transferredProjects: migrationResult.transferredProjects,
    });

    // Clear the guest session cookie
    response.cookies.delete(GUEST_SESSION_COOKIE);
    response.cookies.delete(GUEST_ACCESS_TOKEN_COOKIE);
    response.cookies.delete(GUEST_SESSION_SECRET_COOKIE);
    response.cookies.delete(GUEST_FINGERPRINT_COOKIE);

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

/**
 * API route for managing guest sessions
 * Creates or renews guest sessions with proper cookie management
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ensureDailyCreditForGuest,
  ensureGuestSession,
  GUEST_SESSION_MAX_AGE_SECONDS,
} from "~/server/services/guest-session-service";
import { AppError, logError } from "~/lib/errors";
import {
  GUEST_ACCESS_TOKEN_COOKIE,
  GUEST_FINGERPRINT_COOKIE,
  GUEST_SESSION_COOKIE,
  GUEST_SESSION_SECRET_COOKIE,
} from "~/server/auth/guest-session";

export async function POST(request: NextRequest) {
  try {
    // Extract client information for session security
    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    // Extract existing session data from cookies
    const existingSessionCookie = request.cookies.get(GUEST_SESSION_COOKIE);
    const existingSessionId = existingSessionCookie?.value ?? undefined;
    const existingAccessToken =
      request.cookies.get(GUEST_ACCESS_TOKEN_COOKIE)?.value ?? undefined;
    const existingSessionSecret =
      request.cookies.get(GUEST_SESSION_SECRET_COOKIE)?.value ?? undefined;
    const existingFingerprint =
      request.cookies.get(GUEST_FINGERPRINT_COOKIE)?.value ?? undefined;

    // Ensure guest session exists or create new one
    const ensureResult = await ensureGuestSession({
      sessionId: existingSessionId,
      accessToken: existingAccessToken,
      sessionSecret: existingSessionSecret,
      fingerprint: existingFingerprint,
      ipAddress,
      userAgent,
    });

    const session = ensureResult.session;
    const { id: sessionId, accessToken, sessionSecret, fingerprint } = session;

    // Ensure daily credits for the guest
    const { credits } = await ensureDailyCreditForGuest(sessionId);

    // Prepare response with session data
    const response = NextResponse.json({
      guestSessionId: sessionId,
      credits,
    });

    // Set secure cookies based on environment
    const secure = process.env.NODE_ENV === "production";
    const maxAge = GUEST_SESSION_MAX_AGE_SECONDS;
    const cookieOptions = {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      maxAge,
      path: "/",
    };

    // Set all necessary cookies for guest session
    response.cookies.set(GUEST_SESSION_COOKIE, sessionId, cookieOptions);
    response.cookies.set(GUEST_ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
    response.cookies.set(
      GUEST_SESSION_SECRET_COOKIE,
      sessionSecret,
      cookieOptions,
    );

    // Fingerprint cookie can be accessed by client-side scripts
    response.cookies.set(GUEST_FINGERPRINT_COOKIE, fingerprint, {
      ...cookieOptions,
      httpOnly: false,
    });

    return response;
  } catch (error: unknown) {
    // Handle application-specific errors
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Handle unexpected errors
    logError("Failed to create or renew guest session", error);
    return NextResponse.json(
      { error: "Failed to create guest session" },
      { status: 500 },
    );
  }
}

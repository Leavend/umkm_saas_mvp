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
    const ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const existingSessionCookie = request.cookies.get(GUEST_SESSION_COOKIE);
    const existingSessionId = existingSessionCookie?.value ?? undefined;
    const existingAccessToken =
      request.cookies.get(GUEST_ACCESS_TOKEN_COOKIE)?.value ?? undefined;
    const existingSessionSecret =
      request.cookies.get(GUEST_SESSION_SECRET_COOKIE)?.value ?? undefined;
    const existingFingerprint =
      request.cookies.get(GUEST_FINGERPRINT_COOKIE)?.value ?? undefined;

    const ensureResult = await ensureGuestSession({
      sessionId: existingSessionId,
      accessToken: existingAccessToken,
      sessionSecret: existingSessionSecret,
      fingerprint: existingFingerprint,
      ipAddress,
      userAgent,
    });

    const session = ensureResult.session;
    const {
      id: sessionId,
      accessToken,
      sessionSecret,
      fingerprint,
    }: {
      id: string;
      accessToken: string;
      sessionSecret: string;
      fingerprint: string;
    } = session;

    const { credits } = await ensureDailyCreditForGuest(sessionId);

    // Set cookie for guest session
    const response = NextResponse.json({
      guestSessionId: sessionId,
      credits,
    });

    const secure = process.env.NODE_ENV === "production";
    const maxAge = GUEST_SESSION_MAX_AGE_SECONDS;

    response.cookies.set(GUEST_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    response.cookies.set(GUEST_ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    response.cookies.set(GUEST_SESSION_SECRET_COOKIE, sessionSecret, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    response.cookies.set(GUEST_FINGERPRINT_COOKIE, fingerprint, {
      httpOnly: false,
      secure,
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logError("Failed to create or renew guest session", error);
    return NextResponse.json(
      { error: "Failed to create guest session" },
      { status: 500 },
    );
  }
}

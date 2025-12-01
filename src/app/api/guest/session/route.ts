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

// ... imports

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, userAgent } = extractClientInfo(request);
    const existingSession = extractSessionData(request);

    // Ensure guest session exists or create new one
    const ensureResult = await ensureGuestSession({
      ...existingSession,
      ipAddress,
      userAgent,
    });

    const { id: sessionId, credits } =
      await getSessionWithCredits(ensureResult);

    // Prepare response with session data
    const response = NextResponse.json({
      guestSessionId: sessionId,
      credits,
    });

    setSessionCookies(response, ensureResult.session);

    // Track guest creation if it's a new session
    if (ensureResult.created) {
      console.log("Guest created:", { sessionId });
    }

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

function extractClientInfo(request: NextRequest) {
  return {
    ipAddress:
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown",
    userAgent: request.headers.get("user-agent") ?? "unknown",
  };
}

function extractSessionData(request: NextRequest) {
  return {
    sessionId: request.cookies.get(GUEST_SESSION_COOKIE)?.value,
    accessToken: request.cookies.get(GUEST_ACCESS_TOKEN_COOKIE)?.value,
    sessionSecret: request.cookies.get(GUEST_SESSION_SECRET_COOKIE)?.value,
    fingerprint: request.cookies.get(GUEST_FINGERPRINT_COOKIE)?.value,
  };
}

async function getSessionWithCredits(
  ensureResult: Awaited<ReturnType<typeof ensureGuestSession>>,
) {
  const session = ensureResult.session;
  const { credits } = await ensureDailyCreditForGuest(session.id);
  return { id: session.id, credits };
}

function setSessionCookies(response: NextResponse, session: any) {
  const secure = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    maxAge: GUEST_SESSION_MAX_AGE_SECONDS,
    path: "/",
  };

  response.cookies.set(GUEST_SESSION_COOKIE, session.id, cookieOptions);
  response.cookies.set(
    GUEST_ACCESS_TOKEN_COOKIE,
    session.accessToken,
    cookieOptions,
  );
  response.cookies.set(
    GUEST_SESSION_SECRET_COOKIE,
    session.sessionSecret,
    cookieOptions,
  );
  response.cookies.set(GUEST_FINGERPRINT_COOKIE, session.fingerprint, {
    ...cookieOptions,
    httpOnly: false,
  });
}

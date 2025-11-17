/**
 * Enhanced callback route that handles OAuth flows for iframe-based modal
 * Delegates to better-auth handler for proper OAuth callback processing
 * then redirects to auth-success page for postMessage communication
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { logError } from "~/lib/errors";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    // Check if this is an OAuth callback (has code parameter)
    const isOAuthCallback = searchParams.has("code");

    // Process the auth callback using better-auth
    const response = await auth.handler(req);

    // If this was an OAuth callback and successful (status 302 redirect)
    // Always redirect to our success page for iframe/popup communication
    if (
      isOAuthCallback &&
      (response.status === 302 || response.status === 307)
    ) {
      // Redirect to auth-success page which will handle postMessage
      const redirectUrl = new URL("/auth-success", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    logError("Better-auth callback error", error);

    // Handle errors with proper redirect
    const errorParam = searchParams.get("error");

    const errorUrl = errorParam
      ? `/auth/error?error=${encodeURIComponent(errorParam)}`
      : "/auth/error?error=authentication_failed";

    return NextResponse.redirect(new URL(errorUrl, req.url));
  }
}

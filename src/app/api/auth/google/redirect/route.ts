// src/app/api/auth/google/redirect/route.ts
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPopup = searchParams.get("popup") === "true";
  const state = searchParams.get("state");

  try {
    // Build direct Google OAuth URL (not using better-auth for popup flow)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google Client ID not configured");
    }

    const baseUrl = new URL(req.url).origin;
    // Temporary fix: use the same callback for both popup and regular flow
    // until popup-callback is added to Google Console
    const callbackUrl = `${baseUrl}/api/auth/callback`;

    // Use the exact Google OAuth endpoint structure you showed
    const googleAuthParams = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "openid https://www.googleapis.com/auth/userinfo.email profile",
      access_type: "offline",
      prompt: "select_account",
      ...(state && { state }),
    });

    // Use the oauthchooseaccount endpoint like in your example
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth/oauthchooseaccount?${googleAuthParams.toString()}`;

    // Direct redirect to Google OAuth
    return Response.redirect(googleAuthUrl);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";

    if (isPopup) {
      // Return HTML that will close popup and send error message
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: '${errorMessage}'
              }, '${new URL(req.url).origin}');
              window.close();
            </script>
            <p>Authentication failed. This window should close automatically.</p>
          </body>
        </html>
      `,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    // For non-popup, redirect with error
    return Response.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(errorMessage)}`, req.url),
    );
  }
}

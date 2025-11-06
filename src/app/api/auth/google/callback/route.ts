// Callback route for both popup and standard OAuth flows
import type { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPopup = searchParams.get("popup") === "true";

  try {
    // Use the better-auth handler directly with the request
    const response = await auth.handler(req);

    // If this is a popup flow, return HTML that posts message to parent
    if (isPopup) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Success</title></head>
        <body>
          <script>
            try {
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS'
              }, window.location.origin);
              window.close();
            } catch (e) {
              console.error('Failed to communicate with parent window:', e);
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // For non-popup flows, return the standard response
    if (response instanceof Response) {
      return response;
    }

    // Fallback if response is not a Response object
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";

    // If this is a popup flow, return HTML that posts error message to parent
    if (isPopup) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            try {
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: '${errorMessage.replace(/'/g, "\\'")}'
              }, window.location.origin);
              window.close();
            } catch (e) {
              console.error('Failed to communicate with parent window:', e);
            }
          </script>
          <p>Authentication failed: ${errorMessage}</p>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    // For non-popup flows, redirect to error page
    return Response.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(errorMessage)}`, req.url),
    );
  }
}

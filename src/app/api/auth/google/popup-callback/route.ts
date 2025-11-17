// src/app/api/auth/google/popup-callback/route.ts
import type { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(req: NextRequest) {
  // Delegate to better-auth handler which properly handles OAuth callbacks
  try {
    const response = await auth.handler(req);
    return response;
  } catch (error) {
    console.error("Better-auth handler error:", error);

    // Fallback error response
    const { searchParams } = new URL(req.url);
    const errorParam = searchParams.get("error");

    if (errorParam) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: '${errorParam.replace(/'/g, "\\'")}'
            }, '${new URL(req.url).origin}');
            window.close();
          </script>
          <p>Authentication failed: ${errorParam}</p>
        </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
          status: 400,
        },
      );
    }

    return new Response(
      `<!DOCTYPE html>
      <html>
      <head><title>Authentication Error</title></head>
      <body>
        <script>
          window.opener?.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'Authentication processing failed'
          }, '${new URL(req.url).origin}');
          window.close();
        </script>
        <p>Authentication failed. This window should close automatically.</p>
      </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html" },
        status: 500,
      },
    );
  }
}

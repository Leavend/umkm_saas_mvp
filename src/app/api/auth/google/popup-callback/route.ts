// src/app/api/auth/google/popup-callback/route.ts
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'Authentication was denied or failed'
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

  if (!code) {
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body>
          <script>
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_ERROR',
              error: 'No authorization code received'
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

  try {
    // Parse state to get redirect info
    let redirectTo = "/";
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state)) as {
          redirectTo?: string;
        };
        redirectTo = stateData.redirectTo ?? "/";
      } catch {
        // Ignore state parsing errors
      }
    }

    // Exchange authorization code for tokens and create session
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri:
          new URL(req.url).origin + "/api/auth/google/popup-callback",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange authorization code for tokens");
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      id_token: string;
    };

    // Verify and decode the ID token
    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    // TODO: Create session using your auth system
    // For now we'll use a placeholder that could integrate with better-auth
    // You might want to call your existing session creation logic here
    console.log("Google user authenticated:", {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body>
          <script>
            // Notify parent window of successful authentication
            window.opener?.postMessage({
              type: 'GOOGLE_AUTH_SUCCESS',
              redirectTo: '${redirectTo}'
            }, '${new URL(req.url).origin}');
            
            // Close popup after a short delay
            setTimeout(() => {
              window.close();
            }, 500);
          </script>
          <div style="text-align: center; font-family: Arial, sans-serif; margin-top: 50px;">
            <h2>✅ Login Berhasil!</h2>
            <p>Tab ini akan tertutup otomatis...</p>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Authentication processing failed";

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
        status: 500,
      },
    );
  }
}

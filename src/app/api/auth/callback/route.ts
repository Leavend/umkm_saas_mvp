// Enhanced callback route that handles both popup and regular flow
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  // Detect if this is a popup flow based on state
  let isPopup = false;
  let redirectTo = "/";

  if (state) {
    try {
      const stateData = JSON.parse(decodeURIComponent(state)) as {
        redirectTo?: string;
        isPopup?: boolean;
      };
      isPopup = stateData.isPopup ?? false;
      redirectTo = stateData.redirectTo ?? "/";
    } catch {
      // Ignore state parsing errors
    }
  }

  if (error) {
    if (isPopup) {
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
    } else {
      return Response.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}`, req.url),
      );
    }
  }

  if (!code) {
    const errorMsg = "No authorization code received";
    if (isPopup) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Error</title></head>
          <body>
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_ERROR',
                error: '${errorMsg}'
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
    } else {
      return Response.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(errorMsg)}`, req.url),
      );
    }
  }

  try {
    // Debug: Log environment check
    console.log("🔍 Environment check:");
    console.log(
      "- NEXT_PUBLIC_GOOGLE_CLIENT_ID:",
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "✅ SET" : "❌ NOT SET",
    );
    console.log(
      "- GOOGLE_OAUTH_CLIENT_SECRET:",
      process.env.GOOGLE_OAUTH_CLIENT_SECRET ? "✅ SET" : "❌ NOT SET",
    );

    // Check if environment variables exist
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

    if (!clientId) {
      throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
    }

    if (!clientSecret) {
      throw new Error(
        "Missing GOOGLE_OAUTH_CLIENT_SECRET - Please add it to .env.local",
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: new URL(req.url).origin + "/api/auth/callback",
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
    console.log("Google user authenticated:", {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });

    if (isPopup) {
      // Return success page for popup
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Authentication Successful</title></head>
          <body>
            <script>
              window.opener?.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                redirectTo: '${redirectTo}'
              }, '${new URL(req.url).origin}');
              
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
    } else {
      // Regular flow: redirect to intended page
      return Response.redirect(new URL(redirectTo, req.url));
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Authentication processing failed";

    if (isPopup) {
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
    } else {
      return Response.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(errorMessage)}`,
          req.url,
        ),
      );
    }
  }
}

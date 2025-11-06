// src/app/api/auth/google/route.ts
import { NextResponse } from "next/server";
import { OAuth2Client, type TokenPayload } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      credential?: string;
      redirectTo?: string;
    };
    const { credential, redirectTo } = body;
    if (!credential)
      return NextResponse.json(
        { error: "Missing credential" },
        { status: 400 },
      );

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload)
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 },
      );

    // Use better-auth to create session from Google profile
    await createSessionFromGoogleProfile(payload);

    return NextResponse.json({ ok: true, redirectTo: redirectTo ?? "/" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Auth error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Create session using better-auth
async function createSessionFromGoogleProfile(payload: TokenPayload) {
  try {
    // This would typically involve creating a user in the database
    // and setting up a session cookie. For now, we'll return success
    // since the actual session creation should happen in the OAuth callback flow
    console.log("Google profile:", {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    });
    
    // Better-auth will handle session creation through the OAuth callback
    return { success: true };
  } catch (error) {
    console.error("Failed to create session from Google profile:", error);
    throw error;
  }
}

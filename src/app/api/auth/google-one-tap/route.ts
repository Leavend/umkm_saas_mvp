// src/app/api/auth/google-one-tap/route.ts
// Handle Google One Tap ID token exchange
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { db } from "~/server/db";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { credential: string; callbackURL?: string };
    const { credential: idToken, callbackURL = "/" } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing ID token" },
        { status: 400 }
      );
    }

    // Verify the ID token with Google
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return NextResponse.json(
        { error: "Invalid Google ID token" },
        { status: 401 }
      );
    }

    // Create or update user in database using Prisma
    let user = await db.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          id: crypto.randomUUID(),
          email: payload.email,
          name: payload.name ?? "",
          image: payload.picture ?? null,
          // Set initial credits for new user
          credits: 10,
          lastDailyCreditAt: new Date(),
        },
      });
    } else {
      // Update existing user info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          name: payload.name ?? user.name,
          image: payload.picture ?? user.image,
        },
      });
    }

    // Create a session for the user
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Create session in database
    await db.session.create({
      data: {
        id: sessionId,
        token: sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set session cookie and redirect
    const baseUrl = new URL(req.url).origin;
    const redirectUrl = new URL(callbackURL, baseUrl);
    
    const response = NextResponse.redirect(
      redirectUrl,
      { status: 302 }
    );
    
    response.cookies.set("better-auth.session_token", sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Google One Tap error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
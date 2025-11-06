/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type NextRequest, NextResponse } from "next/server";

interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { credential }: { credential: string } = body;

    // Verify the Google JWT token
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
    );
    const payload = (await response.json()) as GooglePayload;

    if (!payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Here you would create/update user in database and create session
    // For now, just return success
    console.log("Google user:", payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

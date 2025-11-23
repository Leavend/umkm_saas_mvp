import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { guestSessionToken } = body as { guestSessionToken?: string };

    if (!guestSessionToken) {
      return NextResponse.json(
        { error: "Guest session token required" },
        { status: 400 },
      );
    }

    // Find guest session
    const guestSession = await db.guestSession.findUnique({
      where: { accessToken: guestSessionToken },
    });

    if (!guestSession) {
      return NextResponse.json(
        { error: "Guest session not found" },
        { status: 404 },
      );
    }

    // Transfer guest credits to authenticated user
    await db.user.update({
      where: { id: session.user.id },
      data: {
        credits: {
          increment: guestSession.credits,
        },
      },
    });

    // Delete guest session
    await db.guestSession.delete({
      where: { id: guestSession.id },
    });

    return NextResponse.json({
      success: true,
      migratedCredits: guestSession.credits,
    });
  } catch (error) {
    console.error("[migrate-guest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

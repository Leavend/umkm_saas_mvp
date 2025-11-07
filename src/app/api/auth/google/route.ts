// src/app/api/auth/google/route.ts
// This route is no longer needed as better-auth handles Google OAuth
// through the standard callback flow. This file can be safely removed.
import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({ 
        error: "This endpoint is deprecated. Use better-auth standard OAuth flow." 
    }, { status: 410 }); // Gone status
}

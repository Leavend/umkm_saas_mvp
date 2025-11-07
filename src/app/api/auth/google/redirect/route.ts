// src/app/api/auth/google/redirect/route.ts
// Redirect route that forwards to better-auth's Google OAuth flow
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // Extract parameters from the URL
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirect_to") ?? "/";
  
  // Build the redirect URL to better-auth's Google OAuth endpoint
  const baseUrl = new URL(req.url).origin;
  const redirectUrl = `${baseUrl}/api/auth/callback/google?redirect_to=${encodeURIComponent(redirectTo)}`;
  
  // Redirect to better-auth's OAuth flow
  return Response.redirect(redirectUrl, 302);
}
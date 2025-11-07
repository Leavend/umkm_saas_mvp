// Enhanced callback route that handles both popup and regular flow
import type { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(req: NextRequest) {
  // Delegate to better-auth handler which properly handles all OAuth callbacks
  try {
    return await auth.handler(req);
  } catch (error) {
    console.error("Better-auth handler error:", error);
    
    // Fallback error handling
    const { searchParams } = new URL(req.url);
    const errorParam = searchParams.get("error");
    
    if (errorParam) {
      return Response.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(errorParam)}`, req.url)
      );
    }
    
    return Response.redirect(
      new URL("/auth/error?error=authentication_failed", req.url)
    );
  }
}
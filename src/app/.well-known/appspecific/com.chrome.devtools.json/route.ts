import { NextResponse } from "next/server";

export async function GET() {
  // Chrome DevTools is looking for this file
  // Return a 404 since we don't have any specific devtools configuration
  return new NextResponse(null, { status: 404 });
}

/**
 * API route for ImageKit upload authentication
 * Generates secure upload credentials for client-side image uploads
 */
import { getUploadAuthParams } from "@imagekit/next/server";
import { env } from "~/env";
import { logError } from "~/lib/errors";

export async function GET() {
  try {
    // Generate secure upload parameters for ImageKit
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      // expire: 30 * 60, // Optional: 30 minutes expiry (default is 1 hour)
    });

    return Response.json({
      token,
      expire,
      signature,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    logError("Upload auth error", error);
    return Response.json(
      { error: "Failed to generate upload credentials" },
      { status: 500 },
    );
  }
}

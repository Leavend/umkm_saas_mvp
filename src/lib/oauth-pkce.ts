// src/lib/oauth-pkce.ts

/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth2
 * Implements RFC 7636 for secure authorization code flow
 */

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Base64 URL encode (without padding)
 */
function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate SHA-256 hash
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

/**
 * Generate PKCE code verifier and challenge
 * @returns Object with verifier and challenge
 */
export async function generatePKCE(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  // Generate code verifier (43-128 characters)
  const codeVerifier = generateRandomString(64);

  // Generate code challenge (SHA-256 hash of verifier)
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(hashed);

  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Store PKCE verifier in sessionStorage for later use
 */
export function storePKCEVerifier(state: string, verifier: string): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`pkce_verifier_${state}`, verifier);
  }
}

/**
 * Retrieve and remove PKCE verifier from sessionStorage
 */
export function getPKCEVerifier(state: string): string | null {
  if (typeof window === "undefined") return null;

  const key = `pkce_verifier_${state}`;
  const verifier = sessionStorage.getItem(key);

  if (verifier) {
    sessionStorage.removeItem(key);
  }

  return verifier;
}

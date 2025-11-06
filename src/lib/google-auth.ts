// src/lib/google-auth.ts
"use client";

// authClient import removed as it's not used in popup flow

interface GoogleSignInOptions {
  redirectTo: string;
}

export async function initiateGoogleSignIn({
  redirectTo,
}: GoogleSignInOptions): Promise<void> {
  if (typeof window === "undefined")
    throw new Error(
      "Google authentication can only be initiated in the browser.",
    );

  return new Promise<void>((resolve, reject) => {
    // Create popup window for Google Auth
    const authUrl = buildGooglePopupAuthUrl(redirectTo);
    const popup = window.open(
      authUrl,
      "google-auth-popup",
      "width=500,height=600,scrollbars=yes,resizable=yes,status=yes,titlebar=yes,toolbar=no,menubar=no,location=no,left=" +
        (window.screen.width / 2 - 250) +
        ",top=" +
        (window.screen.height / 2 - 300),
    );

    if (!popup) {
      reject(
        new Error("Popup diblokir. Silakan izinkan popup untuk situs ini."),
      );
      return;
    }

    // Check if popup is closed manually (handle COOP policy)
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error("Autentikasi dibatalkan oleh pengguna."));
        }
      } catch {
        // Cross-Origin-Opener-Policy error is expected, ignore it
        // This happens when popup navigates to Google's domain
      }
    }, 1000);

    // Listen for messages from popup
    const handleMessage = (
      event: MessageEvent<{ type: string; error?: string }>,
    ) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
        clearInterval(checkClosed);
        try {
          popup.close();
        } catch {
          // Handle COOP policy error when closing popup
          console.log("Popup auto-closed due to COOP policy");
        }
        window.removeEventListener("message", handleMessage);

        // Don't auto-redirect here, let the parent page handle it
        // This gives better control over the UX flow
        resolve();
      } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
        clearInterval(checkClosed);
        try {
          popup.close();
        } catch {
          // Handle COOP policy error when closing popup
          console.log("Popup auto-closed due to COOP policy");
        }
        window.removeEventListener("message", handleMessage);
        reject(new Error(event.data.error ?? "Autentikasi Google gagal"));
      }
    };

    window.addEventListener("message", handleMessage);

    // Cleanup after 5 minutes
    setTimeout(
      () => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          reject(new Error("Autentikasi timeout (5 menit)"));
        }
      },
      5 * 60 * 1000,
    );
  });
}

function buildGooglePopupAuthUrl(redirectTo: string): string {
  const baseUrl = window.location.origin;

  // Encode the redirect info in state parameter
  const state = encodeURIComponent(
    JSON.stringify({
      redirectTo,
      isPopup: true,
    }),
  );

  const params = new URLSearchParams({
    redirect_to: redirectTo,
    popup: "true",
    state: state,
  });

  return `${baseUrl}/api/auth/google/redirect?${params.toString()}`;
}

/**
 * Exchange an ID token (from GIS) with your backend to create a session.
 */
export async function exchangeGoogleIdToken(
  credential: string,
  redirectTo: string,
): Promise<void> {
  const res = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, redirectTo }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Failed to sign in with Google credential.");
  }
}

// src/lib/gsi-client.ts
"use client";

interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: { credential?: string }) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      context?: string;
    }) => void;
    renderButton: (
      element: HTMLElement,
      config: {
        type?: string;
        theme?: string;
        size?: string;
        text?: string;
        shape?: string;
        logo_alignment?: string;
      },
    ) => void;
    prompt: () => void;
  };
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts;
    };
  }
}

export async function loadGsiClient(): Promise<
  NonNullable<typeof window.google>
> {
  if (typeof window === "undefined")
    throw new Error("GIS must run in the browser.");
  if (window.google?.accounts?.id) return window.google;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  if (!window.google?.accounts?.id)
    throw new Error("Failed to load Google Identity Services.");
  return window.google;
}

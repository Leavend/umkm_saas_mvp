// src/hooks/use-google-one-tap.ts

"use client";

import { useEffect, useRef } from "react";
import { loadGsiClient } from "~/lib/gsi-client";

export interface UseGoogleOneTapOptions {
  /** If provided, GIS will render the official button into this element. */
  renderTarget?: HTMLElement | null;
  /** Whether to auto prompt One Tap (default true). */
  autoPrompt?: boolean;
  /** Called with the raw ID token (JWT) from Google. */
  onCredential?: (credential: string) => void;
  /** Called on any initialization / runtime error. */
  onError?: (err: Error) => void;
}

export function useGoogleOneTap({
  renderTarget,
  autoPrompt = true,
  onCredential,
  onError,
}: UseGoogleOneTapOptions) {
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const google = await loadGsiClient();
        if (cancelled || initialized.current) return;

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");

        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential?: string }) => {
            if (response.credential) onCredential?.(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
        });

        // Render official button if a target is provided
        if (renderTarget) {
          google.accounts.id.renderButton(renderTarget, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            logo_alignment: "left",
          });
        }

        // Trigger One Tap prompt if desired
        if (autoPrompt) {
          google.accounts.id.prompt();
        }

        initialized.current = true;
      } catch (e) {
        onError?.(e as Error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [renderTarget, autoPrompt, onCredential, onError]);
}

// src/lib/auth-popup.ts

/**
 * Authentication popup utilities
 * Handles opening OAuth popup windows with device-specific configurations
 */

/**
 * Popup window configuration constants
 */
export const POPUP_CONFIG = {
  desktop: {
    width: 600,
    height: 700,
    features:
      "menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes",
  },
  mobile: {
    // Mobile uses default new tab (no custom size)
  },
} as const;

/**
 * Calculate centered position for popup window
 * @param width - Window width
 * @param height - Window height
 * @returns Object with left and top positions
 */
function getCenteredPosition(width: number, height: number) {
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);
  return { left, top };
}

/**
 * Open authentication popup window
 * - Desktop: Centered popup with custom size (600x700)
 * - Mobile: New tab (native behavior)
 *
 * @param url - OAuth URL to open
 * @param isMobile - Whether user is on mobile device
 * @returns Window reference or null if popup was blocked
 *
 * @example
 * const popup = openAuthPopup(oauthUrl, isMobile);
 * if (!popup) {
 *   toast.error('Popup blocked. Please allow popups.');
 * }
 */
export function openAuthPopup(url: string, isMobile: boolean): Window | null {
  if (isMobile) {
    // Mobile: open in new tab without custom dimensions
    return window.open(url, "_blank");
  }

  // Desktop: centered popup with custom size
  const { width, height, features } = POPUP_CONFIG.desktop;
  const { left, top } = getCenteredPosition(width, height);

  const windowFeatures = `${features},width=${width},height=${height},left=${left},top=${top}`;

  return window.open(url, "google-auth-popup", windowFeatures);
}

/**
 * Check if popup was blocked
 * @param popup - Window reference from window.open
 * @returns True if popup was blocked
 */
export function isPopupBlocked(popup: Window | null): boolean {
  if (!popup) return true;

  try {
    return popup.closed;
  } catch {
    return true;
  }
}

/**
 * Focus popup window if it exists and is not closed
 * @param popup - Window reference
 */
export function focusPopup(popup: Window | null): void {
  if (popup && !popup.closed) {
    try {
      popup.focus();
    } catch {
      // Ignore focus errors (cross-origin restrictions)
    }
  }
}

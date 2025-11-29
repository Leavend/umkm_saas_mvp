import posthog from "posthog-js";

// Initialize PostHog on client side only
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    person_profiles: "identified_only", // Only track identified users
    capture_pageview: false, // We'll manually track pageviews
    capture_pageleave: true,
    autocapture: false, // Manual tracking for better control
  });
}

/**
 * Track analytics events
 * @param event Event name (e.g., 'prompt_viewed', 'payment_success')
 * @param properties Event properties
 */
export function trackEvent(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window !== "undefined") {
    posthog.capture(event, properties);
  }
}

/**
 * Identify a user for tracking
 * @param userId Unique user identifier
 * @param properties User properties (email, name, etc.)
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window !== "undefined") {
    posthog.identify(userId, properties);
  }
}

/**
 * Reset user identification (on logout)
 */
export function resetUser(): void {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
}

/**
 * Track page view manually
 */
export function trackPageView(path?: string): void {
  if (typeof window !== "undefined") {
    posthog.capture("$pageview", {
      $current_url: path || window.location.href,
    });
  }
}

// Export posthog instance for advanced usage
export { posthog };

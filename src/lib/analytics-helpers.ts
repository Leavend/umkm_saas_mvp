// Analytics helper functions for consistent event tracking
import { trackEvent } from "./analytics";

// Purchase Funnel Events
export function trackTopUpOpened(credits: number, trigger: string) {
  trackEvent("top_up_modal_opened", { credits, trigger });
}

export function trackPackageSelected(
  packageId: string,
  amount: number,
  credits: number,
) {
  trackEvent("package_selected", { packageId, amount, credits });
}

export function trackXenditRedirect(invoiceId: string, amount: number) {
  trackEvent("xendit_redirected", { invoiceId, amount });
}

export function trackPaymentSuccess(
  userId: string,
  amount: number,
  credits: number,
) {
  trackEvent("payment_success", { userId, amount, credits });
}

// User Lifecycle Events
export function trackUserSignup(provider: string, userId: string) {
  trackEvent("user_signed_up", { provider, userId });
}

export function trackGuestCreated(sessionId: string) {
  trackEvent("guest_created", { sessionId });
}

export function trackGuestMigrated(guestSessionId: string, userId: string) {
  trackEvent("guest_migrated", { guestSessionId, userId });
}

// Prompt Interaction Events
export function trackPromptViewed(promptId: string, category: string) {
  trackEvent("prompt_viewed", { promptId, category });
}

export function trackCopyClicked(promptId: string, hasCredits: boolean) {
  trackEvent("copy_button_clicked", { promptId, hasCredits });
}

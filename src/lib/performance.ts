// Performance tracking utilities using Vercel Analytics

import { track } from "@vercel/analytics";

/**
 * Track custom performance metrics
 */
export const performance = {
  /**
   * Track payment flow performance
   */
  payment: {
    start() {
      return Date.now();
    },
    complete(startTime: number, productId: string) {
      const duration = Date.now() - startTime;
      track("Payment Flow Duration", { duration, productId });
      return duration;
    },
  },

  /**
   * Track image generation performance
   */
  generation: {
    start() {
      return Date.now();
    },
    complete(startTime: number, type: string) {
      const duration = Date.now() - startTime;
      track("Image Generation Duration", { duration, type });
      return duration;
    },
  },

  /**
   * Track API call performance
   */
  api: {
    start() {
      return Date.now();
    },
    complete(startTime: number, endpoint: string) {
      const duration = Date.now() - startTime;
      track("API Call Duration", { duration, endpoint });
      return duration;
    },
  },

  /**
   * Track page load performance
   */
  pageLoad(pageName: string, loadTime: number) {
    track("Page Load Time", { pageName, loadTime });
  },
};

/**
 * Track user interactions
 */
export const events = {
  promptCopied(promptId: string) {
    track("Prompt Copied", { promptId });
  },

  promptBookmarked(promptId: string) {
    track("Prompt Bookmarked", { promptId });
  },

  paymentInitiated(productId: string, amount: number) {
    track("Payment Initiated", { productId, amount });
  },

  authSignIn(method: "google" | "guest") {
    track("Auth Sign In", { method });
  },
};

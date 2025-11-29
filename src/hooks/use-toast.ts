// Custom toast hook with common patterns

import { toast as sonnerToast } from "sonner";
import { useTranslations } from "~/components/language-provider";

interface ToastOptions {
  duration?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
}

/**
 * Custom toast hook with i18n support and common patterns
 */
export function useToast() {
  const translations = useTranslations();

  return {
    success: (message: string, options?: ToastOptions) => {
      sonnerToast.success(message, options);
    },

    error: (message: string, options?: ToastOptions) => {
      sonnerToast.error(message, options);
    },

    info: (message: string, options?: ToastOptions) => {
      sonnerToast.info(message, options);
    },

    warning: (message: string, options?: ToastOptions) => {
      sonnerToast.warning(message, options);
    },

    // Common patterns
    successSaved: (options?: ToastOptions) => {
      sonnerToast.success(translations.common.toast.saveSuccess, options);
    },

    successDeleted: (options?: ToastOptions) => {
      sonnerToast.success(translations.common.toast.removeSuccess, options);
    },

    successCopied: (options?: ToastOptions) => {
      sonnerToast.success(translations.common.toast.copySuccess, options);
    },

    errorGeneric: (options?: ToastOptions) => {
      sonnerToast.error(translations.common.errors.generic, options);
    },

    errorNetwork: (options?: ToastOptions) => {
      sonnerToast.error(translations.common.errors.networkError, options);
    },

    errorUnauthorized: (options?: ToastOptions) => {
      sonnerToast.error(translations.common.errors.unauthorized, options);
    },

    promise: <T>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      },
    ) => {
      return sonnerToast.promise(promise, messages);
    },
  };
}

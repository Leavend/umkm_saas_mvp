/**
 * UI-related constants for consistent styling and behavior
 */

export const UI_CONSTANTS = {
  /**
   * Image and media constants
   */
  image: {
    blurPlaceholder:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z",
    sizes: {
      card: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
      hero: "(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw",
      thumbnail: "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw",
    },
  },

  /**
   * Layout and spacing constants
   */
  layout: {
    pageMax: "var(--page-max)",
    gridMinCols: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
    spacing: {
      xs: "0.5rem",
      sm: "0.75rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
      xxl: "3rem",
    },
  },

  /**
   * Animation and transition constants
   */
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      default: "ease-in-out",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
  },

  /**
   * Text and typography constants
   */
  text: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      xxl: "text-2xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },

  /**
   * Component size constants
   */
  component: {
    button: {
      sm: "h-7 px-2 text-xs",
      md: "h-9 px-4 text-sm",
      lg: "h-10 px-6 text-base",
      icon: "h-8 w-8",
      iconSm: "h-7 w-7",
    },
    card: {
      radius: "rounded-2xl",
      padding: "p-3 sm:p-4",
    },
    badge: {
      size: "text-xs sm:text-sm",
    },
  },

  /**
   * Responsive breakpoints
   */
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  /**
   * Color scheme constants
   */
  colors: {
    brand: {
      100: "bg-brand-100",
      500: "bg-brand-500",
      800: "text-brand-800",
    },
    slate: {
      50: "bg-slate-50",
      100: "bg-slate-100",
      200: "border-slate-200",
      300: "border-slate-300",
      800: "text-slate-800",
      900: "text-slate-900",
    },
  },

  /**
   * Status and state constants
   */
  status: {
    loading: "loading",
    idle: "idle",
    error: "error",
    success: "success",
  },
} as const;

export type UIComponentSize = keyof typeof UI_CONSTANTS.component.button;
export type UIAnimationDuration = keyof typeof UI_CONSTANTS.animation.duration;
export type UILayoutSpacing = keyof typeof UI_CONSTANTS.layout.spacing;

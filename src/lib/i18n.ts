// src/lib/i18n.ts

export const SUPPORTED_LOCALES = ["en", "id"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LANGUAGE_STORAGE_KEY = "umkm-saas-language";

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function assertValidLocale(value: string): asserts value is Locale {
  if (!isSupportedLocale(value)) {
    throw new Error(
      `Invalid locale: ${value}. Supported locales are: ${SUPPORTED_LOCALES.join(", ")}`,
    );
  }
}

export function normalizeLocale(
  value: unknown,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (isSupportedLocale(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.toLowerCase();

    const exactMatch = SUPPORTED_LOCALES.find(
      (locale) => locale.toLowerCase() === normalized,
    );
    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = SUPPORTED_LOCALES.find((locale) =>
      normalized.startsWith(locale.toLowerCase()),
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  return fallback;
}

export const TRANSLATIONS = {
  en: {
    common: {
      brand: {
        name: "AI Image Editor",
        short: "AI Image",
        suffix: "Editor",
      },
      language: {
        label: "Language",
        toggle: "Switch language",
        english: "English",
        indonesian: "Bahasa Indonesia",
        shortEnglish: "EN",
        shortIndonesian: "ID",
      },
      actions: {
        signIn: "Sign In",
        signOut: "Sign Out",
        tryFree: "Try Free",
        tryItNow: "Try It Free Now",
        viewDemo: "View Demo",
        viewExamples: "View Examples",
        backToHomepage: "homepage",
        createFirstProject: "Create Your First Project",
        clearSearch: "Clear Search",
        loadMoreProjects: "Load More Projects",
        download: "Download",
        chooseImage: "Choose Your Image",
        selectFiles: "Select files from your device",
        closeSidebar: "Close sidebar",
        upgrade: "Upgrade",
        customerPortal: "Customer Portal",
        save: "Save",
        upload: "Upload",
      },
      states: {
        loading: "Loading...",
        loadingDashboard: "Loading your dashboard...",
        loadingProjects: "Loading your projects...",
        loadingSettings: "Loading your settings...",
        loadingPortal: "Loading your customer portal...",
        processing: "Processing...",
        processingWithAi: "AI Processing...",
        pleaseWait: "Please wait",
        fetchingCreations: "Fetching your creative works",
        uploadingImage: "Uploading your image",
        uploadingDescription: "Processing your file with AI magic ✨",
        startDownload: "Download started!",
        notAvailable: "Not available",
      },
    },
    home: {
      nav: {
        features: "Features",
        pricing: "Pricing",
        reviews: "Reviews",
      },
      hero: {
        badge: "Powered by Advanced AI",
        titleLeading: "Transform Images with",
        titleHighlight: "AI Magic",
        description:
          "Professional image editing powered by artificial intelligence. Remove backgrounds, upscale images, and crop with precision - all in seconds.",
        primaryCta: "Try It Free Now",
        secondaryCta: "View Demo",
        trustedBy: "Trusted by thousands of creators worldwide",
      },
      metrics: [
        {
          key: "imagesProcessed",
          label: "Images Processed",
          fallbackValue: "10K+",
        },
        {
          key: "activeUsers",
          label: "Active Users",
          fallbackValue: "2.5K+",
        },
        {
          key: "uptime",
          label: "Uptime",
          fallbackValue: "99.9%",
        },
        {
          key: "userRating",
          label: "User Rating",
          fallbackValue: "4.8★",
        },
        {
          key: "aiProcessing",
          label: "AI Processing",
          fallbackValue: "24/7",
        },
      ],
      features: {
        headingLeading: "Powerful AI Tools at Your",
        headingHighlight: "Fingertips",
        description:
          "Everything you need to create stunning images with the power of artificial intelligence",
        items: {
          backgroundRemoval: {
            title: "AI Background Removal",
            description:
              "Remove backgrounds instantly with advanced AI technology. Perfect for product photos and portraits.",
          },
          upscale: {
            title: "Smart Upscaling",
            description:
              "Enhance image quality and resolution without losing clarity using cutting-edge AI algorithms.",
          },
          objectCrop: {
            title: "Object-Focused Cropping",
            description:
              "Intelligently crop images around specific objects with AI-powered detection and framing.",
          },
          performance: {
            title: "Lightning Fast",
            description:
              "Process images in seconds, not minutes. Our optimized AI infrastructure delivers results instantly.",
          },
        },
      },
      howItWorks: {
        heading: "Simple. Fast. Professional.",
        description: "Get professional results in three simple steps",
        steps: {
          upload: {
            step: "01",
            title: "Upload Your Image",
            description:
              "Drag and drop or select your image. We support all major formats including JPG, PNG, and WebP.",
          },
          choose: {
            step: "02",
            title: "Choose AI Tools",
            description:
              "Select from our powerful AI tools: background removal, upscaling, or object-focused cropping.",
          },
          download: {
            step: "03",
            title: "Download Results",
            description:
              "Get your professionally edited image in seconds. High-quality results ready for any use.",
          },
        },
      },
      testimonials: {
        headingLeading: "Loved by",
        headingHighlight: "Creators",
        description: "See what our users are saying about AI Image Editor",
        items: [
          {
            name: "Sarah Chen",
            role: "Graphic Designer",
            content:
              "This tool has revolutionized my workflow. Background removal that used to take hours now takes seconds!",
          },
          {
            name: "Marcus Johnson",
            role: "E-commerce Owner",
            content:
              "Perfect for product photography. The AI upscaling feature makes my images look professional.",
          },
          {
            name: "Emma Rodriguez",
            role: "Content Creator",
            content:
              "The object cropping feature is incredible. It knows exactly what I want to focus on.",
          },
        ],
      },
      pricing: {
        headingLeading: "Start Creating",
        headingHighlight: "For Free",
        description:
          "No credit card required. Begin transforming your images instantly.",
        badge: "Free to Start",
        planName: "Free Plan",
        price: "$0",
        priceSuffix: "to start",
        subheading: "Try all features with free credits",
        features: [
          "AI Background Removal",
          "Smart Image Upscaling",
          "Object-Focused Cropping",
          "High-Quality Downloads",
          "Fast Processing",
          "Cloud Storage",
        ],
        footnote: "Includes 10 free credits • No credit card required",
      },
      cta: {
        heading: "Ready to Transform Your Images?",
        description:
          "Join thousands of creators using AI to enhance their visual content",
        primaryCta: "Try It Free Now",
        secondaryCta: "View Examples",
      },
      footer: {
        description:
          "Professional image editing powered by artificial intelligence. Transform your images with cutting-edge AI technology.",
        product: {
          title: "Product",
          links: {
            features: "Features",
            pricing: "Pricing",
            dashboard: "Dashboard",
          },
        },
        support: {
          title: "Support",
          links: {
            helpCenter: "Help Center",
            contact: "Contact",
            privacy: "Privacy",
          },
        },
        copyright: "All rights reserved.",
      },
    },
    auth: {
      hero: {
        titleLeading: "Transform Images with",
        titleHighlight: "AI Magic",
        description:
          "Join thousands of creators using advanced AI to edit, enhance, and perfect their images in seconds.",
      },
      features: {
        background: "AI Background Removal",
        speed: "Lightning Fast Processing",
        quality: "Professional Quality Results",
      },
      stats: {
        images: "Images Processed",
        users: "Happy Users",
        rating: "Rating",
      },
      signIn: {
        title: "Sign in to your account",
        description:
          "Access your AI Image Editor dashboard and start transforming your images instantly.",
        button: "Sign In",
        forgotPasswordLink: "Forgot your password?",
      },
      signUp: {
        title: "Create your account",
        description:
          "Join thousands of creators using AI to edit and enhance their images.",
        button: "Sign Up",
      },
      form: {
        emailLabel: "Email address",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        promptSignUp: "Don’t have an account? Sign up",
        promptSignIn: "Already have an account? Sign in",
      },
      socialProviders: {
        google: {
          signIn: "Sign in with Google",
          signUp: "Sign up with Google",
          continue: "Continue with Google",
        },
      },
      backToHomePrefix: "Back to",
      mobileBrand: "AI Image Editor",
    },
    dashboard: {
      welcome: "Welcome back",
      subtitle: "Here\'s an overview of your AI image editing workspace",
      stats: {
        totalProjects: {
          title: "Total Projects",
          description: "All your creations",
        },
        thisMonth: {
          title: "This Month",
          description: "Projects created",
        },
        thisWeek: {
          title: "This Week",
          description: "Recent activity",
        },
        memberSince: {
          title: "Member Since",
          description: "Account created",
        },
      },
      quickActions: {
        title: "Quick Actions",
        create: {
          title: "Create New Project",
          description: "Upload and edit images with AI",
        },
        projects: {
          title: "View All Projects",
          description: "Browse your image library",
        },
        settings: {
          title: "Account Settings",
          description: "Manage your profile",
        },
      },
      recent: {
        title: "Recent Projects",
        viewAll: "View All",
        emptyTitle: "No projects yet",
        emptyDescription: "Start creating amazing images with AI tools",
        emptyAction: "Create Your First Project",
        emptySecondary: "Start creating amazing images with AI tools",
      },
      topUp: {
        title: "Top up credits",
        description:
          "Choose the credit pack that fits your workflow and complete payment securely via Xendit.",
        benefit:
          "Unlock more AI transformations instantly with prepaid credits. Credits never expire.",
        purchaseCta: "Purchase",
        processing: "Processing...",
        creditsSuffix: "credits",
      },
    },
    projects: {
      title: "Your Projects",
      description: "Manage and organize all your AI-generated images",
      projectCountSingular: "project",
      projectCountPlural: "projects",
      newProject: "New Project",
      searchPlaceholder: "Search projects...",
      sort: {
        newest: "Newest First",
        oldest: "Oldest First",
        name: "Name A-Z",
      },
      viewMode: {
        grid: "Grid view",
        list: "List view",
      },
      empty: {
        defaultTitle: "No projects yet",
        defaultDescription:
          "Start creating amazing images with AI tools to see them here.",
        searchTitle: "No projects found",
        searchDescriptionPrefix: "No projects match",
        searchDescriptionSuffix: "Try adjusting your search terms.",
        clearSearch: "Clear Search",
      },
      card: {
        imageLabel: "Image",
        loadMore: "Load More Projects",
        showingCount: "Showing {{count}} of {{total}} projects",
        untitled: "Untitled Project",
      },
    },
    create: {
      title: "Create AI Images",
      subtitle: "Upload and transform images with AI tools",
      uploadCard: {
        title: "Upload Your Image",
        description:
          "Click to browse and select your image. Transform it with powerful AI tools.",
        supportedFormats: "Supported formats:",
        formats: ["JPG", "PNG", "WEBP"],
        chooseImage: "Choose Your Image",
        helperText: "Select files from your device",
      },
      effects: {
        title: "AI Effects",
        subtitle: "Transform your image",
        activeLabel: "{{count}} applied",
        sections: {
          background: {
            title: "Background & Lighting",
            subtitle: "Swap, remove, or relight the scene",
          },
          enhancements: {
            title: "Quality & Variations",
            subtitle: "Improve resolution or generate variations",
          },
          crop: {
            title: "Cropping",
            subtitle: "Focus on the right subject",
          },
          editing: {
            title: "Generative Editing",
            subtitle: "Edit pixels or expand the canvas",
          },
        },
        labels: {
          removeBackground: "Background removal",
          removeBackgroundHd: "HD background removal",
          changeBackground: "Change background",
          dropShadow: "AI drop shadow",
          retouch: "Retouch",
          upscale: "Upscale",
          variation: "Variation",
          smartCrop: "Smart crop",
          faceCrop: "Face crop",
          objectCrop: "Object crop",
          edit: "Edit image",
          generativeFill: "Generative fill",
        },
        removeBackground: {
          idle: "Remove BG",
          processing: "Processing...",
          done: "Removed ✓",
          tooltip: "Remove background",
          toastApplied: "Background removed! {{remaining}} credits remaining.",
          toastAlready: "Background removal is already applied!",
          toastError: "Failed to remove background",
          toastRemoved: "Background removal cleared.",
          cost: "(2 credits)",
        },
        removeBackgroundHd: {
          idle: "Remove BG HD",
          processing: "Processing...",
          done: "Removed ✓",
          tooltip: "High quality background removal",
          toastApplied:
            "High quality background removed! {{remaining}} credits remaining.",
          toastAlready: "High quality background removal is already applied!",
          toastError: "Failed to remove background",
          toastRemoved: "High quality background removal cleared.",
          cost: "(3 credits)",
        },
        changeBackground: {
          placeholder: "Describe the new background (e.g. neon city at night)",
          helper: "AI replaces the background using your prompt.",
          apply: "Apply background",
          toastApplied: "Background changed! {{remaining}} credits remaining.",
          toastAlready: "Change background is already applied!",
          toastMissing: "Please describe the background you want.",
          toastError: "Failed to change background",
          toastRemoved: "Background change cleared.",
          cost: "(3 credits)",
        },
        dropShadow: {
          idle: "Drop shadow",
          processing: "Processing...",
          done: "Shadow ✓",
          helper:
            "Adds a realistic AI drop shadow. Works best after background removal.",
          apply: "Apply shadow",
          toastApplied: "Drop shadow added!",
          toastAlready: "Drop shadow is already applied!",
          toastError: "Failed to add drop shadow",
          toastRemoved: "Drop shadow removed.",
          azimuthLabel: "Light angle (0-360)",
          elevationLabel: "Elevation (0-90)",
          saturationLabel: "Intensity (0-100)",
          cost: "(1 credit)",
        },
        retouch: {
          idle: "Retouch",
          processing: "Processing...",
          done: "Retouched ✓",
          toastApplied: "Image retouched! {{remaining}} credits remaining.",
          toastAlready: "Retouch is already applied!",
          toastError: "Failed to retouch image",
          toastRemoved: "Retouch cleared.",
          cost: "(1 credit)",
        },
        upscale: {
          idle: "Upscale",
          processing: "Processing...",
          done: "Upscaled ✓",
          tooltip: "Upscale image",
          toastApplied: "Image upscaled! {{remaining}} credits remaining.",
          toastAlready: "Image upscaling is already applied!",
          toastError: "Failed to upscale image",
          toastRemoved: "Upscale removed.",
          cost: "(1 credit)",
        },
        variation: {
          idle: "Variation",
          processing: "Processing...",
          done: "Variation ✓",
          toastApplied: "Variation generated! {{remaining}} credits remaining.",
          toastAlready: "Variation is already applied!",
          toastError: "Failed to generate variation",
          toastRemoved: "Variation removed.",
          cost: "(2 credits)",
        },
        smartCrop: {
          idle: "Smart Crop",
          processing: "Processing...",
          done: "Cropped ✓",
          helper: "Automatically centers the main subject.",
          toastApplied: "Smart crop applied!",
          toastAlready: "Smart crop is already applied!",
          toastError: "Failed to apply smart crop",
          toastRemoved: "Smart crop removed.",
          badge: "FREE",
        },
        faceCrop: {
          idle: "Face Crop",
          processing: "Processing...",
          done: "Face ✓",
          helper: "Crops around detected faces.",
          toastApplied: "Face crop applied!",
          toastAlready: "Face crop is already applied!",
          toastError: "Failed to apply face crop",
          toastRemoved: "Face crop removed.",
          zoomLabel: "Zoom (0-100)",
          zoomHelper: "Optional zoom level. Leave empty for default framing.",
          badge: "FREE",
        },
        objectCrop: {
          idle: "Object Crop",
          processing: "Processing...",
          done: "Cropped ✓",
          placeholder: "Focus object (e.g. shoes, bag, person)",
          aspectLabel: "Aspect ratio",
          aspectPlaceholder: "e.g. 1:1, 3:4",
          toastApplied: 'Smart crop applied focusing on "{{object}}"!',
          toastAlready: "Smart object crop is already applied!",
          toastMissing: "Please enter an object to focus on!",
          toastError: "Failed to apply smart crop",
          toastRemoved: "Smart crop removed.",
          title: "Smart Object Crop",
          helper: "✨ AI crops around specified object",
          badge: "FREE",
          apply: "Apply crop",
        },
        edit: {
          placeholder: "Describe the edit (e.g. add confetti around the cake)",
          helper: "AI edits the image based on your prompt.",
          apply: "Apply edit",
          toastApplied: "Edit applied! {{remaining}} credits remaining.",
          toastAlready: "Edit is already applied!",
          toastMissing: "Please describe the edit you want.",
          toastError: "Failed to edit image",
          toastRemoved: "Edit cleared.",
          cost: "(3 credits)",
        },
        generativeFill: {
          widthLabel: "Width (px)",
          heightLabel: "Height (px)",
          cropModeLabel: "Crop mode",
          cropModeOptions: {
            padResize: "Pad resize",
            padExtract: "Pad extract",
          },
          promptPlaceholder:
            "Optional scene details (e.g. extend with forest path)",
          helper:
            "Extends the canvas beyond its original size. Requires width and height.",
          apply: "Apply fill",
          toastApplied:
            "Generative fill applied! {{remaining}} credits remaining.",
          toastAlready: "Generative fill is already applied!",
          toastMissingDimensions: "Please provide width and height.",
          toastError: "Failed to apply generative fill",
          toastRemoved: "Generative fill cleared.",
          cost: "(4 credits)",
        },
        activeList: {
          title: "Active transformations",
          empty: "No transformations yet",
        },
        chipRemove: "Remove",
        clearAll: "Clear",
        download: "Download",
      },
      preview: {
        title: "Preview",
        processing: "AI Processing...",
        pleaseWait: "Please wait",
        removeImage: "Remove image",
      },
      recents: {
        title: "Your Recent Projects",
        subtitle: "Continue editing your previous creations",
        loadingTitle: "Loading your projects...",
        loadingSubtitle: "Fetching your creative works",
        emptyTitle: "No projects yet",
        emptyDescription:
          "Start your creative journey by uploading your first image and transforming it with AI",
        showingCount: "Showing {{count}} of {{total}} projects",
        editLabel: "Edit",
      },
      toasts: {
        uploadSuccess: "Upload successful!",
        uploadFailed: "Upload failed",
        invalidCredits: "Invalid credit amount",
        insufficientCredits: "Insufficient credits",
        paymentFailed: "Failed to process payment",
        downloadStarted: "Download started!",
        transformationsCleared: "All transformations cleared!",
        backgroundRemoved: "Background removed!",
        upscaled: "Image upscaled!",
      },
    },
    settings: {
      title: "Account Settings",
      description: "Manage your account preferences and security settings",
      account: {
        title: "Account",
        nameLabel: "Name",
        nameDescription: "Please enter your full name, or a display name.",
        nameInstructions: "Please use 32 characters at maximum.",
        namePlaceholder: "Your Name",
        emailLabel: "Email",
        emailDescription: "Enter the email address you want to use to log in.",
        emailInstructions: "Please enter a valid email address.",
        emailPlaceholder: "m@example.com",
        emailVerifyChange: "Please check your email to verify the change.",
        avatarLabel: "Avatar",
        avatarDescription:
          "Click on the avatar to upload a custom one from your files.",
        avatarInstructions: "An avatar is optional but strongly recommended.",
        uploadAvatar: "Upload Avatar",
        deleteAvatar: "Delete Avatar",
        deleteAccountLabel: "Delete Account",
        deleteAccountDescription:
          "Permanently remove your account and all of its contents. This action is not reversible — please continue with caution.",
        deleteAccountInstructions:
          "Please confirm the deletion of your account. This action is not reversible, so please continue with caution.",
        deleteAccountVerify:
          "Please check your email to verify the deletion of your account.",
      },
      security: {
        title: "Security",
        changePasswordLabel: "Change Password",
        changePasswordDescription:
          "Enter your current password and a new password.",
        changePasswordInstructions: "Please use 8 characters at minimum.",
        currentPasswordLabel: "Current Password",
        currentPasswordPlaceholder: "Current Password",
        newPasswordLabel: "New Password",
        newPasswordPlaceholder: "New Password",
        confirmPasswordLabel: "Confirm Password",
        confirmPasswordPlaceholder: "Confirm Password",
        passwordsDoNotMatch: "Passwords do not match",
        changePasswordSuccess: "Your password has been changed.",
        twoFactorLabel: "Two-Factor Authentication",
        twoFactorCardDescription:
          "Add an extra layer of security to your account.",
        enableTwoFactor: "Enable Two-Factor",
        disableTwoFactor: "Disable Two-Factor",
        twoFactorEnableInstructions: "Please enter your password to enable 2FA",
        twoFactorDisableInstructions:
          "Please enter your password to disable 2FA.",
        twoFactorEnabled: "Two-factor authentication has been enabled",
        twoFactorDisabled: "Two-Factor Authentication has been disabled",
        sessionsLabel: "Sessions",
        sessionsDescription: "Manage your active sessions and revoke access.",
        currentSession: "Current Session",
        signout: "Sign Out",
        revoke: "Revoke",
      },
    },
    customerPortal: {
      loading: "Loading your customer portal...",
    },
    sidebar: {
      items: {
        dashboard: "Dashboard",
        create: "Create",
        projects: "Projects",
        topUp: "Top Up",
        settings: "Settings",
      },
      footer: {
        credits: "Credits",
      },
    },
  },
  id: {
    common: {
      brand: {
        name: "Editor Gambar AI",
        short: "Gambar AI",
        suffix: "Editor",
      },
      language: {
        label: "Bahasa",
        toggle: "Ganti bahasa",
        english: "English",
        indonesian: "Bahasa Indonesia",
        shortEnglish: "EN",
        shortIndonesian: "ID",
      },
      actions: {
        signIn: "Masuk",
        signOut: "Keluar",
        tryFree: "Coba Gratis",
        tryItNow: "Coba Gratis Sekarang",
        viewDemo: "Lihat Demo",
        viewExamples: "Lihat Contoh",
        backToHomepage: "beranda",
        createFirstProject: "Buat Proyek Pertama",
        clearSearch: "Hapus Pencarian",
        loadMoreProjects: "Muat Proyek Lainnya",
        download: "Unduh",
        chooseImage: "Pilih Gambarmu",
        selectFiles: "Pilih file dari perangkatmu",
        closeSidebar: "Tutup bilah samping",
        upgrade: "Tambah Kredit",
        customerPortal: "Portal Pelanggan",
        save: "Simpan",
        upload: "Unggah",
      },
      states: {
        loading: "Memuat...",
        loadingDashboard: "Memuat dasbor Anda...",
        loadingProjects: "Memuat proyek Anda...",
        loadingSettings: "Memuat pengaturan Anda...",
        loadingPortal: "Memuat portal pelanggan...",
        processing: "Memproses...",
        processingWithAi: "AI sedang memproses...",
        pleaseWait: "Mohon tunggu",
        fetchingCreations: "Mengambil karya kreatif Anda",
        uploadingImage: "Mengunggah gambar",
        uploadingDescription: "Memproses file dengan keajaiban AI ✨",
        startDownload: "Pengunduhan dimulai!",
        notAvailable: "Belum tersedia",
      },
    },
    home: {
      nav: {
        features: "Fitur",
        pricing: "Harga",
        reviews: "Ulasan",
      },
      hero: {
        badge: "Didukung AI Canggih",
        titleLeading: "Ubah Gambar dengan",
        titleHighlight: "Keajaiban AI",
        description:
          "Edit gambar profesional dengan kecerdasan buatan. Hapus latar, tingkatkan resolusi, dan potong dengan presisi hanya dalam hitungan detik.",
        primaryCta: "Coba Gratis Sekarang",
        secondaryCta: "Lihat Demo",
        trustedBy: "Dipercaya ribuan kreator di seluruh dunia",
      },
      metrics: [
        {
          key: "imagesProcessed",
          label: "Gambar Diproses",
          fallbackValue: "10K+",
        },
        {
          key: "activeUsers",
          label: "Pengguna Aktif",
          fallbackValue: "2.5K+",
        },
        {
          key: "uptime",
          label: "Waktu Aktif",
          fallbackValue: "99.9%",
        },
        {
          key: "userRating",
          label: "Nilai Pengguna",
          fallbackValue: "4.8★",
        },
        {
          key: "aiProcessing",
          label: "Pemrosesan AI",
          fallbackValue: "24/7",
        },
      ],
      features: {
        headingLeading: "Alat AI Kuat di",
        headingHighlight: "Ujung Jari Anda",
        description:
          "Semua yang Anda butuhkan untuk membuat gambar menakjubkan dengan kekuatan kecerdasan buatan",
        items: {
          backgroundRemoval: {
            title: "Penghapus Latar AI",
            description:
              "Hapus latar dalam sekejap dengan teknologi AI. Sempurna untuk foto produk dan potret.",
          },
          upscale: {
            title: "Peningkatan Kualitas Pintar",
            description:
              "Tingkatkan kualitas dan resolusi gambar tanpa kehilangan ketajaman dengan algoritma AI mutakhir.",
          },
          objectCrop: {
            title: "Pemotongan Fokus Objek",
            description:
              "Potong gambar secara cerdas di sekitar objek tertentu dengan deteksi dan pembingkaian bertenaga AI.",
          },
          performance: {
            title: "Sangat Cepat",
            description:
              "Proses gambar dalam hitungan detik. Infrastruktur AI kami yang dioptimalkan memberikan hasil instan.",
          },
        },
      },
      howItWorks: {
        heading: "Sederhana. Cepat. Profesional.",
        description: "Hasil profesional dalam tiga langkah mudah",
        steps: {
          upload: {
            step: "01",
            title: "Unggah Gambarmu",
            description:
              "Seret dan lepaskan atau pilih gambar Anda. Mendukung format populer seperti JPG, PNG, dan WebP.",
          },
          choose: {
            step: "02",
            title: "Pilih Alat AI",
            description:
              "Pilih dari alat AI kami yang kuat: hapus latar, tingkatkan kualitas, atau potong fokus objek.",
          },
          download: {
            step: "03",
            title: "Unduh Hasil",
            description:
              "Dapatkan gambar hasil edit profesional dalam hitungan detik. Siap digunakan untuk berbagai kebutuhan.",
          },
        },
      },
      testimonials: {
        headingLeading: "Dicintai para",
        headingHighlight: "Kreator",
        description: "Lihat apa kata pengguna tentang Editor Gambar AI",
        items: [
          {
            name: "Sarah Chen",
            role: "Desainer Grafis",
            content:
              "Alat ini mengubah alur kerja saya. Menghapus latar yang dulu memakan waktu berjam-jam kini hanya detik!",
          },
          {
            name: "Marcus Johnson",
            role: "Pemilik E-commerce",
            content:
              "Sempurna untuk foto produk. Fitur peningkatan kualitas membuat gambar saya terlihat profesional.",
          },
          {
            name: "Emma Rodriguez",
            role: "Pembuat Konten",
            content:
              "Fitur pemotongan objeknya luar biasa. AI tahu persis apa yang ingin saya fokuskan.",
          },
        ],
      },
      pricing: {
        headingLeading: "Mulai Berkarya",
        headingHighlight: "Gratis",
        description: "Tanpa kartu kredit. Langsung ubah gambar Anda sekarang.",
        badge: "Gratis Dimulai",
        planName: "Paket Gratis",
        price: "Rp0",
        priceSuffix: "untuk memulai",
        subheading: "Coba semua fitur dengan kredit gratis",
        features: [
          "Penghapus Latar AI",
          "Peningkatan Gambar Pintar",
          "Pemotongan Fokus Objek",
          "Unduhan Berkualitas Tinggi",
          "Pemrosesan Cepat",
          "Penyimpanan Cloud",
        ],
        footnote: "Termasuk 10 kredit gratis • Tanpa kartu kredit",
      },
      cta: {
        heading: "Siap Mengubah Gambar Anda?",
        description:
          "Bergabung dengan ribuan kreator yang memanfaatkan AI untuk meningkatkan konten visual",
        primaryCta: "Coba Gratis Sekarang",
        secondaryCta: "Lihat Contoh",
      },
      footer: {
        description:
          "Edit gambar profesional dengan kecerdasan buatan. Ubah gambar Anda dengan teknologi AI terkini.",
        product: {
          title: "Produk",
          links: {
            features: "Fitur",
            pricing: "Harga",
            dashboard: "Dasbor",
          },
        },
        support: {
          title: "Dukungan",
          links: {
            helpCenter: "Pusat Bantuan",
            contact: "Kontak",
            privacy: "Privasi",
          },
        },
        copyright: "Hak cipta dilindungi.",
      },
    },
    auth: {
      hero: {
        titleLeading: "Ubah Gambar dengan",
        titleHighlight: "Keajaiban AI",
        description:
          "Bergabunglah dengan ribuan kreator yang menggunakan AI canggih untuk mengedit, menyempurnakan, dan menyelesaikan gambar hanya dalam hitungan detik.",
      },
      features: {
        background: "Penghapus Latar AI",
        speed: "Proses Super Cepat",
        quality: "Hasil Berkualitas Profesional",
      },
      stats: {
        images: "Gambar Diproses",
        users: "Pengguna Senang",
        rating: "Penilaian",
      },
      signIn: {
        title: "Masuk ke akun Anda",
        description:
          "Akses dasbor Editor Gambar AI dan mulai ubah gambar Anda sekarang.",
        button: "Masuk",
        forgotPasswordLink: "Lupa kata sandi?",
      },
      signUp: {
        title: "Buat akun baru",
        description:
          "Bergabunglah dengan ribuan kreator yang menggunakan AI untuk mengedit dan menyempurnakan gambar mereka.",
        button: "Daftar",
      },
      form: {
        emailLabel: "Alamat Email",
        emailPlaceholder: "anda@contoh.com",
        passwordLabel: "Kata Sandi",
        passwordPlaceholder: "Masukkan kata sandi Anda",
        promptSignUp: "Belum punya akun? Daftar",
        promptSignIn: "Sudah punya akun? Masuk",
      },
      socialProviders: {
        google: {
          signIn: "Masuk dengan Google",
          signUp: "Daftar dengan Google",
          continue: "Lanjutkan dengan Google",
        },
      },
      backToHomePrefix: "Kembali ke",
      mobileBrand: "Editor Gambar AI",
    },
    dashboard: {
      welcome: "Selamat datang kembali",
      subtitle: "Berikut gambaran ruang kerja pengeditan gambar AI Anda",
      stats: {
        totalProjects: {
          title: "Total Proyek",
          description: "Semua karya Anda",
        },
        thisMonth: {
          title: "Bulan Ini",
          description: "Proyek dibuat",
        },
        thisWeek: {
          title: "Minggu Ini",
          description: "Aktivitas terbaru",
        },
        memberSince: {
          title: "Gabung Sejak",
          description: "Akun dibuat",
        },
      },
      quickActions: {
        title: "Aksi Cepat",
        create: {
          title: "Buat Proyek Baru",
          description: "Unggah dan edit gambar dengan AI",
        },
        projects: {
          title: "Lihat Semua Proyek",
          description: "Jelajahi perpustakaan gambarmu",
        },
        settings: {
          title: "Pengaturan Akun",
          description: "Kelola profilmu",
        },
      },
      recent: {
        title: "Proyek Terbaru",
        viewAll: "Lihat Semua",
        emptyTitle: "Belum ada proyek",
        emptyDescription: "Mulai buat gambar menakjubkan dengan alat AI",
        emptyAction: "Buat Proyek Pertama",
        emptySecondary: "Mulai buat gambar menakjubkan dengan alat AI",
      },
      topUp: {
        title: "Isi ulang kredit",
        description:
          "Pilih paket kredit yang sesuai dengan kebutuhan Anda dan selesaikan pembayaran secara aman melalui Xendit.",
        benefit:
          "Dapatkan lebih banyak transformasi AI secara instan dengan kredit prabayar. Kredit tidak akan kedaluwarsa.",
        purchaseCta: "Beli",
        processing: "Memproses...",
        creditsSuffix: "kredit",
      },
    },
    projects: {
      title: "Proyekmu",
      description: "Kelola dan atur semua gambar buatan AI Anda",
      projectCountSingular: "proyek",
      projectCountPlural: "proyek",
      newProject: "Proyek Baru",
      searchPlaceholder: "Cari proyek...",
      sort: {
        newest: "Terbaru",
        oldest: "Terlama",
        name: "Nama A-Z",
      },
      viewMode: {
        grid: "Tampilan kisi",
        list: "Tampilan daftar",
      },
      empty: {
        defaultTitle: "Belum ada proyek",
        defaultDescription:
          "Mulai buat gambar menakjubkan dengan alat AI untuk melihatnya di sini.",
        searchTitle: "Proyek tidak ditemukan",
        searchDescriptionPrefix: "Tidak ada proyek yang cocok",
        searchDescriptionSuffix: "Coba ubah kata pencarian Anda.",
        clearSearch: "Hapus Pencarian",
      },
      card: {
        imageLabel: "Gambar",
        loadMore: "Muat Proyek Lainnya",
        showingCount: "Menampilkan {{count}} dari {{total}} proyek",
        untitled: "Proyek Tanpa Nama",
      },
    },
    create: {
      title: "Buat Gambar AI",
      subtitle: "Unggah dan ubah gambar dengan alat AI",
      uploadCard: {
        title: "Unggah Gambarmu",
        description:
          "Klik untuk memilih gambar dan ubah dengan alat AI yang kuat.",
        supportedFormats: "Format yang didukung:",
        formats: ["JPG", "PNG", "WEBP"],
        chooseImage: "Pilih Gambarmu",
        helperText: "Pilih file dari perangkatmu",
      },
      effects: {
        title: "Efek AI",
        subtitle: "Ubah gambarmu",
        activeLabel: "{{count}} diterapkan",
        sections: {
          background: {
            title: "Latar & Pencahayaan",
            subtitle: "Ganti, hapus, atau atur ulang pencahayaan latar",
          },
          enhancements: {
            title: "Kualitas & Variasi",
            subtitle: "Tingkatkan resolusi atau buat variasi baru",
          },
          crop: {
            title: "Pemotongan",
            subtitle: "Fokus ke subjek yang tepat",
          },
          editing: {
            title: "Pengeditan Generatif",
            subtitle: "Edit piksel atau perbesar kanvas",
          },
        },
        labels: {
          removeBackground: "Hapus latar",
          removeBackgroundHd: "Hapus latar HD",
          changeBackground: "Ganti latar",
          dropShadow: "Bayangan AI",
          retouch: "Retouch",
          upscale: "Perbesar",
          variation: "Variasi",
          smartCrop: "Smart crop",
          faceCrop: "Crop wajah",
          objectCrop: "Crop objek",
          edit: "Edit gambar",
          generativeFill: "Generative fill",
        },
        removeBackground: {
          idle: "Hapus BG",
          processing: "Memproses...",
          done: "Dihapus ✓",
          tooltip: "Hapus latar",
          toastApplied: "Latar dihapus! {{remaining}} kredit tersisa.",
          toastAlready: "Penghapusan latar sudah diterapkan!",
          toastError: "Gagal menghapus latar",
          toastRemoved: "Penghapusan latar dibatalkan.",
          cost: "(2 kredit)",
        },
        removeBackgroundHd: {
          idle: "Hapus BG HD",
          processing: "Memproses...",
          done: "Dihapus ✓",
          tooltip: "Penghapusan latar kualitas tinggi",
          toastApplied:
            "Latar kualitas tinggi dihapus! {{remaining}} kredit tersisa.",
          toastAlready: "Penghapusan latar kualitas tinggi sudah diterapkan!",
          toastError: "Gagal menghapus latar",
          toastRemoved: "Penghapusan latar kualitas tinggi dibatalkan.",
          cost: "(3 kredit)",
        },
        changeBackground: {
          placeholder: "Deskripsikan latar baru (mis. kota neon di malam hari)",
          helper: "AI mengganti latar menggunakan prompt Anda.",
          apply: "Terapkan latar",
          toastApplied: "Latar diganti! {{remaining}} kredit tersisa.",
          toastAlready: "Ganti latar sudah diterapkan!",
          toastMissing: "Mohon deskripsikan latar yang diinginkan.",
          toastError: "Gagal mengganti latar",
          toastRemoved: "Penggantian latar dibatalkan.",
          cost: "(3 kredit)",
        },
        dropShadow: {
          idle: "Bayangan",
          processing: "Memproses...",
          done: "Bayangan ✓",
          helper:
            "Menambahkan bayangan AI realistis. Paling baik setelah latar dihapus.",
          apply: "Terapkan bayangan",
          toastApplied: "Bayangan AI ditambahkan!",
          toastAlready: "Bayangan AI sudah diterapkan!",
          toastError: "Gagal menambahkan bayangan",
          toastRemoved: "Bayangan AI dibatalkan.",
          azimuthLabel: "Sudut cahaya (0-360)",
          elevationLabel: "Elevasi (0-90)",
          saturationLabel: "Intensitas (0-100)",
          cost: "(1 kredit)",
        },
        retouch: {
          idle: "Retouch",
          processing: "Memproses...",
          done: "Retouch ✓",
          toastApplied: "Retouch berhasil! {{remaining}} kredit tersisa.",
          toastAlready: "Retouch sudah diterapkan!",
          toastError: "Gagal melakukan retouch",
          toastRemoved: "Retouch dibatalkan.",
          cost: "(1 kredit)",
        },
        upscale: {
          idle: "Perbesar",
          processing: "Memproses...",
          done: "Perbesar ✓",
          tooltip: "Perbesar gambar",
          toastApplied: "Gambar diperbesar! {{remaining}} kredit tersisa.",
          toastAlready: "Peningkatan gambar sudah diterapkan!",
          toastError: "Gagal memperbesar gambar",
          toastRemoved: "Perbesar dibatalkan.",
          cost: "(1 kredit)",
        },
        variation: {
          idle: "Variasi",
          processing: "Memproses...",
          done: "Variasi ✓",
          toastApplied: "Variasi dibuat! {{remaining}} kredit tersisa.",
          toastAlready: "Variasi sudah diterapkan!",
          toastError: "Gagal membuat variasi",
          toastRemoved: "Variasi dibatalkan.",
          cost: "(2 kredit)",
        },
        smartCrop: {
          idle: "Smart Crop",
          processing: "Memproses...",
          done: "Dipangkas ✓",
          helper: "Memusatkan subjek utama secara otomatis.",
          toastApplied: "Smart crop diterapkan!",
          toastAlready: "Smart crop sudah diterapkan!",
          toastError: "Gagal menerapkan smart crop",
          toastRemoved: "Smart crop dibatalkan.",
          badge: "GRATIS",
        },
        faceCrop: {
          idle: "Crop Wajah",
          processing: "Memproses...",
          done: "Wajah ✓",
          helper: "Memotong di sekitar wajah yang terdeteksi.",
          toastApplied: "Crop wajah diterapkan!",
          toastAlready: "Crop wajah sudah diterapkan!",
          toastError: "Gagal menerapkan crop wajah",
          toastRemoved: "Crop wajah dibatalkan.",
          zoomLabel: "Zoom (0-100)",
          zoomHelper: "Pilihan tingkat zoom. Kosongkan untuk default.",
          badge: "GRATIS",
        },
        objectCrop: {
          idle: "Crop Objek",
          processing: "Memproses...",
          done: "Dipangkas ✓",
          placeholder: "Objek fokus (mis. sepatu, tas, orang)",
          aspectLabel: "Rasio aspek",
          aspectPlaceholder: "mis. 1:1, 3:4",
          toastApplied: 'Potongan fokus pada "{{object}}" diterapkan!',
          toastAlready: "Potongan objek pintar sudah diterapkan!",
          toastMissing: "Masukkan objek yang ingin difokuskan!",
          toastError: "Gagal menerapkan potongan pintar",
          toastRemoved: "Potongan pintar dibatalkan.",
          title: "Smart Crop Objek",
          helper: "✨ AI memotong di sekitar objek yang dipilih",
          badge: "GRATIS",
          apply: "Terapkan crop",
        },
        edit: {
          placeholder:
            "Deskripsikan edit (mis. tambahkan konfeti di sekitar kue)",
          helper: "AI mengedit gambar berdasarkan prompt Anda.",
          apply: "Terapkan edit",
          toastApplied: "Edit diterapkan! {{remaining}} kredit tersisa.",
          toastAlready: "Edit sudah diterapkan!",
          toastMissing: "Mohon deskripsikan edit yang diinginkan.",
          toastError: "Gagal mengedit gambar",
          toastRemoved: "Edit dibatalkan.",
          cost: "(3 kredit)",
        },
        generativeFill: {
          widthLabel: "Lebar (px)",
          heightLabel: "Tinggi (px)",
          cropModeLabel: "Mode crop",
          cropModeOptions: {
            padResize: "Pad resize",
            padExtract: "Pad extract",
          },
          promptPlaceholder:
            "Opsional detail adegan (mis. perpanjang dengan jalan hutan)",
          helper:
            "Memperluas kanvas melebihi ukuran asli. Wajib mengisi lebar dan tinggi.",
          apply: "Terapkan fill",
          toastApplied:
            "Generative fill diterapkan! {{remaining}} kredit tersisa.",
          toastAlready: "Generative fill sudah diterapkan!",
          toastMissingDimensions: "Mohon isi lebar dan tinggi.",
          toastError: "Gagal menerapkan generative fill",
          toastRemoved: "Generative fill dibatalkan.",
          cost: "(4 kredit)",
        },
        activeList: {
          title: "Transformasi aktif",
          empty: "Belum ada transformasi",
        },
        chipRemove: "Hapus",
        clearAll: "Bersihkan",
        download: "Unduh",
      },
      preview: {
        title: "Pratinjau",
        processing: "AI sedang memproses...",
        pleaseWait: "Mohon tunggu",
        removeImage: "Hapus gambar",
      },
      recents: {
        title: "Proyek Terbaru Anda",
        subtitle: "Lanjutkan mengedit karya sebelumnya",
        loadingTitle: "Memuat proyek Anda...",
        loadingSubtitle: "Mengambil karya kreatif Anda",
        emptyTitle: "Belum ada proyek",
        emptyDescription:
          "Mulai perjalanan kreatifmu dengan mengunggah gambar pertama dan mengubahnya dengan AI",
        showingCount: "Menampilkan {{count}} dari {{total}} proyek",
        editLabel: "Edit",
      },
      toasts: {
        uploadSuccess: "Unggahan berhasil!",
        uploadFailed: "Unggahan gagal",
        invalidCredits: "Jumlah kredit tidak valid",
        insufficientCredits: "Kredit tidak mencukupi",
        paymentFailed: "Gagal memproses pembayaran",
        downloadStarted: "Pengunduhan dimulai!",
        transformationsCleared: "Semua transformasi dihapus!",
        backgroundRemoved: "Latar dihapus!",
        upscaled: "Gambar diperbesar!",
      },
    },
    settings: {
      title: "Pengaturan Akun",
      description: "Kelola preferensi akun dan pengaturan keamanan",
      account: {
        title: "Akun",
        nameLabel: "Nama",
        nameDescription:
          "Silakan masukkan nama lengkap Anda, atau nama tampilan.",
        nameInstructions: "Harap gunakan maksimal 32 karakter.",
        namePlaceholder: "Nama Anda",
        emailLabel: "Email",
        emailDescription:
          "Masukkan alamat email yang ingin Anda gunakan untuk masuk.",
        emailInstructions: "Harap masukkan alamat email yang valid.",
        emailPlaceholder: "m@contoh.com",
        emailVerifyChange:
          "Silakan periksa email Anda untuk memverifikasi perubahan.",
        avatarLabel: "Avatar",
        avatarDescription:
          "Klik pada avatar untuk mengunggah yang kustom dari file Anda.",
        avatarInstructions:
          "Avatar bersifat opsional tetapi sangat disarankan.",
        uploadAvatar: "Unggah Avatar",
        deleteAvatar: "Hapus Avatar",
        deleteAccountLabel: "Hapus Akun",
        deleteAccountDescription:
          "Hapus akun Anda dan semua isinya secara permanen. Tindakan ini tidak dapat dibatalkan — harap lanjutkan dengan hati-hati.",
        deleteAccountInstructions:
          "Harap konfirmasi penghapusan akun Anda. Tindakan ini tidak dapat dibatalkan, jadi harap lanjutkan dengan hati-hati.",
        deleteAccountVerify:
          "Silakan periksa email Anda untuk memverifikasi penghapusan akun Anda.",
      },
      security: {
        title: "Keamanan",
        changePasswordLabel: "Ubah Kata Sandi",
        changePasswordDescription:
          "Masukkan kata sandi Anda saat ini dan kata sandi baru.",
        changePasswordInstructions: "Harap gunakan minimal 8 karakter.",
        currentPasswordLabel: "Kata Sandi Saat Ini",
        currentPasswordPlaceholder: "Kata Sandi Saat Ini",
        newPasswordLabel: "Kata Sandi Baru",
        newPasswordPlaceholder: "Kata Sandi Baru",
        confirmPasswordLabel: "Konfirmasi Kata Sandi",
        confirmPasswordPlaceholder: "Konfirmasi Kata Sandi",
        passwordsDoNotMatch: "Kata sandi tidak cocok",
        changePasswordSuccess: "Kata sandi Anda telah diubah.",
        twoFactorLabel: "Autentikasi Dua Faktor",
        twoFactorCardDescription:
          "Tambahkan lapisan keamanan ekstra ke akun Anda.",
        enableTwoFactor: "Aktifkan Dua Faktor",
        disableTwoFactor: "Nonaktifkan Dua Faktor",
        twoFactorEnableInstructions:
          "Masukkan kata sandi Anda untuk mengaktifkan 2FA",
        twoFactorDisableInstructions:
          "Masukkan kata sandi Anda untuk menonaktifkan 2FA.",
        twoFactorEnabled: "Autentikasi dua faktor telah diaktifkan",
        twoFactorDisabled: "Autentikasi Dua Faktor telah dinonaktifkan",
        sessionsLabel: "Sesi",
        sessionsDescription: "Kelola sesi aktif Anda dan cabut akses.",
        currentSession: "Sesi Saat Ini",
        signout: "keluar",
        revoke: "Cabut",
      },
    },
    customerPortal: {
      loading: "Memuat portal pelanggan Anda...",
    },
    sidebar: {
      items: {
        dashboard: "Dasbor",
        create: "Buat",
        projects: "Proyek",
        topUp: "Isi Kredit",
        settings: "Pengaturan",
      },
      footer: {
        credits: "Kredit",
      },
    },
  },
} as const;

export type Translations = (typeof TRANSLATIONS)[Locale];
export type TranslationNamespace = keyof Translations;

export function formatTranslation(
  template: string,
  replacements?: Record<string, string | number>,
): string {
  if (!replacements) {
    return template;
  }

  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    const replacement = replacements[key as keyof typeof replacements];
    return replacement !== undefined ? String(replacement) : match;
  });
}

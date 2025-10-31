// Placeholder data for development and demo purposes

export interface PlaceholderPrompt {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
}

export const PLACEHOLDER_PROMPTS: PlaceholderPrompt[] = [
  {
    id: "1",
    title: "Professional Portrait",
    text: "A highly detailed professional portrait of a person, photorealistic, 8k resolution, sharp focus, natural lighting, studio setup, clean background",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    category: "portrait",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    title: "Cinematic Landscape",
    text: "Epic cinematic landscape, dramatic lighting, golden hour, mountains, lake, volumetric lighting, highly detailed, 8k, unreal engine 5",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    category: "cinematic",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    title: "Modern Architecture",
    text: "Futuristic building design, glass and steel, geometric shapes, clean lines, modern architecture, photorealistic, 8k resolution",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    category: "architecture",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
  {
    id: "4",
    title: "Abstract Art",
    text: "Abstract digital art, vibrant colors, geometric patterns, fluid dynamics, surreal, highly detailed, 8k resolution, artistic composition",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: "abstract",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "5",
    title: "Nature Close-up",
    text: "Macro photography of dew on flower petals, highly detailed, 8k resolution, bokeh background, natural lighting, sharp focus",
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    category: "nature",
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-11"),
  },
  {
    id: "6",
    title: "Urban Street Scene",
    text: "Busy city street at night, neon lights, rain reflection, photorealistic, 8k resolution, cinematic lighting, detailed architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    category: "urban",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "7",
    title: "Fantasy Character",
    text: "Elven warrior with glowing sword, detailed armor, magical aura, fantasy art, highly detailed, 8k resolution, dramatic lighting",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "fantasy",
    createdAt: new Date("2024-01-09"),
    updatedAt: new Date("2024-01-09"),
  },
  {
    id: "8",
    title: "Minimalist Still Life",
    text: "Minimalist composition, single object on white background, soft shadows, clean design, photorealistic, 8k resolution",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop",
    category: "minimalist",
    createdAt: new Date("2024-01-08"),
    updatedAt: new Date("2024-01-08"),
  },
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "portrait-men",
    title: "Men's Portrait",
    description: "Professional headshot for men",
    icon: "👨",
    prompt:
      "Professional portrait of a man, photorealistic, 8k resolution, studio lighting, clean background, sharp focus",
  },
  {
    id: "portrait-women",
    title: "Women's Portrait",
    description: "Elegant headshot for women",
    icon: "👩",
    prompt:
      "Elegant portrait of a woman, photorealistic, 8k resolution, soft lighting, clean background, sharp focus",
  },
  {
    id: "landscape-sunset",
    title: "Sunset Landscape",
    description: "Beautiful sunset over mountains",
    icon: "🌅",
    prompt:
      "Mountain landscape at sunset, golden hour lighting, dramatic clouds, highly detailed, 8k resolution",
  },
  {
    id: "architecture-modern",
    title: "Modern Building",
    description: "Contemporary architecture design",
    icon: "🏢",
    prompt:
      "Modern glass building, geometric design, clean lines, photorealistic, 8k resolution, architectural visualization",
  },
];

export const CATEGORIES = [
  "all",
  "portrait",
  "cinematic",
  "architecture",
  "abstract",
  "nature",
  "urban",
  "fantasy",
  "minimalist",
];

export const SPONSOR_DATA = {
  title: "Upgrade to Pro",
  description: "Get unlimited prompts and premium features",
  ctaText: "Start Free Trial",
  imageUrl:
    "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=200&fit=crop",
};

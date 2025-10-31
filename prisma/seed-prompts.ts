// prisma/seed-prompts.ts
// Script to seed sample prompts into the database

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const samplePrompts = [
  {
    title: "Professional Product Photography",
    text: "Create a highly detailed, professional product photography shot of [product name] on a clean white background with soft studio lighting. The product should be centered, well-lit with no harsh shadows, and photographed from a slightly elevated angle. Include subtle reflections on the surface beneath the product. Ultra-high resolution, photorealistic, 8K quality.",
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop",
    category: "product",
  },
  {
    title: "Modern Minimalist Logo Design",
    text: "Design a modern, minimalist logo for [brand name], a [industry/niche] company. The logo should feature clean lines, simple geometric shapes, and a sophisticated color palette. Incorporate negative space cleverly. The design should be versatile enough to work on both light and dark backgrounds. Vector style, professional, memorable.",
    imageUrl:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&h=600&fit=crop",
    category: "design",
  },
  {
    title: "Cinematic Landscape Photography",
    text: "Create a breathtaking cinematic landscape photograph of [location/scene] during golden hour. The composition should feature dramatic lighting, rich colors, and atmospheric depth. Include elements like misty mountains, winding rivers, or vast horizons. Shot with a wide-angle lens, HDR processing, professional color grading. Epic, awe-inspiring, National Geographic style.",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    category: "photography",
  },
  {
    title: "Futuristic Tech Interface",
    text: "Design a futuristic, holographic user interface for [application/device]. The UI should feature glowing neon elements, translucent panels, and sleek typography. Incorporate advanced data visualizations, floating menus, and interactive elements. Dark background with cyan and purple accent colors. Sci-fi aesthetic, Blade Runner inspired, high-tech.",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    category: "technology",
  },
  {
    title: "Cozy Coffee Shop Interior",
    text: "Create a warm and inviting interior design photograph of a cozy coffee shop. The scene should feature comfortable seating, warm lighting from vintage Edison bulbs, exposed brick walls, and wooden furniture. Include details like steaming coffee cups, books on shelves, and lush indoor plants. Rustic yet modern aesthetic, hygge vibes, Instagram-worthy.",
    imageUrl:
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop",
    category: "interior",
  },
  {
    title: "Fantasy Character Portrait",
    text: "Create a highly detailed fantasy character portrait of [character description]. The character should have intricate costume details, dramatic lighting, and expressive features. Include elements like magical effects, ornate jewelry, or fantasy weapons. Epic fantasy art style, painterly texture, inspired by artists like WLOP and Artgerm. 4K resolution, character concept art quality.",
    imageUrl:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
    category: "art",
  },
  {
    title: "Modern Real Estate Photography",
    text: "Create a professional real estate photograph showcasing [room/property]. The image should feature bright, natural lighting, clean and spacious interiors, and appealing architectural details. Wide-angle lens, perfectly level horizon, HDR to balance interior and exterior lighting. Include lifestyle elements like fresh flowers or styled furniture. Magazine-quality, inviting atmosphere.",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    category: "real-estate",
  },
  {
    title: "Gourmet Food Photography",
    text: "Create an appetizing, gourmet food photography shot of [dish name]. The composition should feature beautiful plating, garnishes, and vibrant colors. Use natural lighting from a window at 45 degrees, shallow depth of field to focus on the main subject. Include complementary props like fresh ingredients or elegant tableware. Restaurant-quality, food magazine style, makes viewers hungry.",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    category: "food",
  },
  {
    title: "Abstract Digital Art",
    text: "Create an abstract digital art composition featuring [theme/concept]. The artwork should have flowing shapes, vibrant color gradients, and dynamic movement. Incorporate geometric patterns, particle effects, and depth through layering. Modern, contemporary style with influences from generative art and fluid dynamics. 4K resolution, suitable for digital displays or print.",
    imageUrl:
      "https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=800&h=600&fit=crop",
    category: "art",
  },
  {
    title: "Corporate Headshot Portrait",
    text: "Create a professional corporate headshot of [person]. The portrait should feature clean lighting, a neutral or subtly colored background, and natural, confident expression. The subject should be well-groomed and professionally dressed. Classic business portrait style, sharp focus on eyes, shallow depth of field. LinkedIn-ready, approachable yet professional.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
    category: "portrait",
  },
  {
    title: "Social Media Ad Creative",
    text: "Design an eye-catching social media advertisement for [product/service]. The image should feature bold typography, vibrant colors, and a clear call-to-action. Include the product prominently with lifestyle context. Optimized for Instagram feed format (1080x1080px), thumb-stopping visuals, brand-consistent design. Modern, attention-grabbing, conversion-focused.",
    imageUrl:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
    category: "marketing",
  },
  {
    title: "Minimalist App Icon",
    text: "Design a minimalist app icon for [app name], a [app category] application. The icon should use simple geometric shapes, a limited color palette (2-3 colors max), and be instantly recognizable at small sizes. The design should work well on both iOS and Android platforms. Modern, clean, professional. Must look good on various backgrounds.",
    imageUrl:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=800&h=600&fit=crop",
    category: "design",
  },
];

async function main() {
  console.log("🌱 Seeding prompts...");

  for (const prompt of samplePrompts) {
    const created = await prisma.prompt.create({
      data: prompt,
    });
    console.log(`✅ Created prompt: ${created.title}`);
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

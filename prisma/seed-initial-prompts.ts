import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_PROMPTS = [
  {
    title: "Professional Portrait",
    text: "A highly detailed professional portrait of a person, photorealistic, 8k resolution, sharp focus, natural lighting, studio setup, clean background",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    category: "portrait",
  },
  {
    title: "Cinematic Landscape",
    text: "Epic cinematic landscape, dramatic lighting, golden hour, mountains, lake, volumetric lighting, highly detailed, 8k, unreal engine 5",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    category: "cinematic",
  },
  {
    title: "Modern Architecture",
    text: "Futuristic building design, glass and steel, geometric shapes, clean lines, modern architecture, photorealistic, 8k resolution",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    category: "architecture",
  },
  {
    title: "Abstract Art",
    text: "Abstract digital art, vibrant colors, geometric patterns, fluid dynamics, surreal, highly detailed, 8k resolution, artistic composition",
    imageUrl:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    category: "abstract",
  },
  {
    title: "Nature Close-up",
    text: "Macro photography of dew on flower petals, highly detailed, 8k resolution, bokeh background, natural lighting, sharp focus",
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    category: "nature",
  },
  {
    title: "Urban Street Scene",
    text: "Busy city street at night, neon lights, rain reflection, photorealistic, 8k resolution, cinematic lighting, detailed architecture",
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    category: "urban",
  },
  {
    title: "Fantasy Character",
    text: "Elven warrior with glowing sword, detailed armor, magical aura, fantasy art, highly detailed, 8k resolution, dramatic lighting",
    imageUrl:
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    category: "fantasy",
  },
  {
    title: "Minimalist Still Life",
    text: "Minimalist composition, single object on white background, soft shadows, clean design, photorealistic, 8k resolution",
    imageUrl:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=300&fit=crop",
    category: "minimalist",
  },
];

async function main() {
  console.log("Starting prompt seed...");

  for (const prompt of INITIAL_PROMPTS) {
    await prisma.prompt.create({
      data: prompt,
    });
    console.log(`Created prompt: ${prompt.title}`);
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

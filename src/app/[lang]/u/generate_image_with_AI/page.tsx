import type { Metadata } from "next";

import CreatePage from "~/app/[lang]/(dashboard)/dashboard/create/page";

export const metadata: Metadata = {
  title: "Generate Image with AI",
  description:
    "Try the AI image editor without signing up. Upload images, apply AI transformations, and explore the dashboard with guest credits.",
};

export default function GenerateImageWithAIPage() {
  return <CreatePage />;
}

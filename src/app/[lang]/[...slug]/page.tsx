// src/app/[lang]/[...slug]/page.tsx

import { AuthClientView } from "~/components/auth/auth-client-view";
import { assertValidLocale } from "~/lib/i18n";

interface AuthPageProps {
  params: Promise<{ lang: string; slug: string[] }>;
}

export default async function AuthPage({ params }: AuthPageProps) {
  const { lang, slug } = await params;

  assertValidLocale(lang);

  // Construct the path from slug array
  const path = slug.join("/");

  return (
    <AuthClientView path={path} loadingText="Loading..." localization={{}} />
  );
}

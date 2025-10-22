import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CustomerPortalRedirect from "~/components/CustomerPortalRedirect";
import { auth } from "~/lib/auth";
import type { Locale } from "~/lib/i18n";
import { createLocalePath } from "~/lib/locale-path";

export default async function Page({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(createLocalePath(locale, "/auth/sign-in"));
  }

  return <CustomerPortalRedirect />;
}

// src/app/[locale]/(auth)/auth/[path]/page.tsx

import { getDictionary } from "~/lib/dictionary";
import type { Locale } from "~/lib/i18n";

import { AuthClientView } from "~/components/auth/auth-client-view";

export default async function AuthPage({
  params: { lang, path },
}: {
  params: { lang: Locale; path: string | string[] };
}) {
  const dict = await getDictionary(lang);
  const { auth, common } = dict;

  const authLocalization = {
    SIGN_IN: auth.signIn.title,
    SIGN_IN_DESCRIPTION: auth.signIn.description,
    SIGN_IN_ACTION: auth.signIn.button,
    FORGOT_PASSWORD_LINK: auth.signIn.forgotPasswordLink,

    SIGN_UP: auth.signUp.title,
    SIGN_UP_DESCRIPTION: auth.signUp.description,
    SIGN_UP_ACTION: auth.signUp.button,

    EMAIL: auth.form.emailLabel,
    EMAIL_PLACEHOLDER: auth.form.emailPlaceholder,
    PASSWORD: auth.form.passwordLabel,
    PASSWORD_PLACEHOLDER: auth.form.passwordPlaceholder,
    DONT_HAVE_AN_ACCOUNT: auth.form.promptSignUp,
    ALREADY_HAVE_AN_ACCOUNT: auth.form.promptSignIn,
  };

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthClientView
        path={path}
        loadingText={common.states.loading}
        localization={authLocalization}
      />
    </main>
  );
}

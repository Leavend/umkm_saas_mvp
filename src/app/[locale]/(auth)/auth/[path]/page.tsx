"use client";

import { AuthView } from "@daveyplate/better-auth-ui";
import { useParams } from 'next/navigation';
import { useTranslations } from "~/components/language-provider";
import { useMemo } from "react";

export default function AuthPage() {
  const params = useParams();
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path;
  const translations = useTranslations();
  const { auth, common } = translations;

  const authLocalization = useMemo(() => {
    return {
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
  }, [auth]);

  if (!path) {
      return (
        <div className="flex grow items-center justify-center">
            {/* Anda bisa ganti dengan komponen Skeleton atau Loader yang lebih baik */}
            <p>{common.states.loading}</p>
        </div>
      );
  }

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthView
        path={path as string}
        redirectTo="/dashboard"
        localization={authLocalization}
      />
    </main>
  );
}
// src/app/(dashboard)/dashboard/settings/page.tsx

"use client";

import {
  RedirectToSignIn,
  SecuritySettingsCards,
  SignedIn,
} from "@daveyplate/better-auth-ui";
import { AccountSettingsCards } from "@daveyplate/better-auth-ui";
import { Loader2 } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "~/components/language-provider";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const translations = useTranslations();
  const { settings, common } = translations;
  useEffect(() => {
    const checkSession = async () => {
      try {
        await authClient.getSession();
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkSession();
  }, []);

  const accountLocalization = useMemo(() => {
    return {
      SIGN_OUT: common.actions.signOut,
      ACCOUNT: settings.account.title,
      NAME: settings.account.nameLabel,
      NAME_DESCRIPTION: settings.account.nameDescription,
      NAME_INSTRUCTIONS: settings.account.nameInstructions,
      NAME_PLACEHOLDER: settings.account.namePlaceholder,
      EMAIL: settings.account.emailLabel,
      EMAIL_DESCRIPTION: settings.account.emailDescription,
      EMAIL_INSTRUCTIONS: settings.account.emailInstructions,
      EMAIL_PLACEHOLDER: settings.account.emailPlaceholder,
      EMAIL_VERIFY_CHANGE: settings.account.emailVerifyChange,
      // AVATAR: settings.account.avatarLabel,
      // AVATAR_DESCRIPTION: settings.account.avatarDescription,
      // AVATAR_INSTRUCTIONS: settings.account.avatarInstructions,
      // UPLOAD_AVATAR: settings.account.uploadAvatar,
      // DELETE_AVATAR: settings.account.deleteAvatar,
      // DELETE_ACCOUNT: settings.account.deleteAccountLabel,
      // DELETE_ACCOUNT_DESCRIPTION: settings.account.deleteAccountDescription,
      // DELETE_ACCOUNT_INSTRUCTIONS: settings.account.deleteAccountInstructions,
      // DELETE_ACCOUNT_VERIFY: settings.account.deleteAccountVerify,
      SAVE: common.actions.save ?? "Save",
    };
  }, [settings, common]);

  const securityLocalization = useMemo(() => {
    return {
      SECURITY: settings.security.title,
      CHANGE_PASSWORD: settings.security.changePasswordLabel,
      CHANGE_PASSWORD_DESCRIPTION: settings.security.changePasswordDescription,
      CHANGE_PASSWORD_INSTRUCTIONS:
        settings.security.changePasswordInstructions,
      CURRENT_PASSWORD: settings.security.currentPasswordLabel,
      CURRENT_PASSWORD_PLACEHOLDER:
        settings.security.currentPasswordPlaceholder,
      NEW_PASSWORD: settings.security.newPasswordLabel,
      NEW_PASSWORD_PLACEHOLDER: settings.security.newPasswordPlaceholder,
      CONFIRM_PASSWORD: settings.security.confirmPasswordLabel,
      CONFIRM_PASSWORD_PLACEHOLDER:
        settings.security.confirmPasswordPlaceholder,
      PASSWORDS_DO_NOT_MATCH: settings.security.passwordsDoNotMatch,
      CHANGE_PASSWORD_SUCCESS: settings.security.changePasswordSuccess,
      // TWO_FACTOR: settings.security.twoFactorLabel,
      // TWO_FACTOR_CARD_DESCRIPTION: settings.security.twoFactorCardDescription,
      // ENABLE_TWO_FACTOR: settings.security.enableTwoFactor,
      // DISABLE_TWO_FACTOR: settings.security.disableTwoFactor,
      // TWO_FACTOR_ENABLE_INSTRUCTIONS: settings.security.twoFactorEnableInstructions,
      // TWO_FACTOR_DISABLE_INSTRUCTIONS: settings.security.twoFactorDisableInstructions,
      // TWO_FACTOR_ENABLED: settings.security.twoFactorEnabled,
      // TWO_FACTOR_DISABLED: settings.security.twoFactorDisabled,
      SESSIONS: settings.security.sessionsLabel,
      SESSIONS_DESCRIPTION: settings.security.sessionsDescription,
      CURRENT_SESSION: settings.security.currentSession,
      REVOKE: settings.security.revoke,
      SIGN_OUT: settings.security.signout,
      SAVE: common.actions.save ?? "Save",
    };
  }, [settings, common]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            {common.states.loadingSettings}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {settings.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {settings.description}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6">
            <AccountSettingsCards
              className="w-full max-w-2xl"
              localization={accountLocalization}
            />
            <SecuritySettingsCards
              className="w-full max-w-2xl"
              localization={securityLocalization}
            />
          </div>
        </div>
      </SignedIn>
    </>
  );
}

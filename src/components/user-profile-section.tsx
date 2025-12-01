// User profile section component for Top Up Modal
"use client";

import { useState, useEffect } from "react";
import { Settings, User as UserIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { updateEmailOptIn } from "~/actions/user-preferences";
import { useTranslations } from "~/components/language-provider";
import type { User } from "next-auth";

interface UserProfileSectionProps {
  user: User | undefined;
  onClose: () => void;
}

export function UserProfileSection({ user, onClose }: UserProfileSectionProps) {
  const t = useTranslations();
  const tProfile = t.profile;
  const tTopUp = t.dashboard.topUp;
  const [emailOptIn, setEmailOptIn] = useState(false);

  useEffect(() => {
    // @ts-expect-error - emailOptIn exists in DB but not in next-auth type
    if (user?.emailOptIn !== undefined) {
      // @ts-expect-error - emailOptIn exists in DB but not in next-auth type
      setEmailOptIn(user.emailOptIn === true);
    }
  }, [user]);

  const handleOptInChange = async (checked: boolean) => {
    const result = await updateEmailOptIn(checked);
    if (result.success) {
      setEmailOptIn(checked);
      toast.success(
        checked ? tProfile.emailOptInEnabled : tProfile.emailOptInDisabled,
      );
    } else {
      toast.error(tProfile.updateFailed);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <UserIcon className="h-4 w-4" />
          {tProfile.accountInfo}
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-500">{tProfile.name}:</span>{" "}
            <span className="font-medium">{user?.name || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500">{tProfile.email}:</span>{" "}
            <span className="font-medium">{user?.email || "-"}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Settings className="h-4 w-4" />
          {tProfile.emailNotifications}
        </h3>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => handleOptInChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              {tProfile.dailyCreditEmails}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {tProfile.dailyCreditEmailsDesc}
            </p>
          </div>
        </label>
      </div>

      <Button
        onClick={() => handleLogout(tTopUp, onClose)}
        variant="outline"
        className="w-full text-sm"
      >
        {tTopUp.logout}
      </Button>
    </div>
  );
}

async function handleLogout(
  tTopUp: { logoutSuccess: string; logoutFailed: string; logout: string },
  onClose: () => void,
) {
  try {
    await signOut({ redirect: false });
    toast.success(tTopUp.logoutSuccess);
    onClose();
  } catch (error) {
    console.error("Logout error:", error);
    toast.error(tTopUp.logoutFailed);
  }
}

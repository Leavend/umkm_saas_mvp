// src/components/settings-modal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useTranslations } from "~/components/language-provider";
import { useSession } from "~/lib/auth-client";
import { authClient } from "~/lib/auth-client";
import { useRouter } from "next/navigation";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const translations = useTranslations();
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      onClose();
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleCustomerPortal = () => {
    // This would redirect to customer portal
    window.open("/api/customer-portal", "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.settings.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {translations.settings.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">
              {translations.settings.account.title}
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">
                  {translations.settings.account.nameLabel}:
                </span>{" "}
                {session?.user?.name ?? "Not set"}
              </p>
              <p>
                <span className="font-medium">
                  {translations.settings.account.emailLabel}:
                </span>{" "}
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleCustomerPortal}
              className="justify-start"
            >
              {translations.common.actions.customerPortal}
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="justify-start text-red-600 hover:text-red-700"
            >
              {translations.common.actions.signOut}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

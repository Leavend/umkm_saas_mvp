import { useCallback, useEffect } from "react";
import type { Session } from "next-auth";
import type { ModalType } from "~/lib/types";

export function useModalState(
  session: Session | null,
  setActiveModal: (modal: ModalType | null) => void,
) {
  const openModal = useCallback(
    (modal: ModalType) => {
      // Only open auth modal if user is not authenticated
      if (modal === "auth" && session?.user) {
        // User already authenticated
        return;
      }
      setActiveModal(modal);
    },
    [session?.user, setActiveModal],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, [setActiveModal]);

  // Auto-close auth modal when user successfully logs in
  useEffect(() => {
    if (session?.user) {
      closeModal();
    }
  }, [session?.user, closeModal]);

  return { openModal, closeModal };
}

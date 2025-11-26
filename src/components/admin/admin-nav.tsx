"use client";

import { Container } from "~/components/container";
import { Button } from "~/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AdminNavProps {
  userName?: string;
  userEmail?: string;
}

export function AdminNav({ userName, userEmail }: AdminNavProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/en");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Admin CMS</h1>
            <div className="h-6 w-px bg-slate-300" />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{userName ?? "Admin"}</p>
              <p className="text-slate-500">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/en")}
              className="border-slate-300"
            >
              <span className="mr-2">🏠</span>
              Back to Site
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-300 hover:bg-red-50 hover:text-red-600"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}

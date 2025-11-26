import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/lib/auth";
import { isUserAdmin } from "~/lib/admin-auth";
import { AdminNav } from "~/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/en?error=unauthorized");
  }

  const isAdmin = await isUserAdmin(session);

  if (!isAdmin) {
    redirect("/en?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100">
      <AdminNav
        userName={session.user.name ?? undefined}
        userEmail={session.user.email ?? undefined}
      />
      <main className="py-8">{children}</main>
    </div>
  );
}

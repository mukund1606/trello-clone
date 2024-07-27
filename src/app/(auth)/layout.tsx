import { validateRequest } from "@/server/auth/validateRequest";

import { redirect } from "next/navigation";

import Sidebar from "@/components/Sidebar";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex h-[100dvh] w-screen">
      <Sidebar user={user} />
      <div className="w-full">{children}</div>
    </main>
  );
}

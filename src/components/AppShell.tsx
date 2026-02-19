"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import StatusBar from "@/components/StatusBar";
import AuthGuard from "@/components/AuthGuard";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen relative z-10">
        <Nav />
        <div className="flex-1 flex flex-col ml-0 md:ml-56">
          <StatusBar />
          <main className="flex-1 p-3 md:p-6 pb-20 md:pb-6 page-enter">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

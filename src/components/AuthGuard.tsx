"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (pathname === "/login") {
      setOk(true);
      return;
    }
    const auth = localStorage.getItem("nexus_auth");
    if (!auth) {
      router.replace("/login");
    } else {
      setOk(true);
    }
  }, [pathname, router]);

  if (!ok) return null;
  return <>{children}</>;
}

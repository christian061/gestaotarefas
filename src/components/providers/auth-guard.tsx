"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadFromCookies } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Tenta hidratar a sessão via cookies HttpOnly na primeira carga
    let mounted = true;
    (async () => {
      try {
        await loadFromCookies();
      } finally {
        if (!mounted) return;
        const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
        if (!useAuthStore.getState().isAuthenticated && !isPublic) {
          router.replace("/auth/login");
        } else if (useAuthStore.getState().isAuthenticated && isPublic) {
          router.replace("/");
        } else {
          setChecked(true);
        }
      }
    })();
    return () => { mounted = false; };
  }, [pathname, router, loadFromCookies]);

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!checked && !isPublic) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useLogout } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const { mutate: logout } = useLogout();

  useEffect(() => {
    // Force logout saat halaman dimuat
    logout();
  }, [logout]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg font-medium">Logging out...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we log you out
        </p>
      </div>
    </div>
  );
}

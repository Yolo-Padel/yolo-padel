"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

interface GlobalHeaderProps {
  /** When true, hides the auth/dashboard CTA button on the right. */
  hideAuthCta?: boolean;
}

export default function GlobalHeader({ hideAuthCta = false }: GlobalHeaderProps) {
  const { isLoading, isAuthenticated } = useAuth();

  return (
    <header className="relative z-30 w-full">
      <div className="lg:max-w-[1200px] mx-auto p-6 lg:p-0 lg:pt-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Image
            src="/yolo_color.svg"
            alt="Yolo Logo"
            width={100}
            height={38}
          />

          {/* Auth / dashboard CTA (hidden when requested, e.g. in PRE_PRODUCTION) */}
          {!hideAuthCta && (
            isAuthenticated && !isLoading ? (
              <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
                <Link href="/dashboard/booking">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
                <Link href="/auth">Login</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}

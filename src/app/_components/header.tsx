"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

interface GlobalHeaderProps {
  /** When true, hides the auth/dashboard CTA button on the right. */
  hideAuthCta?: boolean;
  /** When true, uses brand (terracotta) background; when false, transparent/default. */
  coloredBackground?: boolean;
}

export default function GlobalHeader({
  hideAuthCta = false,
  coloredBackground = false,
}: GlobalHeaderProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const headerBg = coloredBackground ? "bg-brand" : "";
  const navLinkClass = coloredBackground
    ? "text-brand-foreground hover:text-primary transition-colors"
    : "text-primary hover:text-primary/90 transition-colors";

  return (
    <header className={`relative z-30 w-full ${headerBg}`}>
      <div className="mx-auto p-6 lg:max-w-[1200px] lg:p-0 lg:pt-6">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0">
            <Image
              src="/yolo_color.svg"
              alt="Yolo Logo"
              width={100}
              height={38}
            />
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="/about" className={`text-sm font-medium ${navLinkClass}`}>
              About Us
            </Link>
            {/* Auth / dashboard CTA (hidden when requested, e.g. in PRE_PRODUCTION) */}
            {!hideAuthCta &&
              (isAuthenticated && !isLoading ? (
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Link href="/dashboard/booking">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 gap-2"
                >
                  <Link href="/auth">Login</Link>
                </Button>
              ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

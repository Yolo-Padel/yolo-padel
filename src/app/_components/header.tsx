"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export default function GlobalHeader() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  return (
    <header className="relative z-30 w-full">
      <div className="container mx-auto p-6 lg:p-2">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Image
            src="/yolo_color.svg"
            alt="Yolo Logo"
            width={100}
            height={38}
          />

          {/* Join Membership Button */}
          {isAuthenticated && !isLoading ? (
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/dashboard/booking">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/auth">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

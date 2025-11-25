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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Image
            src="/yolo_color.svg"
            alt="Yolo Logo"
            width={100}
            height={38}
          />

          {/* Navigation Menu */}
          {/* <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="text-white hover:text-primary transition-colors text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              href="/location"
              className="text-white hover:text-primary transition-colors text-sm lg:text-base"
            >
              Location
            </Link>
            <Link
              href="/membership"
              className="text-white hover:text-primary transition-colors text-sm lg:text-base"
            >
              Membership
            </Link>
            <Link
              href="/about"
              className="text-white hover:text-primary transition-colors text-sm lg:text-base"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white hover:text-primary transition-colors text-sm lg:text-base"
            >
              Contact Us
            </Link>
          </nav> */}

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

"use client";

import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function GlobalHeader() {
  return (
    <header className="relative z-30 w-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Image
            src="/yolo_color.svg"
            alt="Yolo Logo"
            width={100}
            height={38}
          />

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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
          </nav>

          {/* Join Membership Button */}
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Link href="/membership">
              <span className="hidden sm:inline text-black">
                Join Membership
              </span>
              <span className="sm:hidden text-black">Join</span>
              <Crown className="w-4 h-4 text-black" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

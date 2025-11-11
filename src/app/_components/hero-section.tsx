"use client";

import { BookingForm } from "@/app/dashboard/_components/booking-form";
import GlobalHeader from "./header";

export function HeroSection() {
  // For homepage, onClose is optional - just a no-op
  const handleClose = () => {
    // No-op for homepage
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero.jpg"
          alt="Padel Court"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-20 flex-1 flex flex-col">
        {/* Header */}
        <GlobalHeader />

        {/* Main Content */}
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Section - Hero Title & Description */}
            <div className="flex flex-col justify-center space-y-6 text-primary pt-35">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                Book Your Padel Court Anytime, Anywhere
              </h1>
              <p className="text-2xl sm:text-2xl text-primary max-w-lg">
                Find your nearest court and play your best game with ease.
              </p>
            </div>

            {/* Right Section - Booking Form */}
            <div className="flex justify-center">
              <div className="w-full bg-white rounded-4xl p-6">
                <BookingForm onClose={handleClose} isModal={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

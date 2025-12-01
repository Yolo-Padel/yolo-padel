"use client";

import { BookingForm } from "@/app/dashboard/_components/booking-form";
import GlobalHeader from "./header";

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image Layer */}
      <div className="fixed inset-0 z-0">
        <img
          src="/hero.jpg"
          alt="Padel Court"
          className="object-cover w-full h-full"
        />
      </div>

      {/* Black Overlay */}
      <div className="fixed inset-0 z-10 bg-black/20"></div>

      {/* Content Layer */}
      <div className="relative z-20 flex-1 flex flex-col gap-10 min-h-screen">
        {/* Header */}
        <GlobalHeader />

        {/* Main Content */}
        <div className="flex-1 container mx-auto p-6 pb-8">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Section - Hero Title & Description */}
            <div className="flex flex-col justify-center space-y-6 text-primary lg:pt-20">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-primary">
                Book Your Padel Court Anytime, Anywhere
              </h1>
              <p className="text-2xl sm:text-2xl text-primary max-w-lg">
                Find your nearest court and play your best game with ease.
              </p>
            </div>

            {/* Right Section - Booking Form */}
            <div className="flex justify-center">
              <div className="w-full bg-white rounded-4xl p-6 max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden">
                <BookingForm onClose={() => {}} isModal={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

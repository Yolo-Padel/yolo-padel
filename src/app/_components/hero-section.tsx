"use client";

import { BookingForm } from "@/app/dashboard/_components/booking-form";

export function HeroSection() {
  return (
    <div className="relative z-20 flex flex-col gap-10 w-full">
      {/* Main Content */}
      <div className="flex-1 mx-auto lg:max-w-[1200px] p-6 lg:p-0 w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full min-w-0">
          {/* Left Section - Hero Title & Description */}
          <div className="flex flex-col justify-center space-y-6 text-primary lg:pt-20 w-full min-w-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-primary">
              Book Your Padel Court Anytime, Anywhere
            </h1>
            <p className="text-2xl sm:text-2xl text-primary max-w-lg">
              Find your nearest court and play your best game with ease.
            </p>
          </div>

          {/* Right Section - Booking Form */}
          <div className="flex justify-center w-full min-w-0 max-w-full">
            <div className="w-full min-w-0 max-w-full bg-white rounded-4xl p-6 lg:max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-hidden">
              <BookingForm onClose={() => {}} isModal={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

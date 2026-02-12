"use client";

import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

/**
 * ComingSoon is a content-only block for the hero area.
 * The page is responsible for background, header, and outer layout.
 */
export function ComingSoon() {
  return (
    <div className="flex-1 mx-auto lg:max-w-[1200px] p-6 lg:p-0 w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="flex flex-col items-center justify-center text-center space-y-8 lg:pt-20 min-h-[60vh]">
        {/* Status Badge */}
        <div className="animate-fade-in-up">
          <Badge
            variant="outline"
            className="px-4 py-2 text-sm font-medium bg-white/10 border-white/30 text-white hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <Zap className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
        </div>

        {/* Main Heading */}
        <div className="animate-fade-in-up delay-200 space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            <span className="text-primary">Yolo Padel</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            We're launching soon. Stay tuned for updates.
          </p>
        </div>
      </div>
    </div>
  );
}

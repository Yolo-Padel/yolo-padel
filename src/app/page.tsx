import { HeroSection } from "@/app/_components/hero-section";
import GlobalHeader from "@/app/_components/header";
import { ComingSoon } from "@/app/_components/coming-soon";

export default function Home() {
  // Check if we're in production environment
  const isProduction = process.env.ENVIRONMENT === "PRODUCTION";

  return (
    <>
      <div className="relative z-20 flex flex-col gap-10 w-full">
        <div className="fixed inset-0 z-0">
          <img
            src="/hero.jpg"
            alt="Padel Court"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Black Overlay */}
        <div className="fixed inset-0 z-10 bg-black/20"></div>

        {/* Conditionally render based on environment */}
        {isProduction ? (
          <ComingSoon />
        ) : (
          <>
            <GlobalHeader />
            <HeroSection />
          </>
        )}
      </div>
    </>
  );
}

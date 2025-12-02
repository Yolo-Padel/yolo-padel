import { HeroSection } from "@/app/_components/hero-section";
import GlobalHeader from "@/app/_components/header";

export default function Home() {
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
        <GlobalHeader />
        <HeroSection />
      </div>
    </>
  );
}

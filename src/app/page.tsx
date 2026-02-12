import { HeroSection } from "@/app/_components/hero-section";
import GlobalHeader from "@/app/_components/header";
import { ComingSoon } from "@/app/_components/coming-soon";
import { CopyrightFooter } from "@/components/copyright-footer";

export default function Home() {
  // Check if we're in production environment
  const isPreProduction = process.env.ENVIRONMENT === "PRE_PRODUCTION";

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero section with background limited to this section */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background image + overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/hero.jpg"
            alt="Padel Court"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col gap-10 w-full">
          <GlobalHeader hideAuthCta={isPreProduction} />
          {isPreProduction ? <ComingSoon /> : <HeroSection />}
        </div>
      </section>
      {/* Flexible footer at the end of the page. */}
      <footer>
        <CopyrightFooter variant="primary" />
      </footer>
    </main>
  );
}

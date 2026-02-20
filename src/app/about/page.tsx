import GlobalHeader from "@/app/_components/header";
import { AboutHeroSection } from "@/app/_components/about-hero-section";
import { CopyrightFooter } from "@/components/copyright-footer";

export const metadata = {
  title: "About Us | Yolo Padel",
  description:
    "YOLO is a premium lifestyle hub—your third place beyond home and work. Exclusive courts, community, and where culture and capital meet.",
};

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Hero section with new layout */}
      <section className="relative flex min-h-screen w-full flex-col overflow-hidden">
        <GlobalHeader coloredBackground={false} hideAuthCta={true} />
        <AboutHeroSection />
      </section>
      <footer>
        <CopyrightFooter variant="default" />
      </footer>
    </main>
  );
}

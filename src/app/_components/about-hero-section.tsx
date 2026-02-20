/**
 * About Hero Section - Two-column layout with breadcrumb, heading, description, and image
 */

export function AboutHeroSection() {
  return (
    <section
      id="about-hero"
      aria-labelledby="about-hero-heading"
      className={`relative w-full bg-background py-8`}
    >
      <div
        className={`mx-auto w-full max-w-full px-6 lg:max-w-[1200px] lg:px-8 justify-center`}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <a href="/" className="hover:text-foreground transition-colors">
                🏠 Home
              </a>
            </li>
            <li>/</li>
            <li className="text-primary font-medium">About</li>
          </ol>
        </nav>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Text content */}
          <div className="space-y-6">
            <h1
              id="about-hero-heading"
              className="font-bold text-foreground text-4xl tracking-tight sm:text-5xl lg:text-6xl"
            >
              More than a court.{" "}
              <span className="text-primary">Your third place.</span>
            </h1>
            <p>
              YOLO is a premium lifestyle hub designed as your essential “third
              place” beyond home and work—a space for active, social, and joyful
              living. With exclusive courts, great airflow, and a strong
              community vibe, it’s built to help you move, connect, and enjoy
              life to the fullest.
            </p>
            <p>
              More than a sports venue, YOLO is where culture and capital meet.
              It brings together a high-value community, creating meaningful
              connections and positioning your brand within a refined,
              forward-looking circle.
            </p>
          </div>

          {/* Right column - Image */}
          <div className="relative">
            <div className="relative aspect-[3/3] w-full overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="/hero.jpg"
                alt="Happy family enjoying wellness activities"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

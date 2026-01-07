export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Mobile: Full background with overlay | Desktop: Plain left side */}
      <div className="relative flex flex-col gap-4 p-4 md:p-10">
        {/* Mobile background image + overlay */}
        <div className="absolute inset-0 lg:hidden">
          <img
            src="/auth.jpg"
            alt="Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
        </div>

        {/* Form content */}
        <div className="relative z-10 flex flex-col flex-1 space-y-8 justify-center lg:items-center">
          {/* Mobile logo */}
          <div className="relative z-10 lg:hidden pt-8">
            <img
              src="/yolo_color.svg"
              alt="Yolo Padel"
              className="w-[100px] h-auto"
            />
          </div>
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Desktop: Right side with background */}
      <div className="relative hidden lg:flex p-6">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <img
            src="/auth.jpg"
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover object-[0%_0%]"
          />
          <div className="absolute inset-0 bg-black/[0.18]" />

          <div className="relative z-10 flex flex-col h-full p-10 gap-8">
            <img
              src="/yolo_color.svg"
              alt="Yolo Padel"
              className="w-[100px] h-auto"
            />

            <div className="flex flex-col gap-2 max-w-[339px]">
              <h2 className="text-2xl font-semibold text-white leading-tight">
                All Your Padel Activities, One Dashboard
              </h2>
              <p className="text-sm text-white leading-relaxed">
                Book courts, manage schedules, and stay on top of your padel
                activities — all in one place.
              </p>
            </div>
          </div>

          <img
            src="/mockup.png"
            alt="App Mockup"
            className="absolute top-1/4 left-1/3 w-[700px] h-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}

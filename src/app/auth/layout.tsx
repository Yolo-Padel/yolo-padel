import { GalleryVerticalEnd } from "lucide-react";

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <img
          src="/auth.png"
          alt="Image"
          className="absolute inset-0 h-full w-full p-4 dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

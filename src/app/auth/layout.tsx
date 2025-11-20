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
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://ui.shadcn.com/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        <div className="absolute top-4 left-10">
          <img
            src="/yolo-yellow-transparent.png"
            alt="Yolo Logo"
            className="w-[100px] h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}

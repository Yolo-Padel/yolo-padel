import { AppSidebar } from "@/app/admin/dashboard/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CopyrightFooter } from "@/components/copyright-footer";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col overflow-hidden">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin" />
            </div>
          }
        >
          <div className="flex flex-1 flex-col gap-4 p-6 w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </Suspense>
        <CopyrightFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}

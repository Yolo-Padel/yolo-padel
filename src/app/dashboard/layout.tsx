import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Header } from "@/app/admin/dashboard/_components/header";
import { Suspense } from "react";
import { UserSidebar } from "./_components/user-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset>
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden ml-4" />
            <Header />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-6 pt-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}

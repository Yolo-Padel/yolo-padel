"use client";
import { getPageName } from "@/lib/page-name-utils";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="flex h-16 py-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4 justify-between w-full">
        <h1 className="text-2xl font-bold">{getPageName(pathname)}</h1>
      </div>
    </header>
  );
}

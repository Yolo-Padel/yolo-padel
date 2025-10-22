"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { getPageName } from "@/lib/page-name-utils";
import { BellIcon, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    
    return (
        <header className="flex h-16 py-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 justify-between w-full">
                <h1 className="text-2xl font-bold">{getPageName(pathname)}</h1>
                <div className="flex items-center gap-2 w-87.5">
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search"
                            value=""
                            onChange={() => {}}
                            className="pl-8 pr-8"
                        />
                        <Kbd className="absolute right-2 top-1/2 -translate-y-1/2">⌘ K</Kbd>
                    </div>
                    <Button size="icon" className="bg-[#EBEBEB]">
                        <BellIcon className="w-4 h-4 text-black" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
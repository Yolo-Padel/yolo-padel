"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { getPageName } from "@/lib/page-name-utils";
import { BellIcon, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Ambil nilai search dari URL parameter saat komponen dimount
    useEffect(() => {
        const search = searchParams.get("search");
        if (search) {
            setSearchValue(search);
        }
    }, [searchParams]);

    // Global keyboard shortcut untuk focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Fungsi untuk mengupdate URL parameter
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        
        const params = new URLSearchParams(searchParams);
        
        if (value.trim()) {
            params.set("search", value);
        } else {
            params.delete("search");
        }
        
        // Update URL tanpa reload halaman
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };


    return (
        <header className="flex h-16 py-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 justify-between w-full">
                <h1 className="text-2xl font-bold">{getPageName(pathname)}</h1>
                <div className="flex items-center gap-2 w-87.5">
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Search"
                            value={searchValue}
                            onChange={(e) => handleSearchChange(e.target.value)}
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
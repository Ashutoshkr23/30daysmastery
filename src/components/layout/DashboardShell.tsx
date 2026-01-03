"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import SideNav from "./SideNav";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="relative min-h-screen bg-background overflow-x-hidden">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                        30
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        DaysMastery
                    </span>
                </div>

                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-secondary/50 border border-border/50 text-foreground"
                >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </header>

            {/* Side Navigation (Controlled) */}
            <SideNav isOpen={isMobileMenuOpen} />

            {/* Main Content Area */}
            <main
                className={cn(
                    "min-h-screen transition-all duration-300 ease-in-out",
                    // Desktop: Always padded 64 (16rem/4 = 4rem is w-16, w-64 is 16rem) -> w-64 is 256px.
                    // Tailwind 'pl-64' is 16rem.
                    "md:pl-64",
                    // Mobile: Top padding for header
                    "pt-16 md:pt-0",
                    // Mobile Push Effect: Translate body when open
                    isMobileMenuOpen ? "translate-x-64" : "translate-x-0"
                )}
            >
                <div className="container mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Optional Overlay for Mobile to close when clicking outside (on the pushed content) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ left: "16rem" }} // Start after the sidebar
                />
            )}
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, BookOpen, User, LogOut, Settings, LayoutDashboard, Compass, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { createClient } from "@/lib/supabase/client";

export default function SideNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Hide on login/signup pages
    if (pathname === '/login') return null;

    const links = [
        {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
        },
        {
            href: "/courses",
            label: "Explore",
            icon: Compass,
        },
        {
            href: "/profile",
            label: "Profile",
            icon: User,
        },
    ];

    return (
        <>
            {/* Mobile Hamburger Button */}
            <div className="fixed top-4 left-4 z-50 md:hidden">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-background/50 backdrop-blur-md border border-border/50 text-foreground shadow-sm"
                >
                    {isMobileMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Sidebar (Desktop: Fixed, Mobile: Drawer) */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r bg-background/80 backdrop-blur-xl transition-transform duration-300 flex flex-col",
                // Mobile: Slide in/out based on state. Desktop: Always visible.
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-start px-6 border-b border-border/50">
                    <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                        30
                    </div>
                    <span className="ml-3 font-bold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        DaysMastery
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "fill-current")} />
                                <span className={cn("font-medium text-sm", isActive && "font-semibold")}>
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-border/50 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-start gap-3 w-full px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>

                    {/* User Mini Profile */}
                    <div className="flex items-center gap-3 mt-4 p-2 rounded-xl bg-secondary/50 border border-border/50">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">Aspirant</p>
                            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                        </div>
                        <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                    </div>
                </div>
            </aside>
        </>
    );
}

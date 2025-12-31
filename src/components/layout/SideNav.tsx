"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, LogOut, Settings, LayoutDashboard, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

export default function SideNav() {
    const pathname = usePathname();

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
            {/* Desktop & Mobile Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-16 md:w-64 border-r bg-background/80 backdrop-blur-xl transition-all duration-300 flex flex-col">
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-border/50">
                    <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                        30
                    </div>
                    <span className="ml-3 font-bold text-lg hidden md:block bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        DaysMastery
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 py-6 flex flex-col gap-2 px-2 md:px-4">
                    {links.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center justify-center md:justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("h-6 w-6 md:h-5 md:w-5 transition-transform group-hover:scale-110", isActive && "fill-current")} />
                                <span className={cn("hidden md:block font-medium text-sm", isActive && "font-semibold")}>
                                    {label}
                                </span>

                                {/* Active Indicator (Mobile/Collapsed) */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full md:hidden" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-border/50 space-y-2">
                    <button className="flex items-center justify-center md:justify-start gap-3 w-full px-3 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group">
                        <LogOut className="h-5 w-5" />
                        <span className="hidden md:block font-medium text-sm">Logout</span>
                    </button>

                    {/* User Mini Profile (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 mt-4 p-2 rounded-xl bg-secondary/50 border border-border/50">
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

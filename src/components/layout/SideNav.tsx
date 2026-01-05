"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, BookOpen, User, LogOut, Settings, LayoutDashboard, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface SideNavProps {
    isOpen?: boolean;
}

export default function SideNav({ isOpen = false }: SideNavProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
    };

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
        <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 border-r bg-background/80 backdrop-blur-xl transition-transform duration-300 flex flex-col",
            // Mobile: Slide in/out based on props. Desktop: Always visible (translate-x-0).
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            {/* Logo Area (Hidden on Mobile since Header has it, Visible on Desktop) */}
            <div className="hidden md:flex h-16 items-center justify-start px-6 border-b border-border/50">
                <div className="h-8 w-8 bg-gradient-to-tr from-primary to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                    30
                </div>
                <span className="ml-3 font-bold text-lg bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    DaysMastery
                </span>
            </div>

            {/* Mobile Spacer (to align with header if needed, but styling usually handles this. Let's add padding top for mobile if we want links to start below header level? 
                Actually, SideNav is z-40, Header is z-50. SideNav sits BEHIND header? 
                If 'Push' layout, SideNav usually sits NEXT to content. 
                In this 'fixed' implementation, SideNav is on top of content layer but z-index manages overlap.
                If content pushes, SideNav visual space is clear.
                Let's add a top spacer for mobile to prevent links being hidden by Mobile Header if SideNav is top-0.
             */}
            <div className="h-16 md:hidden" />

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
                <Link
                    href="/review"
                    className={cn(
                        "flex items-center justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                        pathname === "/review"
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <div className="p-1 rounded bg-blue-500/10 group-hover:bg-blue-500/20">
                        <BookOpen className={cn("h-3 w-3 text-blue-400 group-hover:text-blue-300", pathname === "/review" && "text-blue-500")} />
                    </div>
                    <span className={cn("font-medium text-sm", pathname === "/review" && "font-semibold")}>
                        Recall
                    </span>
                </Link>
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
                    {user?.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{user?.user_metadata?.full_name || "Aspirant"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || "Free Plan"}</p>
                    </div>
                    <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                </div>
            </div>
        </aside>
    );
}

import SideNav from "@/components/layout/SideNav";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Only wrap with the dashboard shell here
        <>
            <SideNav />
            {/* 
        This main wrapper handles the dashboard layout padding.
        The pl-16 md:pl-64 corresponds to the sidebar width.
      */}
            <main className="pl-16 md:pl-64 min-h-screen transition-all duration-300">
                {children}
            </main>
        </>
    );
}

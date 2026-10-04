"use client";

import Navbar from "@/components/portal/Navbar";
import { FiscalYearProvider } from "@/contexts/FiscalYearContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

function PortalContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Navbar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-[padding] duration-300 ease-in-out",
          isSidebarOpen ? "lg:pl-80" : "lg:pl-14"
        )}
      >
        <main className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
            {children}
          </div>
        </main>
        <footer className="border-t border-slate-200 py-6 sm:py-8 bg-white/50 backdrop-blur-sm mt-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest leading-relaxed">
              &copy; {new Date().getFullYear()} Corban Technologies LTD. Engineered for Excellence.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FiscalYearProvider>
      <SidebarProvider>
        <PortalContent>{children}</PortalContent>
      </SidebarProvider>
    </FiscalYearProvider>
  );
}

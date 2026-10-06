"use client";

import Navbar from "@/components/portal/Navbar";
import { FiscalYearProvider } from "@/contexts/FiscalYearContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";

function PortalContent({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900">
      <Navbar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-[padding] duration-300 ease-in-out",
          isSidebarOpen ? "lg:pl-64" : "lg:pl-14"
        )}
      >
        <main className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex-1">
          <div className="animate-in fade-in duration-300 w-full">
            {children}
          </div>
        </main>
        <footer className="border-t border-slate-200 py-2.5 bg-white mt-auto">
          <div className="w-full px-3 sm:px-4 lg:px-6 text-center">
            <p className="text-slate-400 text-[11px] font-medium">
              &copy; {new Date().getFullYear()} Corban Technologies LTD
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

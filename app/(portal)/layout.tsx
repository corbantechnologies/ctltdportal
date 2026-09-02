import Navbar from "@/components/portal/Navbar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Navbar />
      <main className="mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
      <footer className="border-t border-slate-200 py-6 sm:py-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest leading-relaxed">
            &copy; {new Date().getFullYear()} Corban Technologies LTD. Engineered for Excellence.
          </p>
        </div>
      </footer>
    </div>
  );
}

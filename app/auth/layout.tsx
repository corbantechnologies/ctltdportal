import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
      {/* Left Panel - Hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1a1c1e] p-12 text-white relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-corporate-primary/10 rounded blur-[100px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded blur-[80px] -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/logo.png"
              alt="Corban Technologies Logo"
              width={160}
              height={40}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        <div className="relative z-10 mt-auto mb-32 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Secure entry to <span className="text-corporate-primary">enterprise infrastructure.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            &mdash; The Corban Promise
          </p>
        </div>

        <div className="relative z-10 text-xs font-semibold text-slate-500 tracking-wide">
          Powered by Corban Technologies LTD
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col relative bg-slate-50 overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="mb-8 lg:hidden flex justify-center w-full">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Corban Technologies Logo"
                width={140}
                height={35}
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Home, Mail, ChevronRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-white px-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-grid-white opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-orange-100/30 rounded blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-50/40 rounded blur-[100px] animate-pulse-slow delay-1000" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-full flex justify-center mb-6">
            <span className="inline-flex items-center rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-corporate-primary border border-slate-200 shadow-sm">
              Error 404
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Lost in <span className="text-corporate-primary">The Cloud?</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto mb-10 leading-relaxed">
            The page you are looking for has been moved, deleted, or never
            existed in the first place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-corporate-primary hover:bg-orange-600 text-white rounded px-8 py-3.5 text-base font-medium transition-colors shadow-sm group w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Return Home
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded px-8 py-3.5 text-base font-medium transition-colors w-full sm:w-auto"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400">
            Corban Technologies LTD Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}

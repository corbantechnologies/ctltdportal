"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, Calculator, Layers, Book, FileText, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFetchCOAs } from "@/hooks/coa/actions";
import { useFetchBooks } from "@/hooks/books/actions";
import { cn } from "@/lib/utils";

export function GlobalSearch({ role = "finance" }: { role?: "finance" | "director" | "operations" }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Data fetch
    const { data: coas } = useFetchCOAs();
    const { data: books } = useFetchBooks();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={cn(
                    "w-full flex items-center gap-3 md:gap-5 px-2 md:px-4 py-2 md:py-2 rounded border border-slate-200 bg-white shadow-slate-100 transition-all group text-left relative overflow-hidden",
                    role === "director" ? "hover:border-corporate-primary/40" : role === "operations" ? "hover:border-blue-600/40" : "hover:border-emerald-600/40"
                )}
            >
                <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 rounded -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-10 transition-opacity",
                    role === "director" ? "bg-corporate-primary" : role === "operations" ? "bg-blue-600" : "bg-emerald-600"
                )} />

                <div className={cn(
                    "w-8 h-8 rounded flex items-center justify-center transition-all shadow-inner",
                    role === "director" ? "bg-slate-50 group-hover:bg-corporate-primary group-hover:text-white" : role === "operations" ? "bg-slate-50 group-hover:bg-blue-600 group-hover:text-white" : "bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white",
                    "text-slate-400"
                )}>
                    <Search className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm md:text-lg font-semibold group-hover:text-slate-900 transition-colors block italic truncate">
                        Access Corporate Intel...
                    </span>
                    <p className="text-[10px] font-semibold text-slate-300 mt-0.5 truncate">
                        Global Search Engine
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <kbd className="px-3 py-1.5 rounded bg-slate-900 text-white text-[9px] font-semibold shadow-2xl tracking-tighter shadow-slate-900/20">
                        CMD
                    </kbd>
                    <span className="text-slate-300 font-semibold">+</span>
                    <kbd className="px-3 py-1.5 rounded bg-slate-900 text-white text-[9px] font-semibold shadow-2xl tracking-tighter shadow-slate-900/20">
                        K
                    </kbd>
                </div>
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] animate-in fade-in duration-300"
                        onClick={() => setOpen(false)}
                    />
                    <div className="fixed top-4 sm:top-14 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-200 p-0 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-200 max-h-[85vh] flex flex-col">
                        <Command className="w-full">
                            <div className="flex items-center border-b border-slate-100 px-4 sm:px-6" cmdk-input-wrapper="">
                                <Search className="mr-2.5 h-4 w-4 shrink-0 text-slate-400" />
                                <Command.Input
                                    className="flex h-10 sm:h-11 w-full rounded bg-transparent py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Looking for something specific? (e.g. Invoices, Ledgers...)"
                                />
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <Command.List className="max-h-[320px] sm:max-h-[380px] overflow-y-auto overflow-x-hidden p-2 sm:p-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                <Command.Empty className="py-6 text-center text-xs text-slate-500 font-medium">
                                    No results found for your query.
                                </Command.Empty>

                                <Command.Group heading={<span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-1">Navigation</span>}>
                                    <Command.Item
                                        className="flex cursor-pointer select-none items-center rounded px-3 py-2 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-0.5 group"
                                        onSelect={() => runCommand(() => router.push(`/${role}/dashboard`))}
                                    >
                                        <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                            <Calculator className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-semibold text-xs sm:text-sm">Command Dashboard</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer select-none items-center rounded px-3 py-2 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-0.5 group"
                                        onSelect={() => runCommand(() => router.push(`/${role}/coa`))}
                                    >
                                        <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                            <Layers className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-semibold text-xs sm:text-sm">Chart of Accounts</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Group heading={<span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mt-2 mb-1">Ledger Accounts</span>}>
                                    {coas?.slice(0, 8).map((coa) => (
                                        <Command.Item
                                            key={coa.reference}
                                            className="flex cursor-pointer select-none items-center rounded px-3 py-2 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-0.5 group"
                                            onSelect={() => runCommand(() => router.push(`/${role}/coa/${coa.reference}`))}
                                        >
                                            <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-xs sm:text-sm">{coa.name}</span>
                                                <span className="text-[10px] text-slate-400 font-semibold tracking-wider">{coa.code}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading={<span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mt-2 mb-1">Institutional Books</span>}>
                                    {books?.slice(0, 8).map((book) => (
                                        <Command.Item
                                            key={book.reference}
                                            className="flex cursor-pointer select-none items-center rounded px-3 py-2 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-0.5 group"
                                            onSelect={() => runCommand(() => router.push(`/${role}/books/${book.reference}`))}
                                        >
                                            <div className="w-7 h-7 rounded bg-slate-50 flex items-center justify-center mr-3 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                                <Book className="h-3.5 w-3.5" />
                                            </div>
                                            <span className="font-semibold text-xs sm:text-sm">{book.name}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                            </Command.List>
                        </Command>
                    </div>
                </>
            )}
        </>
    );
}

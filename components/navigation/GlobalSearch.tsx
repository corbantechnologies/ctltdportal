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
                    <div className="fixed top-[5%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-2xl bg-white/90 backdrop-blur-2xl rounded shadow-2xl border border-slate-200 p-0 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                        <Command className="w-full">
                            <div className="flex items-center border-b border-slate-100 px-6" cmdk-input-wrapper="">
                                <Search className="mr-3 h-5 w-5 shrink-0 text-slate-400" />
                                <Command.Input
                                    className="flex h-20 w-full rounded bg-transparent py-3 text-lg font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Looking for something specific?"
                                />
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded hover:bg-slate-100 text-slate-400 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <Command.List className="max-h-[450px] overflow-y-auto overflow-x-hidden p-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                <Command.Empty className="py-12 text-center text-slate-500 font-medium">
                                    No results found for your query.
                                </Command.Empty>

                                <Command.Group heading={<span className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mb-2">Navigation</span>}>
                                    <Command.Item
                                        className="flex cursor-pointer select-none items-center rounded px-4 py-4 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-1 group"
                                        onSelect={() => runCommand(() => router.push(`/${role}/dashboard`))}
                                    >
                                        <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                            <Calculator className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold">Command Dashboard</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer select-none items-center rounded px-4 py-4 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-1 group"
                                        onSelect={() => runCommand(() => router.push(`/${role}/coa`))}
                                    >
                                        <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                            <Layers className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold">Chart of Accounts</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Group heading={<span className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mt-4 mb-2">Ledger Accounts</span>}>
                                    {coas?.slice(0, 8).map((coa) => (
                                        <Command.Item
                                            key={coa.reference}
                                            className="flex cursor-pointer select-none items-center rounded px-4 py-4 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-1 group"
                                            onSelect={() => runCommand(() => router.push(`/${role}/coa/${coa.reference}`))}
                                        >
                                            <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{coa.name}</span>
                                                <span className="text-xs text-slate-400 font-semibold tracking-wider">{coa.code}</span>
                                            </div>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Group heading={<span className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 block mt-4 mb-2">Institutional Books</span>}>
                                    {books?.slice(0, 8).map((book) => (
                                        <Command.Item
                                            key={book.reference}
                                            className="flex cursor-pointer select-none items-center rounded px-4 py-4 text-slate-600 outline-none hover:bg-slate-100 hover:text-slate-900 aria-selected:bg-slate-100 aria-selected:text-slate-900 transition-all mb-1 group"
                                            onSelect={() => runCommand(() => router.push(`/${role}/books/${book.reference}`))}
                                        >
                                            <div className="w-10 h-10 rounded bg-slate-50 flex items-center justify-center mr-4 group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all">
                                                <Book className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold">{book.name}</span>
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

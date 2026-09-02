"use client";

import { useState } from "react";
import { useFetchBooks } from "@/hooks/books/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import { BookOpen, Search, ArrowRight, Wallet, Building2, Filter } from "lucide-react";
import { formatNumber } from "@/tools/format";
import Link from "next/link";

export default function BooksPage() {
    const { data: books, isLoading } = useFetchBooks();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("ALL"); // ALL, CASH, BANK, OTHER

    if (isLoading) return <LoadingSpinner />;

    // filters
    const filteredBooks = books?.filter(b => {
        const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              b.code.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesType = true;
        if (filterType === "CASH") matchesType = b.is_cash;
        if (filterType === "BANK") matchesType = b.is_bank;
        if (filterType === "OTHER") matchesType = !b.is_cash && !b.is_bank;

        return matchesSearch && matchesType;
    }) || [];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-xl md:text-xl text-slate-900 tracking-tight">
                        Ledgers & <span className="text-emerald-600">Cash Books</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm max-w-lg">
                        Manage underlying books and view live running balances.
                    </p>
                </div>
            </div>
            
            {/* Control Panel */}
            <div className="bg-white/40 p-4 rounded border border-white/60 backdrop-blur-md shadow-sm gap-4 flex flex-col sm:flex-row">
                 <div className="relative group w-full sm:w-1/2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        className="pl-11 h-12 w-full bg-white/80 border border-black/5 rounded transition-all font-medium text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="relative group w-full sm:w-64">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded border border-black/5 bg-white/80 focus:ring-2 focus:ring-emerald-600/30 outline-none transition-all font-semibold text-[10px] uppercase tracking-widest text-black/60 shadow-sm"
                    >
                        <option value="ALL">All Ledgers</option>
                        <option value="CASH">Cash Books (Cash)</option>
                        <option value="BANK">Bank Accounts</option>
                        <option value="OTHER">Other Assets/Liabilities</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                    <div key={book.reference} className="bg-white rounded-xl border border-black/5 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded bg-slate-50 flex items-center justify-center text-slate-500">
                                {book.is_bank ? <Building2 className="w-6 h-6 text-blue-500" /> : book.is_cash ? <Wallet className="w-6 h-6 text-emerald-500" /> : <BookOpen className="w-6 h-6" />}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 bg-black/5 px-2 py-1 rounded">
                                {book.code}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {book.name}
                        </h3>
                        <p className="text-xs font-semibold text-black/40 uppercase tracking-widest mt-1">
                            {book.account_type}
                        </p>

                        <div className="mt-8 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">
                                    Current Balance
                                </p>
                                <div className="font-mono text-xl text-slate-900">
                                    KES {formatNumber(Number(book.balance || 0))}
                                </div>
                            </div>
                            <Link href={`/finance/books/${book.reference}`} className="w-10 h-10 rounded border border-black/5 flex items-center justify-center text-black/40 hover:bg-emerald-500 hover:text-white hover:border-emerald-600 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                ))}

                {filteredBooks.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white/40 border border-dashed border-black/10 rounded">
                        <BookOpen className="w-10 h-10 text-black/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-black uppercase tracking-widest italic scale-95 mb-2">No ledgers found</h3>
                        <p className="text-sm font-medium text-black/40">Try adjusting your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

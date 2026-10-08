"use client";

import { useState, useRef, useEffect } from "react";
import CreateJournalType from "@/forms/journaltypes/CreateJournalType";
import CreatePartnerType from "@/forms/partnertypes/CreatePartnerType";
import CreateSimpleTransaction from "@/forms/simpletransactions/CreateSimpleTransaction";
import { Settings2, Users, Zap, X } from "lucide-react";

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [openCreateJournalType, setOpenCreateJournalType] = useState(false);
    const [openCreatePartnerType, setOpenCreatePartnerType] = useState(false);
    const [openCreateTransaction, setOpenCreateTransaction] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close floating speed-dial when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsQuickActionsOpen(false);
            }
        }
        if (isQuickActionsOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isQuickActionsOpen]);

    return (
        <div className="relative min-h-screen">
            {children}

            {/* Collapsible Floating Quick Actions Speed Dial */}
            <div ref={menuRef} className="fixed bottom-6 right-6 flex flex-col items-end gap-2.5 z-40">
                {isQuickActionsOpen && (
                    <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
                        <button
                            onClick={() => {
                                setOpenCreateTransaction(true);
                                setIsQuickActionsOpen(false);
                            }}
                            className="flex items-center gap-2.5 bg-[#D0402B] text-white px-3.5 py-2 rounded-xl shadow-xl hover:bg-black transition-all group border border-white/10"
                        >
                            <span className="text-xs font-semibold tracking-tight whitespace-nowrap">Quick Transaction</span>
                            <Zap className="w-4 h-4 flex-shrink-0" />
                        </button>
                        <button
                            onClick={() => {
                                setOpenCreateJournalType(true);
                                setIsQuickActionsOpen(false);
                            }}
                            className="flex items-center gap-2.5 bg-white text-slate-800 px-3.5 py-2 rounded-xl shadow-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all group"
                        >
                            <span className="text-xs font-semibold tracking-tight whitespace-nowrap">New Journal Type</span>
                            <Settings2 className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-white" />
                        </button>
                        <button
                            onClick={() => {
                                setOpenCreatePartnerType(true);
                                setIsQuickActionsOpen(false);
                            }}
                            className="flex items-center gap-2.5 bg-white text-slate-800 px-3.5 py-2 rounded-xl shadow-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all group"
                        >
                            <span className="text-xs font-semibold tracking-tight whitespace-nowrap">New Partner Type</span>
                            <Users className="w-4 h-4 flex-shrink-0 text-slate-500 group-hover:text-white" />
                        </button>
                    </div>
                )}

                {/* Collapsed FAB Toggle */}
                <button
                    onClick={() => setIsQuickActionsOpen((prev) => !prev)}
                    title={isQuickActionsOpen ? "Close Quick Actions" : "Quick Actions"}
                    className={`flex items-center justify-center w-11 h-11 rounded-full shadow-xl transition-all transform active:scale-95 border ${
                        isQuickActionsOpen
                            ? "bg-slate-900 text-white border-slate-700"
                            : "bg-[#D0402B] text-white border-black/10 hover:bg-black hover:scale-105"
                    }`}
                >
                    {isQuickActionsOpen ? (
                        <X className="w-5 h-5 transition-transform" />
                    ) : (
                        <Zap className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Manual Modals - Global for Finance Section */}
            {openCreateJournalType && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpenCreateJournalType(false)}>
                    <div className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <CreateJournalType
                            rolePrefix="finance"
                            onSuccess={() => setOpenCreateJournalType(false)}
                        />
                    </div>
                </div>
            )}

            {openCreatePartnerType && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpenCreatePartnerType(false)}>
                    <div className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <CreatePartnerType
                            rolePrefix="finance"
                            onSuccess={() => setOpenCreatePartnerType(false)}
                        />
                    </div>
                </div>
            )}

            {openCreateTransaction && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpenCreateTransaction(false)}>
                    <div className="relative w-full sm:max-w-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <CreateSimpleTransaction
                            onSuccess={() => setOpenCreateTransaction(false)}
                            onClose={() => setOpenCreateTransaction(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import CreateJournalType from "@/forms/journaltypes/CreateJournalType";
import CreatePartnerType from "@/forms/partnertypes/CreatePartnerType";
import CreateSimpleTransaction from "@/forms/simpletransactions/CreateSimpleTransaction";
import { Settings2, Users, Zap } from "lucide-react";

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [openCreateJournalType, setOpenCreateJournalType] = useState(false);
    const [openCreatePartnerType, setOpenCreatePartnerType] = useState(false);
    const [openCreateTransaction, setOpenCreateTransaction] = useState(false);

    return (
        <div className="relative min-h-screen">
            {children}

            <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 flex flex-col items-end gap-3 z-40">
                <button
                    onClick={() => setOpenCreateTransaction(true)}
                    className="flex items-center gap-2 bg-[#D0402B] text-white px-4 py-2 rounded shadow-lg border border-black/5 hover:bg-black transition-all shadow-black/10 group"
                >
                    <span className="text-xs font-semibold uppercase tracking-widest hidden group-hover:block transition-all">Quick Transaction</span>
                    <Zap className="w-5 h-5 flex-shrink-0" />
                </button>
                <button
                    onClick={() => setOpenCreateJournalType(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded shadow-lg border border-black/5 hover:bg-black hover:text-white transition-all shadow-black/10 group"
                >
                    <span className="text-xs font-semibold uppercase tracking-widest hidden group-hover:block transition-all">New Journal Type</span>
                    <Settings2 className="w-5 h-5 flex-shrink-0" />
                </button>
                <button
                    onClick={() => setOpenCreatePartnerType(true)}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded shadow-lg border border-black/5 hover:bg-black hover:text-white transition-all shadow-black/10 group"
                >
                    <span className="text-xs font-semibold uppercase tracking-widest hidden group-hover:block transition-all">New Partner Type</span>
                    <Users className="w-5 h-5 flex-shrink-0" />
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

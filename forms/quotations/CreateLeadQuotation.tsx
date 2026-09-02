"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  FileText,
  Calendar,
  Clock,
  Notebook,
  ChevronRight,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createQuotation } from "@/services/quotations";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreateLeadQuotationProps {
  rolePrefix: string;
  leadReference: string;
  leadName: string;
  trigger: React.ReactNode;
}

export default function CreateLeadQuotation({
  rolePrefix,
  leadReference,
  leadName,
  trigger
}: CreateLeadQuotationProps) {
  const router = useRouter();
  const authHeaders = useAxiosAuth();
  const queryClient = useQueryClient();

  const initialValues = {
    date: new Date().toISOString().split("T")[0],
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: ""
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded shadow-2xl z-[101] overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <Dialog.Title className="text-xl font-bold text-slate-900 tracking-tight">
                  Lead <span className="text-blue-600">Quotation</span>
                </Dialog.Title>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Target: <span className="text-slate-900">{leadName}</span>
                </p>
              </div>
            </div>
            <Dialog.Close className="w-10 h-10 rounded hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const payload = {
                  ...values,
                  lead: leadReference,
                  status: "DRAFT" as const
                };


                const data = await createQuotation(payload, authHeaders);
                
                toast.success("Lead quotation initialized successfully");
                queryClient.invalidateQueries({ queryKey: ["lead", leadReference] });
                
                // Navigate to the quotation detail page
                router.push(`/${rolePrefix}/leads/${leadReference}/${data.reference}`);
              } catch (error: any) {
                const message = error.response?.data?.error || "Failed to initialize quotation";
                toast.error(message);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form className="flex flex-col">
                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                  {/* Date Controls */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Effective Date
                      </label>
                      <Field
                        type="date"
                        name="date"
                        className="w-full h-12 px-5 rounded bg-slate-50 border border-slate-100 focus:border-blue-600 focus:bg-white font-semibold text-sm transition-all text-slate-900 outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Expiration Date
                      </label>
                      <Field
                        type="date"
                        name="expiry_date"
                        className="w-full h-12 px-5 rounded bg-slate-50 border border-slate-100 focus:border-blue-600 focus:bg-white font-semibold text-sm transition-all text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Notebook className="w-3.5 h-3.5" />
                      Internal Notes
                    </label>
                    <Field
                      as="textarea"
                      name="notes"
                      placeholder="Add strategic context or internal notes for this quotation..."
                      className="w-full h-32 p-5 rounded bg-slate-50 border border-slate-100 focus:border-blue-600 focus:bg-white font-medium text-sm resize-none transition-all text-slate-900 outline-none placeholder:text-slate-300"
                    />
                  </div>

                  {/* Identification Display (Metadata) */}
                  <div className="p-4 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-blue-600" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject Identity</p>
                    </div>
                    <p className="text-[10px] font-mono font-bold text-slate-400 capitalize">{leadReference}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 group"
                  >
                    {isSubmitting ? "Syncing..." : "Generate Proposal"}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
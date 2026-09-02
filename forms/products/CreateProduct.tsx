"use client";

import { createProduct } from "@/services/products";
import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Package, Shield, Plus, X, Tag, DollarSign, Info, Activity } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Props {
  trigger?: React.ReactNode;
}

export default function CreateProduct({ trigger }: Props) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const productTypes = [
    { value: "GOODS", label: "Physical Goods" },
    { value: "SERVICE", label: "Digital Service" },
  ];

  const billingCycles = [
    { value: "ONE_TIME", label: "One-Time" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  const formik = useFormik({
    initialValues: {
      name: "",
      product_type: "GOODS",
      billing_cycle: "ONE_TIME",
      description: "",
      unit_price: 0,
      is_active: true,
      quantity: 0,
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createProduct(values as any, header);
        toast.success("Product portfolio expanded successfully");
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        await queryClient.refetchQueries({ queryKey: ["products"] });
        router.refresh();
        resetForm();
        setOpen(false);
      } catch (error: any) {
        const errorMessage = (error as any)?.response?.data?.message || "Failed to establish product";
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || (
          <button className="h-14 px-8 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-sm tracking-tight transition-all shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] flex items-center gap-3 group">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Establish Product
          </button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight italic">
                    Establish <span className="text-blue-500">Product Portfolio</span>
                  </h2>
                  <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-widest mt-1">
                    Inventory & Service Definition
                  </p>
                </div>
              </div>

              <button type="button" onClick={() => setOpen(false)} className="absolute top-8 right-8 p-2 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                    Product Nomenclature
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud SaaS, Industrial Pump X1"
                    className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold px-6 text-sm text-slate-900 outline-none"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                      Product Architecture
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {productTypes.map((type) => {
                        const isSelected = formik.values.product_type === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => formik.setFieldValue("product_type", type.value)}
                            className={cn(
                              "h-12 rounded border text-[10px] font-bold uppercase transition-all",
                              isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                            )}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                      Billing Configuration
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {billingCycles.map((cycle) => {
                        const isSelected = formik.values.billing_cycle === cycle.value;
                        return (
                          <button
                            key={cycle.value}
                            type="button"
                            onClick={() => formik.setFieldValue("billing_cycle", cycle.value)}
                            className={cn(
                              "h-12 rounded border text-[9px] font-bold uppercase transition-all text-center leading-tight px-1",
                              isSelected ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300"
                            )}
                          >
                            {cycle.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="unit_price" className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                      Unit Valuation
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        id="unit_price"
                        name="unit_price"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.unit_price}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="quantity" className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                      Initial Inventory Level
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        id="quantity"
                        name="quantity"
                        type="number"
                        required={formik.values.product_type === "GOODS"}
                        min="0"
                        disabled={formik.values.product_type === "SERVICE"}
                        placeholder={formik.values.product_type === "SERVICE" ? "N/A - Service Base" : "0"}
                        className="w-full h-14 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold pl-12 pr-6 text-sm text-slate-900 outline-none disabled:opacity-50"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.quantity}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 ml-1 block">
                    Product Narrative
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="w-full rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 transition-all font-semibold p-6 text-sm text-slate-900 outline-none resize-none"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.description}
                  />
                </div>

                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => formik.setFieldValue('is_active', !formik.values.is_active)}>
                  <div className={cn("w-6 h-6 rounded border-2 flex items-center justify-center transition-all", formik.values.is_active ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20" : "bg-white border-slate-200")}>
                    {formik.values.is_active && <Plus className="w-4 h-4 text-white rotate-45" />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Operational Readiness</span>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Enable immediate market visibility</p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full h-16 bg-slate-900 hover:bg-blue-600 text-white rounded font-semibold text-base transition-all shadow-xl hover:shadow-blue-600/20 active:scale-[0.98] group flex items-center justify-center gap-4"
                  >
                    {formik.isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Commit to Portfolio
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
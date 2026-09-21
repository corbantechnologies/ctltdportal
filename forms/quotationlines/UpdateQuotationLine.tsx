"use client";

import { useFormik } from "formik";
import { toast } from "react-hot-toast";
import { Loader2, Package, Save, X } from "lucide-react";
import { updateQuotationLine, QuotationLine } from "@/services/quotationlines";
import { useFetchProducts } from "@/hooks/products/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";

interface UpdateQuotationLineProps {
  line: QuotationLine;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function UpdateQuotationLine({
  line,
  onSuccess,
  onClose,
  className,
}: UpdateQuotationLineProps) {
  const authHeaders = useAxiosAuth();
  const { data: products } = useFetchProducts();

  const primaryColor = "#F59E0B"; // Amber for updates

  const formik = useFormik({
    initialValues: {
      product: line.product,
      description: line.description,
      quantity: line.quantity,
      unit_price: line.unit_price,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateQuotationLine(line.reference, {
          ...values,
          total_price: values.quantity * values.unit_price,
        }, authHeaders);
        
        toast.success("Line item updated successfully");
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.error || "Failed to update item",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className={`mx-auto w-full border border-slate-100 shadow-2xl rounded overflow-hidden bg-white backdrop-blur-xl flex flex-col ${className}`}
    >
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-white shadow-md"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 10px -2px ${primaryColor}4D`,
              }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-black tracking-tight">
                Update Row Component
              </h2>
              <p className="text-slate-500 font-medium text-xs mt-0.5">
                Refining asset configuration
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-slate-100 rounded text-black p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto max-h-[min(80vh,600px)]">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label
                htmlFor="product"
                className="text-xs font-semibold uppercase tracking-wider text-black ml-1 flex items-center gap-1"
              >
                Physical Asset <span className="text-amber-500 text-xs font-semibold">*</span>
              </label>
              <select
                id="product"
                name="product"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-600/20 w-full h-9 sm:h-10 rounded focus:bg-white transition-all font-medium px-3 text-xs sm:text-sm appearance-none text-slate-900 cursor-pointer"
                onChange={(e) => {
                    const product = products?.find(p => p.name === e.target.value);
                    formik.setFieldValue("product", e.target.value);
                    formik.setFieldValue("description", product?.description || "");
                    formik.setFieldValue("unit_price", product?.unit_price || 0);
                }}
                value={formik.values.product}
              >
                <option value="">Select Asset...</option>
                {products?.map(p => (
                  <option key={p.reference} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="quantity"
                className="text-xs font-semibold uppercase tracking-wider text-black ml-1 flex items-center gap-1"
              >
                Quantity <span className="text-amber-500 text-xs font-semibold">*</span>
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-600/20 w-full h-9 sm:h-10 rounded focus:bg-white transition-all font-medium px-3 text-xs sm:text-sm text-slate-900"
                onChange={formik.handleChange}
                value={formik.values.quantity}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="unit_price"
                className="text-xs font-semibold uppercase tracking-wider text-black ml-1 flex items-center gap-1"
              >
                Unit Rate <span className="text-amber-500 text-xs font-semibold">*</span>
              </label>
              <input
                id="unit_price"
                name="unit_price"
                type="number"
                required
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-600/20 w-full h-9 sm:h-10 rounded focus:bg-white transition-all font-medium px-3 text-xs sm:text-sm text-slate-900"
                onChange={formik.handleChange}
                value={formik.values.unit_price}
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label
                htmlFor="description"
                className="text-xs font-semibold uppercase tracking-wider text-black ml-1 flex items-center gap-1"
              >
                Strategic Context
              </label>
              <textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Details of this specific component..."
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-600/20 w-full p-3 rounded focus:bg-white transition-all font-medium resize-none text-xs sm:text-sm text-slate-900"
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-9 sm:h-10 text-white rounded font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] group flex items-center justify-center gap-2"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px -2px ${primaryColor}4D`,
              }}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Update Project Item
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
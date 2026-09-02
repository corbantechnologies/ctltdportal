import { useState } from "react";
import { cn } from "@/lib/utils";
import { createPartner } from "@/services/partners";
import { useFormik } from "formik";
import { PartnerSchema } from "@/validation";
import { toast } from "react-hot-toast";
import { Loader2, UserPlus, ShieldCheck, X } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useRouter } from "next/navigation";
import { useFetchPartnerTypes } from "@/hooks/partnertypes/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useQueryClient } from "@tanstack/react-query";

interface CreatePartnerProps {
  rolePrefix?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
  trigger?: React.ReactNode;
}

export default function CreatePartner({
  rolePrefix = "finance",
  onSuccess,
  onClose,
  className,
  trigger,
}: CreatePartnerProps) {
  const header = useAxiosAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: partnerTypes, isLoading: isLoadingTypes } =
    useFetchPartnerTypes();
  const { data: divisions, isLoading: isLoadingDivisions } =
    useFetchDivisions();

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      tax_pin: "",
      currency: "KES",
      wht_rate: 0,
      payment_terms: "",
      is_active: true,
      partner_type: "",
      division: "",
    },
    validationSchema: PartnerSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await createPartner(values, header);
        toast.success("Partner registered successfully");
        await queryClient.invalidateQueries({ queryKey: ["partners"] });
        await queryClient.refetchQueries({ queryKey: ["partners"] });
        resetForm();
        router.refresh();
        setOpen(false);
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to register partner",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const formBody = (
    <div
      className={cn("w-full border-black/5 shadow-2xl rounded bg-white/80 backdrop-blur-xl", className)}
    >
      <div
        className="p-4 border-b border-black/5"
        style={{ backgroundColor: `${primaryColor}0D` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded flex items-center justify-center text-white shadow-lg"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 15px -3px ${primaryColor}4D`,
              }}
            >
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-black tracking-tight uppercase italic">
                Register <span className="text-slate-900">Partner</span>
              </h2>
              <p className="text-black/50 font-semibold uppercase text-[10px] tracking-widest mt-1">
                Ecosystem Relationship Hub
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="hover:bg-red-50 hover:text-red-500 rounded p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Partner Name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="Full Entity Name"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
                style={{
                  color: primaryColor,
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="contact@entity.com"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
                style={{
                  color: primaryColor,
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-[10px] font-semibold text-red-500 uppercase ml-1">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="+254..."
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="partner_type"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Partner Category
              </label>
              <select
                id="partner_type"
                name="partner_type"
                required
                disabled={isLoadingTypes}
                className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-14 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-bold transition-all appearance-none cursor-pointer"
                style={{
                  color: primaryColor,
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.partner_type}
              >
                <option value="">Select Category...</option>
                {partnerTypes?.map((type) => (
                  <option key={type.reference} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="division"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Assigned Division
              </label>
              <select
                id="division"
                name="division"
                required
                disabled={isLoadingDivisions}
                className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-14 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-bold transition-all appearance-none cursor-pointer"
                style={{
                  color: primaryColor,
                }}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.division}
              >
                <option value="">Select Division...</option>
                {divisions?.map((div) => (
                  <option key={div.reference} value={div.name}>
                    {div.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-black/5" />

          {/* Financial Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="tax_pin"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Tax PIN (KRA)
              </label>
              <input
                id="tax_pin"
                name="tax_pin"
                placeholder="P0XXXXXXXX"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.tax_pin}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="currency"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                Preferred Currency
              </label>
              <select
                id="currency"
                name="currency"
                className="focus:outline-none focus:ring-2 focus:ring-emerald-600/20 flex h-14 w-full rounded border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-bold transition-all appearance-none cursor-pointer"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.currency}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="wht_rate"
                className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
              >
                WHT Rate (%)
              </label>
              <input
                id="wht_rate"
                name="wht_rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.wht_rate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="payment_terms"
              className="text-[10px] font-semibold uppercase tracking-widest text-black/40 ml-1 block"
            >
              Payment Terms / Notes
            </label>
            <input
              id="payment_terms"
              name="payment_terms"
              placeholder="e.g. Net 30, Pay on Delivery"
              className="border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 w-full h-14 rounded focus:bg-white transition-all font-bold px-5 text-sm"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.payment_terms}
            />
          </div>

          <div
            className="flex items-center gap-3 p-4 rounded border border-black/5"
            style={{ backgroundColor: `${primaryColor}0D` }}
          >
            <input
              id="is_active_chk"
              name="is_active"
              type="checkbox"
              className="w-5 h-5 rounded border-black/5 focus:ring-0 cursor-pointer"
              style={{
                accentColor: primaryColor,
              }}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              checked={formik.values.is_active}
            />
            <label
              htmlFor="is_active_chk"
              className="text-sm font-bold text-slate-800 cursor-pointer"
            >
              Set Partner as Active
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full h-16 text-white rounded font-bold text-base transition-all shadow-xl active:scale-[0.98] group flex items-center justify-center gap-3"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 10px 20px -5px ${primaryColor}4D`,
              }}
            >
              {formik.isSubmitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Finalize Structural Registration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {trigger && (
        <div onClick={() => setOpen(true)} className="contents">
          {trigger}
        </div>
      )}

      {!trigger && formBody}

      {open && trigger && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300" onClick={handleClose} />
          <div className="relative w-full max-w-2xl bg-white rounded shadow-2xl border border-slate-200 overflow-hidden z-[101] animate-in zoom-in-95 fade-in duration-300">
            {formBody}
          </div>
        </div>
      )}
    </>
  );
}


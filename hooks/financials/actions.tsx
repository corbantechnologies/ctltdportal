/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  postInvoiceToGL,
  payInvoice,
  recordInvoiceReceipt,
} from "@/services/invoices";
import {
  getReceipts,
  getReceipt,
  markReceiptAsPosted,
  createReceipt,
} from "@/services/financials";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useFetchInvoices() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(header),
    enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useFetchInvoice(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["invoice", reference],
    queryFn: () => getInvoice(reference, header),
    enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function usePostInvoiceToGL() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => postInvoiceToGL(reference, header),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success(data.message || "Invoice successfully posted to General Ledger.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to post invoice to General Ledger";
      toast.error(message);
    },
  });
}

export function useMarkInvoiceAsPaid() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (param: string | { reference: string; payload?: any }) => {
      const reference = typeof param === "string" ? param : param.reference;
      const payload = typeof param === "string" ? {} : param.payload;
      return payInvoice(reference, header, payload || {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Invoice paid in full. Receipt & GL settlement recorded.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to record payment";
      toast.error(message);
    },
  });
}

export function useRecordInvoiceReceipt() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => recordInvoiceReceipt(data, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["journals"] });
      toast.success("Payment receipt recorded & GL settlement posted.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || "Failed to record receipt";
      toast.error(message);
    },
  });
}

export function useFetchReceipts() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["receipts"],
    queryFn: () => getReceipts(header),
    enabled: !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useFetchReceipt(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["receipt", reference],
    queryFn: () => getReceipt(reference, header),
    enabled: !!reference && !!header.headers.Authorization && header.headers.Authorization !== "Token undefined",
  });
}

export function useMarkReceiptAsPosted() {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => markReceiptAsPosted(reference, header),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipt"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt marked as posted to ledger.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to mark receipt as posted";
      toast.error(message);
    },
  });
}

export function useCreateInvoice(rolePrefix: string) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => createInvoice(data, header),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice created successfully");
      router.push(`/${rolePrefix}/invoices/${data.reference}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to create invoice";
      toast.error(message);
    },
  });
}

export function useCreateReceipt(rolePrefix: string) {
  const header = useAxiosAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: any) => createReceipt(data, header),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      toast.success("Receipt recorded successfully");
      router.push(`/${rolePrefix}/receipts/${data.reference}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || "Failed to record receipt";
      toast.error(message);
    },
  });
}

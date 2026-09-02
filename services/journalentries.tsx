"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";

interface JournalEntry {
  code: string;
  created_by: string;
  journal: string;
  book: string;
  partner: string | null;
  division: string;
  debit: string;
  credit: string;
  currency: string;
  exchange_rate: string;
  foreign_debit: string;
  foreign_credit: string;
  payment_method: string;
  is_intercompany: boolean;
  source_document: string;
  document_number: string;
  document_file: string | null;
  notes: string;
  project: string;
  created_at: string;
  updated_at: string;
  reference: string;
}

export type { JournalEntry };

interface createJournalEntry {
  journal: string;
  book: string;
  partner: string | null;
  division: string;
  debit: number;
  credit: number;
  currency: string;
  exchange_rate: number;
  foreign_debit: number;
  foreign_credit: number;
  payment_method: string;
  is_intercompany: boolean;
  source_document: string;
  document_number: string;
  document_file: File | null;
  notes: string;
  project: string;
}

export const createJournalEntry = async (
  payload: createJournalEntry | FormData | createJournalEntry[],
  headers: { headers: { Authorization: string } }
): Promise<JournalEntry | JournalEntry[]> => {
  const response: AxiosResponse<JournalEntry | JournalEntry[]> = await apiActions.post(
    `/api/v1/journalentries/`,
    payload,
    headers
  );
  return response.data;
};

export const getJournalEntries = async (
  headers: { headers: { Authorization: string } },
  filters?: Record<string, string>
): Promise<PaginatedResponse<JournalEntry>> => {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const response: AxiosResponse<PaginatedResponse<JournalEntry>> =
    await apiActions.get(`/api/v1/journalentries/${queryString}`, headers);
  return response.data;
};

export const getJournalEntry = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<JournalEntry> => {
  const response: AxiosResponse<JournalEntry> = await apiActions.get(
    `/api/v1/journalentries/${reference}/`,
    headers
  );
  return response.data;
};

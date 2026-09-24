"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { JournalEntry } from "./journalentries";

interface Journal {
  code: string;
  financial_year: string;
  journal_type: string;
  date: string;
  description: string;
  currency: string;
  is_posted: boolean;
  status: string;
  is_reversed?: boolean;
  reversed_at?: string | null;
  reversed_by?: string | null;
  reversal_journal_reference?: string | null;
  reversal_journal_code?: string | null;
  reversal_reason?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  reference: string;
  journal_entries: JournalEntry[];
  source_transaction?: {
    reference: string;
    code: string;
    document_url: string | null;
    document_number: string | null;
    source_document: string | null;
  } | null;
}

export type { Journal };

interface createJournal {
  financial_year?: string;
  journal_type: string;
  date: string;
  description: string;
  currency: string;
}

interface updateJournal {
  journal_type?: string;
  date?: string;
  description?: string;
  currency?: string;
}

// finance responsibilities

export const createJournal = async (
  data: createJournal,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.post(
    `/api/v1/journals/`,
    data,
    headers
  );
  return response.data;
};

export const updateJournal = async (
  reference: string,
  data: updateJournal,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.patch(
    `/api/v1/journals/${reference}/`,
    data,
    headers
  );
  return response.data;
};

// to be used to close/post a journal only after all entries are created
export const postJournal = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.post(
    `/api/v1/journals/${reference}/post/`,
    {},
    headers
  );
  return response.data;
};

// All can read

export const getJournals = async (headers: {
  headers: { Authorization: string };
}): Promise<Journal[]> => {
  const response: AxiosResponse<PaginatedResponse<Journal>> =
    await apiActions.get(`/api/v1/journals/`, headers);
  return response.data.results || [];
};

export const getJournal = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.get(
    `/api/v1/journals/${reference}/`,
    headers
  );
  return response.data;
};

export interface ReverseJournalData {
  reversal_date?: string;
  reason: string;
}

export const reverseJournal = async (
  reference: string,
  data: ReverseJournalData,
  headers: { headers: { Authorization: string } }
): Promise<{
  message: string;
  original_reference: string;
  reversal_reference: string;
  reversal_code: string;
  reversal_date: string;
}> => {
  const response = await apiActions.post(
    `/api/v1/journals/${reference}/reverse/`,
    data,
    headers
  );
  return response.data;
};

export const bulkPostJournals = async (
  references: string[],
  headers: { headers: { Authorization: string } }
): Promise<{ message: string; posted_count: number; errors: string[] }> => {
  const response = await apiActions.post(
    `/api/v1/journals/bulk-post/`,
    { references },
    headers
  );
  return response.data;
};

export interface JournalStudioEntryInput {
  book: string;
  division?: string;
  partner?: string;
  debit: number;
  credit: number;
  notes?: string;
  payment_method?: string;
  source_document?: string;
  document_number?: string;
}

export interface CreateJournalStudioData {
  date: string;
  journal_type: string;
  description: string;
  currency?: string;
  post_now?: boolean;
  entries?: JournalStudioEntryInput[];
}

export interface BulkJournalBatchInput {
  date: string;
  journal_type: string;
  description: string;
  currency?: string;
  post_now?: boolean;
  entries: JournalStudioEntryInput[];
}

export interface BulkJournalCreateResponse {
  message: string;
  count: number;
  batches: Array<{
    reference: string;
    code: string;
    description: string;
    is_posted: boolean;
    entries_count: number;
  }>;
}

export const createJournalStudio = async (
  data: CreateJournalStudioData,
  headers: { headers: { Authorization: string } }
): Promise<Journal> => {
  const response: AxiosResponse<Journal> = await apiActions.post(
    `/api/v1/journals/studio-create/`,
    data,
    headers
  );
  return response.data;
};

export const bulkCreateJournalBatches = async (
  batches: BulkJournalBatchInput[],
  headers: { headers: { Authorization: string } }
): Promise<BulkJournalCreateResponse> => {
  const response: AxiosResponse<BulkJournalCreateResponse> = await apiActions.post(
    `/api/v1/journals/bulk-create/`,
    { batches },
    headers
  );
  return response.data;
};


"use client";

import { apiActions } from "@/tools/axios";
import { AxiosResponse } from "axios";
import { PaginatedResponse } from "./general";
import { JournalEntry } from "./journalentries";

interface Book {
  code: string;
  name: string;
  account_type: string;
  is_active: boolean;
  is_bank: boolean;
  is_tax: boolean;
  is_cash: boolean;
  is_current: boolean;
  description: string;
  balance: number;
  created_at: string;
  updated_at: string;
  reference: string;
  journal_entries: JournalEntry[];
}

export type { Book };

interface createBook {
  code: string; //has to be unique
  name: string; // has to be unique
  account_type: string; // name of coa
  is_active: boolean;
  is_bank: boolean;
  is_tax: boolean;
  is_cash: boolean;
  is_current: boolean;
  description: string;
}

interface updateBook {
  name?: string;
  is_active?: boolean;
  is_bank?: boolean;
  is_tax?: boolean;
  is_cash?: boolean;
  is_current?: boolean;
  description?: string;
}

// finance responsibilities
export const createBook = async (
  data: createBook,
  headers: { headers: { Authorization: string } }
): Promise<Book> => {
  const response: AxiosResponse<Book> = await apiActions.post(
    `/api/v1/books/`,
    data,
    headers
  );
  return response.data;
};

export const deleteBook = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Book> => {
  const response: AxiosResponse<Book> = await apiActions.delete(
    `/api/v1/books/${reference}/`,
    headers
  );
  return response.data;
};

// All access
// All can read

export const getBooks = async (headers: {
  headers: { Authorization: string };
}): Promise<Book[]> => {
  const response: AxiosResponse<PaginatedResponse<Book>> = await apiActions.get(
    `/api/v1/books/`,
    headers
  );
  return response.data.results || [];
};

export const getBook = async (
  reference: string,
  headers: { headers: { Authorization: string } }
): Promise<Book> => {
  const response: AxiosResponse<Book> = await apiActions.get(
    `/api/v1/books/${reference}/`,
    headers
  );
  return response.data;
};

"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { getBooks, getBook } from "@/services/books";

export function useFetchBooks() {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["books"],
    queryFn: () => getBooks(header),
    enabled: !!header.headers.Authorization,
  });
}

export function useFetchBook(reference: string) {
  const header = useAxiosAuth();

  return useQuery({
    queryKey: ["book", reference],
    queryFn: () => getBook(reference, header),
    enabled: !!reference && !!header.headers.Authorization,
  });
}

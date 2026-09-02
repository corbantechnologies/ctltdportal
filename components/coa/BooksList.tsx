/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Book as BookIcon,
  ArrowRight,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Wallet,
  Landmark,
  Percent,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Book } from "@/services/books";

type CSSWithVariables = React.CSSProperties & {
  [key: string]: string | number;
};

interface BooksListProps {
  books: Book[];
  rolePrefix: string;
  coaReference: string;
}

export default function BooksList({
  books,
  rolePrefix,
  coaReference,
}: BooksListProps) {
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredBooks = useMemo(() => {
    if (!books) return [];

    return books.filter(
      (book) =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.account_type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [books, searchQuery]);

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage]);

  const primaryColor = rolePrefix === "director" ? "#D0402B" : rolePrefix === "operations" ? "#2563EB" : "#045138";

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-black/5 rounded border-2 border-dashed border-black/10">
        <div className="w-16 h-16 rounded bg-white flex items-center justify-center text-black/20 mb-4 shadow-sm">
          <BookIcon className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-black/40 uppercase tracking-widest">
          No ledger books found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white/50 backdrop-blur-xl p-2 rounded border border-black/5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20"
              style={{ color: searchQuery ? primaryColor : undefined }}
            />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-11 h-10 w-full rounded border border-black/5 bg-black/5 focus:bg-white transition-all font-semibold text-xs focus:outline-none focus:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/5 p-1.5 rounded self-end lg:self-auto">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-semibold uppercase tracking-widest transition-all ${view === "grid"
              ? "bg-white shadow-sm"
              : "text-black/40 hover:text-black"
              }`}
            style={
              {
                color: view === "grid" ? primaryColor : undefined,
              } as CSSWithVariables
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-semibold uppercase tracking-widest transition-all ${view === "table"
              ? "bg-white shadow-sm"
              : "text-black/40 hover:text-black"
              }`}
            style={
              {
                color: view === "table" ? primaryColor : undefined,
              } as CSSWithVariables
            }
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {paginatedBooks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm font-semibold text-black/20 uppercase tracking-[0.2em]">
            No books match your criteria
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedBooks.map((book) => (
            <Link
              key={book.reference}
              href={`/${rolePrefix}/coa/${coaReference}/${book.reference}`}
              className="group"
            >
              <div className="border border-black/5 shadow-sm hover:shadow-2xl transition-all duration-500 rounded overflow-hidden bg-white/80 backdrop-blur-xl group-hover:-translate-y-1 h-full flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded bg-black/5 flex items-center justify-center text-black/40 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                      {book.is_bank ? (
                        <Landmark className="w-6 h-6" />
                      ) : book.is_cash ? (
                        <Wallet className="w-6 h-6" />
                      ) : (
                        <BookIcon className="w-6 h-6" />
                      )}
                    </div>
                    {book.is_active ? (
                      <span className="bg-green-500/10 text-green-600 border-none font-semibold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded inline-block">
                        Active
                      </span>
                    ) : (
                      <span className="bg-black/5 text-black/40 border-none font-semibold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded inline-block">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <h3
                      className="text-lg font-semibold text-black tracking-tight transition-colors line-clamp-2"
                      style={
                        { "--hover-text": primaryColor } as CSSWithVariables
                      }
                    >
                      {book.name}
                    </h3>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mt-1"
                      style={{ color: primaryColor } as CSSWithVariables}
                    >
                      {book.code}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-black/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-black/30">
                        Classification
                      </span>
                      <span className="text-[10px] font-semibold text-black/60">
                        {book.account_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {book.is_bank && (
                          <span className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-semibold px-1.5 py-0.5 rounded inline-block">
                            BANK
                          </span>
                        )}
                        <span className={`border-none text-[8px] font-semibold px-1.5 py-0.5 rounded inline-block truncate ${book.is_current ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}>
                          {book.is_current ? "CURRENT" : "LONG-TERM"}
                        </span>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-black/20 transition-all ml-2 flex-shrink-0"
                        style={
                          {
                            "--group-hover-text": primaryColor,
                          } as CSSWithVariables
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white backdrop-blur-xl border border-black/5 rounded overflow-hidden shadow shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b border-black/10 bg-black/5">
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase">
                    Book Identity
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase">
                    Account Type
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase">
                    Compliance
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase">
                    Status
                  </th>
                  <th className="text-left py-2 px-4 text-[10px] font-semibold uppercase">
                    Audit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedBooks.map((book) => (
                  <tr
                    key={book.reference}
                    className="transition-colors group"
                    style={
                      { "--hover-bg": `${primaryColor}0D` } as CSSWithVariables
                    }
                  >
                    <td className="py-2 px-4 border-b border-black/5">
                      <div className="flex items-center gap-3">
                        <div>
                          <Link
                            className="text-xs transition-colors"
                            href={`/${rolePrefix}/coa/${coaReference}/${book.reference}`}
                            style={
                              {
                                "--group-hover-text": primaryColor,
                              } as CSSWithVariables
                            }
                          >
                            {book.name}
                          </Link>
                          <p className="italic text-[9px] uppercase tracking-widest mt-0.5">
                            {book.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <p className="text-[11px] font-semibold text-black/60 uppercase tracking-wider">
                        {book.account_type}
                      </p>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      <div className="flex gap-1.5 flex-wrap">
                        {book.is_tax && (
                          <span className="bg-orange-500/10 text-orange-600 border-none text-[8px] font-semibold px-1.5 py-0.5 rounded inline-block">
                            TAX
                          </span>
                        )}
                        {book.is_bank && (
                          <span className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-semibold px-1.5 py-0.5 rounded inline-block">
                            BANK
                          </span>
                        )}
                        <span className={`border-none text-[8px] font-semibold px-1.5 py-0.5 rounded inline-block ${book.is_current ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"}`}>
                          {book.is_current ? "CURRENT" : "LONG-TERM"}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 border-b border-black/5">
                      {book.is_active ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <div className="w-1.5 h-1.5 rounded bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            In Operation
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-black/30">
                          <div className="w-1.5 h-1.5 rounded bg-black/20" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider">
                            Retired
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right border-b border-black/5">
                      <Link
                        href={`/${rolePrefix}/coa/${coaReference}/${book.reference}`}
                      >
                        <button
                          className="flex items-center justify-center h-7 w-7 p-0 rounded hover:text-white transition-all duration-300"
                          style={
                            { "--hover-bg": primaryColor } as CSSWithVariables
                          }
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-xl p-6 rounded border border-black/5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-black/30">
            Showing <span className="text-black">{paginatedBooks.length}</span>{" "}
            of <span className="text-black">{filteredBooks.length}</span> books
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center justify-center w-10 h-10 p-0 border border-black/5 rounded bg-white shadow-sm transition-all disabled:opacity-30 hover:text-white"
              style={{ ["--hover-bg" as any]: primaryColor }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 px-4">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded text-[10px] font-semibold transition-all ${currentPage === page
                        ? "text-white shadow-lg"
                        : "bg-white border border-black/5 text-black/40 hover:text-black shadow-sm"
                        }`}
                      style={
                        {
                          backgroundColor:
                            currentPage === page ? primaryColor : undefined,
                          boxShadow:
                            currentPage === page
                              ? `0 10px 15px -3px ${primaryColor}33`
                              : undefined,
                        } as CSSWithVariables
                      }
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <MoreHorizontal
                      key={page}
                      className="w-4 h-4 text-black/20"
                    />
                  );
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center justify-center w-10 h-10 p-0 border border-black/5 rounded bg-white shadow-sm transition-all disabled:opacity-30 hover:text-white"
              style={{ ["--hover-bg" as any]: primaryColor }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

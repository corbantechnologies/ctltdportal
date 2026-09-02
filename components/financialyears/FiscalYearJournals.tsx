/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import {
  FileText,
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Journal } from "@/services/journals";
import LoadingSpinner from "@/components/portal/LoadingSpinner";

interface FiscalYearJournalsProps {
  journals: Journal[];
  rolePrefix: string;
  fiscalYearReference: string;
}

export default function FiscalYearJournals({
  journals,
  rolePrefix,
  fiscalYearReference,
}: FiscalYearJournalsProps) {
  const [view, setView] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: journalTypes, isLoading: isLoadingTypes } =
    useFetchJournalTypes();

  const primaryColor = rolePrefix === "director" ? "#D0402B" : "#045138";

  const filteredJournals = useMemo(() => {
    if (!journals) return [];
    return journals.filter((journal) => {
      const journalDate = new Date(journal.date);

      // Text Search
      const matchesSearch =
        journal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.journal_type.toLowerCase().includes(searchQuery.toLowerCase());

      // Type Filter
      const matchesType =
        typeFilter === "all" || journal.journal_type === typeFilter;

      // Status Filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "posted" && journal.is_posted) ||
        (statusFilter === "pending" && !journal.is_posted);

      // Date Range Filter
      const matchesDateRange =
        (!startDate || journalDate >= new Date(startDate)) &&
        (!endDate || journalDate <= new Date(endDate));

      return matchesSearch && matchesType && matchesDateRange && matchesStatus;
    });
  }, [journals, searchQuery, typeFilter, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredJournals.length / itemsPerPage);
  const paginatedJournals = filteredJournals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (isLoadingTypes) return <LoadingSpinner />;

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Controls Section */}
      <div className="bg-white p-3 rounded border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 transition-colors" />
            <input
              type="text"
              placeholder="Search journals..."
              className="pl-9 h-9 w-full bg-gray-50 border border-gray-200 rounded transition-all font-medium text-xs shadow-sm focus:outline-none focus:ring-1 focus:bg-white"
              style={{
                ["--tw-ring-color" as any]: primaryColor,
              }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap lg:flex-nowrap gap-2 items-center">
            {/* Type Filter */}
            <div className="relative w-32 md:w-40">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-8 pr-2 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-gray-100 transition-all appearance-none cursor-pointer hover:bg-gray-50"
              >
                <option value="all">All Types</option>
                {journalTypes?.map((type) => (
                  <option key={type.reference} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative w-28 md:w-36">
              <CheckCircle2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-8 pr-2 rounded border border-gray-200 bg-white text-xs font-medium text-gray-700 outline-none focus:ring-2 focus:ring-gray-100 transition-all appearance-none cursor-pointer hover:bg-gray-50"
              >
                <option value="all">Status</option>
                <option value="posted">Posted</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Date Range Group */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded border border-gray-200">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-7 w-28 bg-white border-0 rounded text-[10px] px-2 shadow-sm focus:outline-none focus:ring-1"
                  placeholder="Start"
                />
              </div>
              <span className="text-gray-300">-</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-7 w-28 bg-white border-0 rounded text-[10px] px-2 shadow-sm focus:outline-none focus:ring-1"
                  placeholder="End"
                />
              </div>
            </div>

            {/* View Toggles */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded border border-gray-200 ml-auto lg:ml-0">
              <button
                onClick={() => setView("grid")}
                className="flex items-center justify-center w-7 h-7 rounded transition-all shadow-sm"
                style={{
                  backgroundColor: view === "grid" ? primaryColor : "white",
                  color: view === "grid" ? "white" : "gray",
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setView("table")}
                className="flex items-center justify-center w-7 h-7 rounded transition-all shadow-sm"
                style={{
                  backgroundColor:
                    view === "table" ? primaryColor : "white",
                  color: view === "table" ? "white" : "gray",
                }}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Clear Filters (Conditional) */}
            {(searchQuery ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              startDate ||
              endDate) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center h-9 w-9 bg-white border border-gray-200 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Clear Filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedJournals.map((journal) => (
            <Link
              key={journal.reference}
              href={`/${rolePrefix}/fiscal-years/${fiscalYearReference}/journals/${journal.reference}`}
              className="group block"
            >
              <div className="h-full border border-gray-100 bg-white rounded overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:bg-white">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center transition-all duration-300 shadow-sm bg-gray-50 text-gray-400 group-hover:text-white"
                    >
                      <FileText className="w-5 h-5" />
                      <style jsx>{`
                        .group:hover .group-hover\\:bg-primary {
                          background-color: ${primaryColor} !important;
                          color: white !important;
                        }
                      `}</style>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-[9px] font-semibold uppercase tracking-widest border-none inline-block ${journal.is_posted
                        ? "bg-green-50 text-green-600 shadow-sm shadow-green-100"
                        : "bg-orange-50 text-orange-600 shadow-sm shadow-orange-100"
                        }`}
                    >
                      {journal.is_posted ? "Posted" : "Pending"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3
                        className="text-base font-semibold text-black tracking-tight leading-snug transition-colors mb-1.5 italic"
                        style={{
                          color: "black",
                        }}
                      >
                        {journal.description || "No Description Provided"}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400 font-semibold uppercase text-[9px] tracking-[0.2em]">
                        <Calendar className="w-3 h-3" />
                        {new Date(journal.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                          Registry Ref
                        </span>
                        <span className="text-xs font-mono font-semibold text-black">
                          {journal.reference}
                        </span>
                      </div>
                      <div className="w-7 h-7 rounded bg-gray-50 flex items-center justify-center text-gray-400 transition-all group-hover:bg-black group-hover:text-white">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded border border-gray-100 overflow-hidden shadow-lg shadow-gray-100/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Posting Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Journal Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">
                    Ref
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {paginatedJournals.map((journal) => (
                  <tr
                    key={journal.reference}
                    className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors cursor-pointer group"
                    onClick={() =>
                      (window.location.href = `/${rolePrefix}/fiscal-years/${fiscalYearReference}/journals/${journal.reference}`)
                    }
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(journal.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-900 font-medium">
                          {journal.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded border-transparent inline-block"
                      >
                        {journal.journal_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {journal.is_posted ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 text-green-700">
                          <span className="w-1.5 h-1.5 rounded bg-green-500" />
                          <span className="text-xs font-medium">Posted</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-yellow-50 text-yellow-700">
                          <span className="w-1.5 h-1.5 rounded bg-yellow-500" />
                          <span className="text-xs font-medium">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs text-gray-400 font-mono">
                        {journal.reference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded border border-gray-100 shadow-sm mt-6 gap-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center md:text-left">
            Showing{" "}
            <span className="text-black font-semibold">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="text-black font-semibold">
              {Math.min(currentPage * itemsPerPage, filteredJournals.length)}
            </span>{" "}
            of{" "}
            <span className="text-black font-semibold">
              {filteredJournals.length}
            </span>{" "}
            journals
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[150px] sm:max-w-none scrollbar-none pb-1 md:pb-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center border border-gray-200 rounded bg-white transition-all hover:bg-gray-50 hover:text-black disabled:opacity-30 h-8 px-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </button>
            <div className="flex gap-1 shrink-0">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex items-center justify-center w-8 h-8 rounded transition-all font-semibold text-xs border ${currentPage === i + 1
                    ? "text-white border-transparent shadow-md"
                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-400"
                    }`}
                  style={{
                    backgroundColor:
                      currentPage === i + 1 ? primaryColor : undefined,
                    boxShadow:
                      currentPage === i + 1
                        ? `0 4px 6px -1px ${primaryColor}33`
                        : undefined,
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center border border-gray-200 rounded bg-white transition-all hover:bg-gray-50 hover:text-black disabled:opacity-30 h-8 px-3 font-semibold text-gray-500 text-[10px] uppercase tracking-wider"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {filteredJournals.length === 0 && !isLoadingTypes && (
        <div className="py-16 text-center bg-white rounded border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-black tracking-tight mb-2 uppercase tracking-widest italic scale-95">
            No Journals Found
          </h3>
          <p className="text-gray-400 font-semibold max-w-sm mx-auto text-xs">
            This fiscal year does not contain any journal entries matching your
            criteria.
          </p>
        </div>
      )}
    </div>
  );
}

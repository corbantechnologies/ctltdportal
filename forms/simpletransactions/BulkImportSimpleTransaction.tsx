/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBackendError } from "@/lib/error-handler";
import { formatNumber } from "@/tools/format";
import { downloadSampleCSVTemplate } from "@/tools/csvExport";
import { useFetchBooks } from "@/hooks/books/actions";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchJournalTypes } from "@/hooks/journaltypes/actions";
import { useFetchPaymentMethods } from "@/hooks/paymentmethods/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { useBulkCreateSimpleTransactions } from "@/hooks/simpletransactions/actions";
import { CreateSimpleTransaction } from "@/services/simpletransactions";

interface ParsedCSVRow {
  rowNumber: number;
  data: Partial<CreateSimpleTransaction>;
  errors: string[];
  isValid: boolean;
}

interface BulkImportSimpleTransactionProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * Basic RFC 4180 CSV parser
 */
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export default function BulkImportSimpleTransaction({
  onSuccess,
  onClose,
}: BulkImportSimpleTransactionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCSVRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const { data: books } = useFetchBooks();
  const { data: divisions } = useFetchDivisions();
  const { data: journalTypes } = useFetchJournalTypes();
  const { data: paymentMethods } = useFetchPaymentMethods();
  const { data: partners } = useFetchPartners();

  const bulkCreateMutation = useBulkCreateSimpleTransactions();

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid .csv file.");
      return;
    }

    setFileName(file.name);
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          toast.error("CSV file is empty or missing headers.");
          setParsedRows([]);
          setIsProcessingFile(false);
          return;
        }

        const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));
        const dataRows = rows.slice(1);

        // Find header indices
        const nameIdx = rawHeaders.findIndex((h) => h.includes("name") || h.includes("desc"));
        const typeIdx = rawHeaders.findIndex((h) => h.includes("type"));
        const amountIdx = rawHeaders.findIndex((h) => h.includes("amount"));
        const dateIdx = rawHeaders.findIndex((h) => h.includes("date"));
        const bookIdx = rawHeaders.findIndex((h) => h.includes("book") || h.includes("ledger"));
        const methodIdx = rawHeaders.findIndex((h) => h.includes("method") || h.includes("payment"));
        const divIdx = rawHeaders.findIndex((h) => h.includes("division"));
        const jTypeIdx = rawHeaders.findIndex((h) => h.includes("journal"));
        const partnerIdx = rawHeaders.findIndex((h) => h.includes("partner") || h.includes("vendor"));
        const sourceDocIdx = rawHeaders.findIndex((h) => h.includes("source"));
        const docNumIdx = rawHeaders.findIndex((h) => h.includes("docnum") || h.includes("doc_num") || h.includes("documentnumber") || h.includes("ref"));

        const bookNames = new Set(books?.map((b) => b.name.toLowerCase()) || []);
        const divisionNames = new Set(divisions?.map((d) => d.name.toLowerCase()) || []);
        const journalTypeNames = new Set(journalTypes?.map((j) => j.name.toLowerCase()) || []);
        const paymentMethodNames = new Set(paymentMethods?.map((p) => p.name.toLowerCase()) || []);
        const partnerNames = new Set(partners?.map((p) => p.name.toLowerCase()) || []);

        const results: ParsedCSVRow[] = dataRows.map((row, idx) => {
          const rowErrors: string[] = [];
          const name = nameIdx !== -1 ? row[nameIdx] : "";
          const rawType = typeIdx !== -1 ? row[typeIdx]?.toUpperCase() : "";
          const type: "MONEY_IN" | "MONEY_OUT" =
            rawType.includes("IN") ? "MONEY_IN" : "MONEY_OUT";
          const rawAmount = amountIdx !== -1 ? row[amountIdx]?.replace(/[^0-9.-]+/g, "") : "";
          const amount = parseFloat(rawAmount);
          const date = dateIdx !== -1 ? row[dateIdx] : "";
          const rawBook = bookIdx !== -1 ? row[bookIdx] : "";
          const rawMethod = methodIdx !== -1 ? row[methodIdx] : "";
          const rawDivision = divIdx !== -1 ? row[divIdx] : "";
          const rawJournalType = jTypeIdx !== -1 ? row[jTypeIdx] : "";
          const rawPartner = partnerIdx !== -1 ? row[partnerIdx] : "";
          const sourceDoc = sourceDocIdx !== -1 ? row[sourceDocIdx] : "";
          const docNum = docNumIdx !== -1 ? row[docNumIdx] : "";

          // Validation
          if (!name) rowErrors.push("Missing Description");
          if (!rawAmount || isNaN(amount) || amount <= 0) {
            rowErrors.push("Invalid Amount (must be > 0)");
          }
          if (!date || isNaN(Date.parse(date))) {
            rowErrors.push("Invalid Date (use YYYY-MM-DD)");
          }

          // Case-matched names
          const matchedBook = books?.find((b) => b.name.toLowerCase() === rawBook.toLowerCase())?.name || rawBook;
          if (!rawBook) {
            rowErrors.push("Missing Ledger Book");
          } else if (!bookNames.has(rawBook.toLowerCase())) {
            rowErrors.push(`Unknown Book '${rawBook}'`);
          }

          const matchedMethod = paymentMethods?.find((p) => p.name.toLowerCase() === rawMethod.toLowerCase())?.name || rawMethod;
          if (!rawMethod) {
            rowErrors.push("Missing Payment Method");
          } else if (!paymentMethodNames.has(rawMethod.toLowerCase())) {
            rowErrors.push(`Unknown Payment Method '${rawMethod}'`);
          }

          const matchedDivision = divisions?.find((d) => d.name.toLowerCase() === rawDivision.toLowerCase())?.name || rawDivision;
          if (!rawDivision) {
            rowErrors.push("Missing Division");
          } else if (!divisionNames.has(rawDivision.toLowerCase())) {
            rowErrors.push(`Unknown Division '${rawDivision}'`);
          }

          const matchedJournalType = journalTypes?.find((j) => j.name.toLowerCase() === rawJournalType.toLowerCase())?.name || rawJournalType;
          if (!rawJournalType) {
            rowErrors.push("Missing Journal Type");
          } else if (!journalTypeNames.has(rawJournalType.toLowerCase())) {
            rowErrors.push(`Unknown Journal Type '${rawJournalType}'`);
          }

          const matchedPartner = rawPartner
            ? (partners?.find((p) => p.name.toLowerCase() === rawPartner.toLowerCase())?.name || rawPartner)
            : null;

          return {
            rowNumber: idx + 2, // 1-indexed accounting for header row
            data: {
              name,
              transaction_type: type,
              amount: isNaN(amount) ? 0 : amount,
              date,
              ledger_book: matchedBook,
              payment_method: matchedMethod,
              division: matchedDivision,
              journal_type: matchedJournalType,
              partner: matchedPartner,
              source_document: sourceDoc || null,
              document_number: docNum || null,
            },
            errors: rowErrors,
            isValid: rowErrors.length === 0,
          };
        });

        setParsedRows(results);
        toast.success(`Parsed ${results.length} rows from CSV.`);
      } catch (err) {
        toast.error("Failed to parse CSV file. Please check file format.");
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsText(file);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const totalValidAmount = validRows.reduce(
    (sum, r) => sum + (r.data.amount || 0),
    0
  );

  const handleImportValid = async () => {
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    try {
      const payload = validRows.map((r) => r.data as CreateSimpleTransaction);
      const res = await bulkCreateMutation.mutateAsync(payload);
      toast.success(
        `Successfully imported ${res.count} transactions and generated journals!`
      );
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(formatBackendError(err, "Failed to import CSV transactions"));
    }
  };

  const handleReset = () => {
    setFileName(null);
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto w-full border border-slate-200 shadow-2xl rounded-lg overflow-hidden bg-white max-h-[92vh] flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">CSV Batch Import</h2>
            <p className="text-slate-300 text-xs mt-0.5">
              Upload a CSV file to bulk log transactions and auto-generate journals.
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/10 rounded text-slate-300 p-2 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Template Download Banner */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Need the spreadsheet template?
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Download our ready-made CSV template with proper column headers and sample data.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSampleCSVTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-all shadow-sm flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Sample CSV
          </button>
        </div>

        {/* Upload Dropzone */}
        {!fileName ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50 hover:bg-slate-100/70 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <div className="w-12 h-12 rounded-full bg-slate-200/80 group-hover:bg-slate-900 group-hover:text-white text-slate-600 flex items-center justify-center mx-auto mb-3 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Click to browse or drag and drop your CSV file here
            </p>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Accepts .csv files up to 5MB
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-slate-700" />
              <div>
                <p className="text-xs font-bold text-slate-900 font-mono">{fileName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {parsedRows.length} total rows parsed ({validRows.length} valid, {invalidRows.length} errors)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
            >
              Choose Different File
            </button>
          </div>
        )}

        {/* Validation Overview Cards */}
        {parsedRows.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Rows</span>
              <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                {parsedRows.length}
              </p>
            </div>
            <div className="bg-emerald-50/80 border border-emerald-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Valid Rows</span>
              <p className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                {validRows.length}
              </p>
            </div>
            <div className="bg-red-50/80 border border-red-200 rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-red-600">Invalid Rows</span>
              <p className="text-base font-bold font-mono text-red-700 mt-0.5">
                {invalidRows.length}
              </p>
            </div>
          </div>
        )}

        {/* Parsed Rows Preview Table */}
        {parsedRows.length > 0 && (
          <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 w-14 text-center">Row</th>
                  <th className="py-2.5 px-3 w-28">Status</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Description</th>
                  <th className="py-2.5 px-3 w-28 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-3 w-28">Date</th>
                  <th className="py-2.5 px-3 min-w-[130px]">Ledger Book</th>
                  <th className="py-2.5 px-3 min-w-[120px]">Payment Method</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Division</th>
                  <th className="py-2.5 px-3 min-w-[110px]">Journal Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {parsedRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={cn(
                      "hover:bg-slate-50 transition-colors",
                      !row.isValid ? "bg-red-50/40" : ""
                    )}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                      #{row.rowNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Ready
                        </span>
                      ) : (
                        <span
                          title={row.errors.join("; ")}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded truncate max-w-[140px]"
                        >
                          <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                          {row.errors[0]}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {row.data.name || <span className="text-red-500 italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      KES {formatNumber(row.data.amount || 0)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {row.data.date || <span className="text-red-500 italic">Missing</span>}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.data.ledger_book}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.data.payment_method}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.data.division}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {row.data.journal_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex-shrink-0 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-semibold hidden sm:block">
          {validRows.length > 0 ? (
            <>
              Ready to import <span className="font-bold text-slate-900">{validRows.length}</span> valid transactions.
            </>
          ) : (
            "Upload a CSV to begin."
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-11 rounded border border-slate-200 bg-white font-semibold text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleImportValid}
            disabled={bulkCreateMutation.isPending || validRows.length === 0}
            className="w-full sm:w-auto px-6 h-11 rounded font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {bulkCreateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                Import {validRows.length} Valid Transaction(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

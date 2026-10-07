"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  FileText,
  Layers,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Receipt,
  Search,
  UserCog,
  X,
} from "lucide-react";

import LoadingSpinner from "@/components/portal/LoadingSpinner";
import InteractionTimeline from "@/components/crm/InteractionTimeline";
import UpdatePartner from "@/forms/partners/UpdatePartner";
import CreatePartnerQuotation from "@/forms/quotations/CreatePartnerQuotation";
import CreateQuotationModal from "@/forms/quotations/CreateQuotationModal";
import { useFetchPartner } from "@/hooks/partners/actions";
import { formatNumber } from "@/tools/format";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/services/journalentries";

type Role = "finance" | "operations" | "director";
type TabId = "ledger" | "journals" | "transactions" | "proposals" | "activity";

interface PartnerProfileProps {
  rolePrefix: Role;
}

/* ------------------------------------------------------------------ */
/* helpers                                                              */
/* ------------------------------------------------------------------ */

/** The accounting date of an entry is its journal date. created_at is audit-only. */
const entryDate = (e: JournalEntry): string =>
  e.journal_date || (e.created_at ? e.created_at.slice(0, 10) : "");

const fmtDate = (iso?: string | null): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const num = (v: string | number | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v || "0") || 0;

const money = (v: number): string => (v === 0 ? "—" : formatNumber(v));

const balanceLabel = (v: number): string =>
  `${formatNumber(Math.abs(v))} ${v >= 0 ? "Dr" : "Cr"}`;

const statusTone = (status?: string | null): string => {
  switch ((status || "").toLowerCase()) {
    case "posted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "reversed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

const PAGE_SIZE = 100;

/* ------------------------------------------------------------------ */
/* component                                                            */
/* ------------------------------------------------------------------ */

export default function PartnerProfile({ rolePrefix }: PartnerProfileProps) {
  const { reference } = useParams<{ reference: string }>();
  const router = useRouter();
  const { isLoading, data: partner } = useFetchPartner(reference);

  const [tab, setTab] = useState<TabId>("ledger");
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [postedOnly, setPostedOnly] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const entries: JournalEntry[] = useMemo(
    () => partner?.journal_entries ?? [],
    [partner],
  );
  const transactions = useMemo(
    () => partner?.simple_transactions ?? [],
    [partner],
  );

  /** Chronological ledger with a running balance computed over the full history. */
  const ledger = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const da = entryDate(a);
      const db = entryDate(b);
      if (da !== db) return da < db ? -1 : 1;
      return (a.created_at || "") < (b.created_at || "") ? -1 : 1;
    });
    let running = 0;
    return sorted.map((e) => {
      const debit = num(e.debit);
      const credit = num(e.credit);
      running += debit - credit;
      return { entry: e, date: entryDate(e), debit, credit, balance: running };
    });
  }, [entries]);

  const filteredLedger = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ledger.filter(({ entry, date }) => {
      if (postedOnly && !entry.journal_is_posted) return false;
      if (from && date < from) return false;
      if (to && date > to) return false;
      if (!q) return true;
      return [
        entry.journal,
        entry.journal_description,
        entry.book,
        entry.division,
        entry.notes,
        entry.document_number,
        entry.source_document,
        entry.payment_method,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [ledger, query, from, to, postedOnly]);

  const totals = useMemo(
    () =>
      filteredLedger.reduce(
        (acc, r) => ({
          debit: acc.debit + r.debit,
          credit: acc.credit + r.credit,
        }),
        { debit: 0, credit: 0 },
      ),
    [filteredLedger],
  );

  /** The partner's share of each journal batch. */
  const journals = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        code: string;
        reference?: string;
        fy?: string;
        date: string;
        description: string;
        status: string;
        debit: number;
        credit: number;
        lines: number;
      }
    >();
    for (const e of entries) {
      const key = e.journal_reference || e.journal;
      const row = map.get(key) ?? {
        key,
        code: e.journal,
        reference: e.journal_reference,
        fy: e.financial_year_reference,
        date: entryDate(e),
        description: e.journal_description || "",
        status: e.journal_status || (e.journal_is_posted ? "Posted" : "Draft"),
        debit: 0,
        credit: 0,
        lines: 0,
      };
      row.debit += num(e.debit);
      row.credit += num(e.credit);
      row.lines += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries]);

  const allTotals = useMemo(
    () =>
      ledger.reduce(
        (acc, r) => ({ debit: acc.debit + r.debit, credit: acc.credit + r.credit }),
        { debit: 0, credit: 0 },
      ),
    [ledger],
  );
  const netBalance = allTotals.debit - allTotals.credit;

  if (isLoading) return <LoadingSpinner />;
  if (!partner) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Partner not found.
      </div>
    );
  }

  const journalHref = (fy?: string | null, ref?: string | null) =>
    fy && ref ? `/${rolePrefix}/fiscal-years/${fy}/journals/${ref}` : null;

  const canEdit = rolePrefix !== "director";
  const hasStatement = rolePrefix !== "operations";

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "ledger", label: "Ledger", count: entries.length },
    { id: "journals", label: "Journals", count: journals.length },
    { id: "transactions", label: "Transactions", count: transactions.length },
    ...(rolePrefix === "operations"
      ? [
          {
            id: "proposals" as TabId,
            label: "Proposals",
            count: partner.quotations?.length ?? 0,
          },
        ]
      : []),
    ...(rolePrefix === "director"
      ? [{ id: "activity" as TabId, label: "Activity" }]
      : []),
  ];

  const itemClass =
    "flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-700 cursor-pointer outline-none hover:bg-slate-100 focus:bg-slate-100";

  return (
    <div className="space-y-3 pb-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          <li>
            <Link href={`/${rolePrefix}/dashboard`} className="ui-link text-slate-500">
              Dashboard
            </Link>
          </li>
          <li className="text-slate-300">/</li>
          <li>
            <Link href={`/${rolePrefix}/partners`} className="ui-link text-slate-500">
              Partners
            </Link>
          </li>
          <li className="text-slate-300">/</li>
          <li className="font-medium text-slate-900">{partner.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="ui-btn !px-1.5"
            aria-label="Go back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {partner.name}
          </h1>
          <span className="ui-badge border-slate-200 bg-slate-50 text-slate-600">
            {partner.code}
          </span>
          <span
            className={cn(
              "ui-badge",
              partner.is_active
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200",
            )}
          >
            {partner.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Actions live in a popover instead of a row of buttons */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="ui-btn ui-btn-primary">
              Actions
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-[100] w-52 p-1 bg-white rounded border border-slate-200 shadow-lg"
            >
              {hasStatement && (
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/${rolePrefix}/partners/${partner.reference}/statement`}
                    className={itemClass}
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Customer statement
                  </Link>
                </DropdownMenu.Item>
              )}
              <DropdownMenu.Item asChild>
                <Link
                  href={`/${rolePrefix}/invoices/new?partner=${partner.code}`}
                  className={itemClass}
                >
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                  New invoice
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  href={`/${rolePrefix}/simple-transactions?search=${encodeURIComponent(partner.name)}`}
                  className={itemClass}
                >
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  All quick transactions
                </Link>
              </DropdownMenu.Item>
              {rolePrefix === "operations" && (
                <CreatePartnerQuotation
                  rolePrefix="operations"
                  partnerCode={partner.code}
                  partnerName={partner.name}
                  trigger={
                    <DropdownMenu.Item
                      onSelect={(e) => e.preventDefault()}
                      className={itemClass}
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                      New quotation
                    </DropdownMenu.Item>
                  }
                />
              )}
              {rolePrefix === "director" && (
                <CreateQuotationModal
                  rolePrefix="director"
                  initialPartner={{ code: partner.code, name: partner.name }}
                  trigger={
                    <DropdownMenu.Item
                      onSelect={(e) => e.preventDefault()}
                      className={itemClass}
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
                      New quotation
                    </DropdownMenu.Item>
                  }
                />
              )}
              {canEdit && (
                <>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item
                    onSelect={() => setEditOpen(true)}
                    className={itemClass}
                  >
                    <UserCog className="w-3.5 h-3.5 text-slate-400" />
                    Edit profile
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </header>

      {/* Profile strip */}
      <section
        aria-label="Partner details"
        className="ui-card grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 divide-x divide-y xl:divide-y-0 divide-slate-100"
      >
        {[
          { label: "Type", value: partner.partner_type || "—" },
          { label: "Division", value: partner.division || "Global" },
          { label: "Tax PIN", value: partner.tax_pin || "—" },
          { label: "Currency", value: partner.currency || "KES" },
          { label: "Payment terms", value: partner.payment_terms || "—" },
          { label: "WHT rate", value: `${partner.wht_rate ?? 0}%` },
          {
            label: "Phone",
            value: partner.phone || "—",
            href: partner.phone ? `tel:${partner.phone}` : undefined,
            icon: Phone,
          },
          {
            label: "Email",
            value: partner.email || "—",
            href: partner.email ? `mailto:${partner.email}` : undefined,
            icon: Mail,
          },
        ].map((f) => (
          <div key={f.label} className="px-3 py-2 min-w-0">
            <p className="ui-label">{f.label}</p>
            {f.href ? (
              <a
                href={f.href}
                className="ui-link text-xs font-medium flex items-center gap-1 truncate"
              >
                {f.icon && <f.icon className="w-3 h-3 shrink-0" />}
                <span className="truncate">{f.value}</span>
              </a>
            ) : (
              <p className="text-xs font-medium text-slate-900 truncate" title={f.value}>
                {f.value}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* Balances */}
      <section
        aria-label="Balances"
        className="grid grid-cols-2 lg:grid-cols-5 gap-2"
      >
        {[
          { label: "Total debit", value: formatNumber(allTotals.debit), tone: "text-slate-900" },
          { label: "Total credit", value: formatNumber(allTotals.credit), tone: "text-slate-900" },
          {
            label: "Net balance",
            value: balanceLabel(netBalance),
            tone: netBalance === 0 ? "text-slate-900" : netBalance > 0 ? "text-emerald-700" : "text-rose-700",
          },
          { label: "Journal batches", value: String(journals.length), tone: "text-slate-900" },
          { label: "Quick transactions", value: String(transactions.length), tone: "text-slate-900" },
        ].map((k) => (
          <div key={k.label} className="ui-card px-3 py-2">
            <p className="ui-label">{k.label}</p>
            <p className={cn("text-sm font-semibold font-mono tabular-nums", k.tone)}>
              {k.value}
            </p>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div role="tablist" className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              tab === t.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 px-1 rounded bg-slate-100 text-[10px] text-slate-600">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LEDGER */}
      {tab === "ledger" && (
        <section className="ui-card" aria-label="Partner ledger">
          <div className="ui-card-header">
            <h2 className="ui-card-title">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Partner ledger
              <span className="font-normal text-slate-400">
                by transaction date
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisible(PAGE_SIZE);
                  }}
                  placeholder="Search ledger"
                  className="ui-input !w-40 !pl-6"
                  aria-label="Search ledger"
                />
              </div>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="ui-input !w-28"
                aria-label="From date"
              />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="ui-input !w-28"
                aria-label="To date"
              />
              <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postedOnly}
                  onChange={(e) => setPostedOnly(e.target.checked)}
                  className="accent-slate-900"
                />
                Posted only
              </label>
              {(query || from || to || postedOnly) && (
                <button
                  type="button"
                  className="ui-btn"
                  onClick={() => {
                    setQuery("");
                    setFrom("");
                    setTo("");
                    setPostedOnly(false);
                  }}
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Journal</th>
                  <th>Account</th>
                  <th>Division</th>
                  <th>Narration</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.slice(0, visible).map(({ entry, date, debit, credit, balance }) => {
                  const href = journalHref(entry.financial_year_reference, entry.journal_reference);
                  return (
                    <tr key={entry.reference}>
                      <td className="whitespace-nowrap">{fmtDate(date)}</td>
                      <td className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          {href ? (
                            <Link href={href} className="ui-link font-medium">
                              {entry.journal}
                            </Link>
                          ) : (
                            <span className="font-medium">{entry.journal}</span>
                          )}
                          <span className={cn("ui-badge !text-[9px]", statusTone(entry.journal_status))}>
                            {entry.journal_status || (entry.journal_is_posted ? "Posted" : "Draft")}
                          </span>
                        </span>
                      </td>
                      <td>{entry.book}</td>
                      <td className="text-slate-500">{entry.division}</td>
                      <td className="max-w-[260px] truncate text-slate-600" title={entry.notes || entry.journal_description || ""}>
                        {entry.notes || entry.journal_description || "—"}
                      </td>
                      <td className="ui-num">{money(debit)}</td>
                      <td className="ui-num">{money(credit)}</td>
                      <td className="ui-num font-medium text-slate-900">{balanceLabel(balance)}</td>
                    </tr>
                  );
                })}
                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan={8} className="!py-8 text-center text-slate-400">
                      No ledger entries match.
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredLedger.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={5}>
                      Totals ({filteredLedger.length} lines)
                    </td>
                    <td className="ui-num">{formatNumber(totals.debit)}</td>
                    <td className="ui-num">{formatNumber(totals.credit)}</td>
                    <td className="ui-num">{balanceLabel(totals.debit - totals.credit)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          {filteredLedger.length > visible && (
            <div className="p-2 text-center border-t border-slate-100">
              <button type="button" className="ui-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Show more ({filteredLedger.length - visible} remaining)
              </button>
            </div>
          )}
        </section>
      )}

      {/* JOURNALS */}
      {tab === "journals" && (
        <section className="ui-card" aria-label="Journal batches">
          <div className="ui-card-header">
            <h2 className="ui-card-title">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              Journal batches involving this partner
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Journal</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-right">Lines</th>
                  <th className="text-right">Debit</th>
                  <th className="text-right">Credit</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {journals.map((j) => {
                  const href = journalHref(j.fy, j.reference);
                  return (
                    <tr
                      key={j.key}
                      className={href ? "cursor-pointer" : undefined}
                      onClick={() => href && router.push(href)}
                    >
                      <td className="whitespace-nowrap">{fmtDate(j.date)}</td>
                      <td className="whitespace-nowrap font-medium">
                        {href ? (
                          <Link href={href} className="ui-link" onClick={(e) => e.stopPropagation()}>
                            {j.code}
                          </Link>
                        ) : (
                          j.code
                        )}
                      </td>
                      <td className="max-w-[320px] truncate text-slate-600" title={j.description}>
                        {j.description || "—"}
                      </td>
                      <td>
                        <span className={cn("ui-badge", statusTone(j.status))}>{j.status}</span>
                      </td>
                      <td className="ui-num">{j.lines}</td>
                      <td className="ui-num">{money(j.debit)}</td>
                      <td className="ui-num">{money(j.credit)}</td>
                      <td className="text-right">
                        {href && <ExternalLink className="w-3 h-3 inline text-slate-400" />}
                      </td>
                    </tr>
                  );
                })}
                {journals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="!py-8 text-center text-slate-400">
                      No journal batches recorded for this partner.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* QUICK TRANSACTIONS */}
      {tab === "transactions" && (
        <section className="ui-card" aria-label="Quick transactions">
          <div className="ui-card-header">
            <h2 className="ui-card-title">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Quick transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Method</th>
                  <th className="text-right">Amount</th>
                  <th>Journal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const href = journalHref(t.financial_year_reference, t.journal_reference);
                  const isIn = t.transaction_type === "MONEY_IN";
                  return (
                    <tr key={t.reference} className={t.is_reversed ? "opacity-60" : undefined}>
                      <td className="whitespace-nowrap">{fmtDate(t.date)}</td>
                      <td className="whitespace-nowrap font-medium">
                        <Link
                          href={`/${rolePrefix}/simple-transactions?search=${encodeURIComponent(t.code)}`}
                          className="ui-link"
                        >
                          {t.code}
                        </Link>
                      </td>
                      <td className="max-w-[240px] truncate" title={t.name}>
                        {t.name}
                        {t.is_reversed && (
                          <span className="ui-badge ml-1.5 bg-purple-50 text-purple-700 border-purple-200">
                            Reversed
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          className={cn(
                            "ui-badge",
                            isIn
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200",
                          )}
                        >
                          {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isIn ? "Money in" : "Money out"}
                        </span>
                      </td>
                      <td>{t.ledger_book || "—"}</td>
                      <td className="text-slate-500">{t.payment_method || "—"}</td>
                      <td className="ui-num font-medium text-slate-900">{formatNumber(num(t.amount))}</td>
                      <td className="whitespace-nowrap">
                        {href ? (
                          <Link href={href} className="ui-link">
                            {t.journal_code || "View"}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="!py-8 text-center text-slate-400">
                      No quick transactions recorded for this partner.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* PROPOSALS (operations) */}
      {tab === "proposals" && (
        <section className="ui-card" aria-label="Proposals">
          <div className="ui-card-header">
            <h2 className="ui-card-title">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              Proposals
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Issue date</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(partner.quotations ?? []).map((q) => (
                  <tr
                    key={q.reference}
                    className="cursor-pointer"
                    onClick={() => router.push(`/${rolePrefix}/partners/${partner.reference}/${q.reference}`)}
                  >
                    <td className="font-medium">
                      <Link
                        href={`/${rolePrefix}/partners/${partner.reference}/${q.reference}`}
                        className="ui-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {q.code}
                      </Link>
                    </td>
                    <td>{fmtDate(q.date)}</td>
                    <td>
                      <span
                        className={cn(
                          "ui-badge",
                          q.status === "DRAFT"
                            ? "bg-slate-50 text-slate-600 border-slate-200"
                            : "bg-blue-50 text-blue-700 border-blue-200",
                        )}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <MoreHorizontal className="w-3.5 h-3.5 inline text-slate-400" />
                    </td>
                  </tr>
                ))}
                {(partner.quotations ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="!py-8 text-center text-slate-400">
                      No commercial proposals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ACTIVITY (director) */}
      {tab === "activity" && (
        <section className="ui-card p-3" aria-label="Activity">
          <InteractionTimeline partnerId={partner.reference || ""} rolePrefix="director" />
        </section>
      )}

      {canEdit && (
        <UpdatePartner
          partner={partner}
          rolePrefix={rolePrefix}
          isOpen={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}

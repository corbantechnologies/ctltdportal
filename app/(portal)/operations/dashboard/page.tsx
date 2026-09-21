"use client";

import { useFetchAccount } from "@/hooks/accounts/actions";
import LoadingSpinner from "@/components/portal/LoadingSpinner";
import LeadsList from "@/components/leads/LeadsList";
import DivisionsList from "@/components/divisions/DivisionsList";
import ProductsList from "@/components/products/ProductsList";
import PartnersList from "@/components/partners/PartnersList";
import OperationsActionsMenu from "@/components/portal/OperationsActionsMenu";
import {
  Users,
  Building2,
  CalendarRange,
  Briefcase,
  Activity,
  Package,
} from "lucide-react";
import { useFetchDivisions } from "@/hooks/divisions/actions";
import { useFetchLeads } from "@/hooks/leads/actions";
import { useFetchProducts } from "@/hooks/products/actions";
import { useFetchFinancialYears } from "@/hooks/financialyears/actions";
import { useFetchPartners } from "@/hooks/partners/actions";
import { GlobalSearch } from "@/components/navigation/GlobalSearch";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import * as Tabs from "@radix-ui/react-tabs";
import KpiStatCard from "@/components/portal/KpiStatCard";
import { cn } from "@/lib/utils";

export default function OperationsDashboard() {
  const { data: account, isLoading: accountLoading } = useFetchAccount();
  const { data: divisions, isLoading: divisionsLoading } = useFetchDivisions();
  const { data: leads, isLoading: leadsLoading } = useFetchLeads();
  const { data: products, isLoading: productsLoading } = useFetchProducts();
  const { data: years, isLoading: yearsLoading } = useFetchFinancialYears();
  const { data: partners, isLoading: partnersLoading } = useFetchPartners();

  const isLoading = accountLoading || divisionsLoading || leadsLoading || productsLoading || yearsLoading || partnersLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const activeYear = years?.find((y: { is_active: boolean; code: string }) => y.is_active);

  const stats = [
    {
      label: "Operational Units",
      value: divisions?.length || 0,
      icon: Building2,
      description: "Active Divisions",
      color: "blue" as const,
    },
    {
      label: "Active Prospects",
      value: leads?.length || 0,
      icon: Users,
      description: "Pipeline Leads",
      color: "emerald" as const,
    },
    {
      label: "Product Portfolio",
      value: products?.length || 0,
      icon: Package,
      description: "Active Units",
      color: "amber" as const,
    },
    {
      label: "Partnerships",
      value: partners?.length || 0,
      icon: Briefcase,
      description: "Onboarded Accounts",
      color: "purple" as const,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Search Interface */}
      <GlobalSearch role="operations" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Operations <span className="text-blue-600">Insight</span>
            </h1>
            {activeYear && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                FY {activeYear.code}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            Welcome back, <span className="text-slate-900 font-medium">{account?.first_name}</span>. Monitoring active pipelines and corporate structural integrity.
          </p>
        </div>
        <OperationsActionsMenu />
      </div>

      <Tabs.Root defaultValue="health" className="space-y-6">
        <Tabs.List className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
          <Tabs.Trigger
            value="health"
            className="px-3.5 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            System Health &amp; Pipeline
          </Tabs.Trigger>
          <Tabs.Trigger
            value="reports"
            className="px-3.5 py-1.5 rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:font-semibold"
          >
            Tactical Reports
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="health" className="space-y-8 focus-visible:outline-none">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <KpiStatCard
                key={i}
                title={stat.label}
                value={stat.value}
                subtitle={stat.description}
                icon={stat.icon}
                accentColor={stat.color}
              />
            ))}
          </div>

          <div className="space-y-8">
            {/* Leads Management Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Pipeline Dynamics
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    Active Capture &amp; Response Cycle
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200 text-[10px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Pipeline Active</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <LeadsList rolePrefix="operations" />
              </div>
            </div>

            {/* Product Inventory Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Portfolio Inventory
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    Active Goods &amp; Services Database
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-[10px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Inventory Linked</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <ProductsList rolePrefix="operations" />
              </div>
            </div>

            {/* Partnerships Management Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Partner Directory
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    Vendor &amp; Customer Ledger Profiles
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-200 text-[10px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span>Network Synced</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <PartnersList rolePrefix="operations" />
              </div>
            </div>

            {/* Organizational Infrastructure Section */}
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Unit Infrastructure
                  </h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                    Corporate Organizational Structure
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[10px] font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  <span>System Architecture</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <DivisionsList rolePrefix="operations" />
              </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="reports" className="focus-visible:outline-none">
          <ReportsDashboard rolePrefix="operations" />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
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
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Prospects",
      value: leads?.length || 0,
      icon: Users,
      description: "Pipeline Leads",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Product Portfolio",
      value: products?.length || 0,
      icon: Package,
      description: "Active Units",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Partnerships",
      value: partners?.length || 0,
      icon: Briefcase,
      description: "Onboarded Accounts",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Search Interface */}
      <GlobalSearch role="operations" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-semibold uppercase text-blue-600">
              Operational Command Hub
            </p>
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-900 tracking-tight italic">
            Operations <span className="text-blue-600">Insight</span>
          </h1>
          <p className="text-slate-400 font-semibold mt-2 text-sm max-w-lg">
            Welcome back, <span className="text-slate-900">{account?.first_name}</span>.
            Monitoring active pipelines and corporate structural integrity.
          </p>
        </div>
        <OperationsActionsMenu />
      </div>

      <Tabs.Root defaultValue="health" className="space-y-10">
        <Tabs.List className="flex w-full overflow-x-auto md:inline-flex md:w-auto p-1.5 bg-slate-100 rounded border border-slate-200 shadow-inner scrollbar-hide">
          <Tabs.Trigger
            value="health"
            className="shrink-0 whitespace-nowrap px-4 py-3 rounded text-[10px] font-semibold uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            System Health
          </Tabs.Trigger>
          <Tabs.Trigger
            value="reports"
            className="shrink-0 whitespace-nowrap px-4 py-3 rounded text-[10px] font-semibold uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-slate-100 text-slate-400 hover:text-slate-600"
          >
            Tactical Reports
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="health" className="space-y-16 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500"
              >
                <div className={cn("absolute top-0 right-0 w-24 h-24 rounded blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30 group-hover:opacity-60 transition-opacity", stat.bg)} />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className={cn("w-12 h-12 rounded flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-widest text-[9px] mb-1">
                      {stat.label}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-tighter">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-12">
            {/* Leads Management Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase italic">
                    Pipeline <span className="text-blue-600">Dynamics</span>
                    </h2>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-1">
                    Active Capture & Response Cycle
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded border border-blue-100 shadow-sm">
                    <div className="w-2 h-2 rounded bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Pipeline Active</span>
                </div>
                </div>
                
                <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
                    <LeadsList rolePrefix="operations" />
                </div>
            </div>

             {/* Product Inventory Section */}
             <div className="space-y-8 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase italic">
                    Portfolio <span className="text-amber-600">Inventory</span>
                    </h2>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-1">
                    Active Goods & Services Database
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded border border-amber-100 shadow-sm animate-pulse">
                    <div className="w-2 h-2 rounded bg-amber-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Inventory Linked</span>
                </div>
                </div>
                
                <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
                    <ProductsList rolePrefix="operations" />
                </div>
            </div>

            {/* Partnerships Management Section */}
            <div className="space-y-8 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase italic">
                    Ecosystem <span className="text-purple-600">Partnerships</span>
                    </h2>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-1">
                    Strategic Vendors & Relationship Network
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded border border-purple-100 shadow-sm animate-pulse">
                    <div className="w-2 h-2 rounded bg-purple-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Relationships Linked</span>
                </div>
                </div>
                
                <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
                    <PartnersList rolePrefix="operations" />
                </div>
            </div>

            {/* Organizational Infrastructure Section */}
            <div className="space-y-8 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight uppercase italic text-blue-600">
                    Unit <span className="text-slate-900">Infrastructure</span>
                    </h2>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mt-1">
                    Corporate Organizational Structure
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded border border-slate-100 shadow-sm animate-pulse">
                    <div className="w-2 h-2 rounded bg-slate-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">System Architecture</span>
                </div>
                </div>
                
                <div className="bg-slate-50/50 p-1 rounded border border-slate-100">
                    <DivisionsList rolePrefix="operations" />
                </div>
            </div>
          </div>
        </Tabs.Content>

        <Tabs.Content value="reports" className="focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <ReportsDashboard rolePrefix="operations" />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
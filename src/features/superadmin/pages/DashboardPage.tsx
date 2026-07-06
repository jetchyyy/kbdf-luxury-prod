import { useEffect, useState } from 'react';
import { fetchPlatformAnalytics } from '../api/platform-analytics';
import { StatsCard } from '../../admin/components/StatsCard';
import { ChartCard } from '../../admin/components/ChartCard';
import { Globe, Package, MessageSquare, Receipt, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PlatformDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformAnalytics()
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching platform analytics:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#fb7a90] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Platform Control Panel</h2>
          <p className="text-white/40 text-xs mt-0.5">Global administrative overview of all tenants, product inventory, and cross-tenant leads.</p>
        </div>

        <Link
          to="/odc/tenants"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Onboard New Tenant
        </Link>
      </div>

      {/* platform overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Tenant Stores"
          value={data?.totalTenants ?? 0}
          icon={Globe}
          color="blue"
        />
        <StatsCard
          label="Active Storefronts"
          value={data?.activeTenants ?? 0}
          icon={Globe}
          color="green"
        />
        <StatsCard
          label="Global Products Catalog"
          value={data?.totalItems ?? 0}
          icon={Package}
          color="purple"
        />
        <StatsCard
          label="Global Leads Submission"
          value={data?.totalLeads ?? 0}
          icon={MessageSquare}
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tenants health summary card */}
        <ChartCard
          title="Tenant Stores Status"
          subtitle="Overview of system stability and storefront states"
          className="lg:col-span-2"
        >
          <div className="space-y-6">
            <div className="flex justify-around py-4 border border-white/5 rounded-2xl bg-[#0b0c10]">
              <div className="text-center">
                <span className="text-2xl font-bold text-emerald-400">{data?.activeTenants}</span>
                <p className="text-[10px] text-white/40 uppercase font-semibold">Online & Active</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-red-400">{data?.totalTenants - data?.activeTenants}</span>
                <p className="text-[10px] text-white/40 uppercase font-semibold">Deactivated</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-[#fb7a90]">100%</span>
                <p className="text-[10px] text-white/40 uppercase font-semibold">System Uptime</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white/60">Global Administrative Operations</h4>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/odc/tenants" className="flex items-center justify-between p-3.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl transition-all">
                  <span className="text-xs font-semibold text-white/80">Manage Tenant Domains</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </Link>
                <Link to="/odc/settings" className="flex items-center justify-between p-3.5 bg-white/3 hover:bg-white/5 border border-white/5 rounded-xl transition-all">
                  <span className="text-xs font-semibold text-white/80">Platform Settings</span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </Link>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Global Financial Metrics tracker */}
        <ChartCard
          title="Global Financial Activity"
          subtitle="Combined stats of logged operational expenses"
        >
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Receipt className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">This Month's Spending</p>
                <p className="text-2xl font-bold text-white">₱{data?.monthlyExpenses.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-4 bg-[#0b0c10] border border-white/5 rounded-xl text-xs text-white/60">
              Platform costs represent combined expense metrics reported by individual tenants during current restock and operational timelines.
            </div>
          </div>
        </ChartCard>

      </div>

    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { fetchAnalyticsSummary } from '../api/analytics';
import { ChartCard } from '../components/ChartCard';
import { StatsCard } from '../components/StatsCard';
import { Package, Receipt, TrendingUp, AlertCircle } from 'lucide-react';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function AnalyticsPage() {
  const { adminUser, tenant } = useAdminUser();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  useEffect(() => {
    if (tenantId) {
      fetchAnalyticsSummary(tenantId)
        .then(res => {
          setData(res);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [tenantId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#fb7a90] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate percentages for charts
  const totalExpenseAmount = data?.expensesByCategory.reduce((sum: number, c: any) => sum + c.total, 0) || 1;

  const totalLeads = (
    data?.leadsByStatus.new +
    data?.leadsByStatus.contacted +
    data?.leadsByStatus.qualified +
    data?.leadsByStatus.converted +
    data?.leadsByStatus.archived
  ) || 1;

  const funnelStages = [
    { label: 'New Inquiries', count: data?.leadsByStatus.new || 0, pct: ((data?.leadsByStatus.new || 0) / totalLeads) * 100, color: 'bg-blue-500' },
    { label: 'Contacted', count: data?.leadsByStatus.contacted || 0, pct: ((data?.leadsByStatus.contacted || 0) / totalLeads) * 100, color: 'bg-purple-500' },
    { label: 'Qualified Leads', count: data?.leadsByStatus.qualified || 0, pct: ((data?.leadsByStatus.qualified || 0) / totalLeads) * 100, color: 'bg-amber-500' },
    { label: 'Converted Sales', count: data?.leadsByStatus.converted || 0, pct: ((data?.leadsByStatus.converted || 0) / totalLeads) * 100, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Store Analytics & Reports</h2>
        <p className="text-white/40 text-xs mt-0.5">Visualize expenses, lead pipelines, inventory status, and business performance.</p>
      </div>

      {/* Grid of basic summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Products"
          value={data?.totalItems ?? 0}
          icon={Package}
          color="blue"
        />
        <StatsCard
          label="Total Expenses logged"
          value={`${currency}${data?.totalExpenses.toLocaleString()}`}
          icon={Receipt}
          color="amber"
        />
        <StatsCard
          label="Out of Stock Items"
          value={data?.outOfStockItems ?? 0}
          icon={AlertCircle}
          color="pink"
        />
        <StatsCard
          label="Conversion Rate"
          value={`${((data?.leadsByStatus.converted || 0) / Math.max(1, totalLeads) * 100).toFixed(0)}%`}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Expenses by Category chart */}
        <ChartCard
          title="Expenses Breakdown"
          subtitle="Distribution of operational costs across categories"
          action={<span className="text-xs font-semibold text-white/40">TOTAL: {currency}{totalExpenseAmount.toLocaleString()}</span>}
        >
          <div className="space-y-4">
            {data?.expensesByCategory.length === 0 ? (
              <p className="text-center text-xs text-white/20 py-12">No expense data logged yet.</p>
            ) : (
              data?.expensesByCategory.map((cat: any) => {
                const pct = (cat.total / totalExpenseAmount) * 100;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80 font-medium flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </span>
                      <span className="text-white font-semibold">
                        {currency}{cat.total.toLocaleString()} <span className="text-white/40 font-normal">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: cat.color,
                          width: `${pct}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ChartCard>

        {/* Lead Funnel chart */}
        <ChartCard
          title="Lead Funnel Pipeline"
          subtitle="Conversion stages from initial inquiry to closed deal"
          action={<span className="text-xs font-semibold text-white/40">TOTAL SUBMISSIONS: {totalLeads}</span>}
        >
          <div className="space-y-4">
            {funnelStages.map((stage) => (
              <div key={stage.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium">{stage.label}</span>
                  <span className="text-white font-semibold">
                    {stage.count} <span className="text-white/40 font-normal">({stage.pct.toFixed(0)}%)</span>
                  </span>
                </div>
                {/* Horizontal Funnel Tier */}
                <div className="h-6 w-full bg-white/5 rounded-lg overflow-hidden flex">
                  <div
                    className={`${stage.color} h-full rounded-lg opacity-80 hover:opacity-100 transition-all`}
                    style={{
                      width: `${Math.max(5, stage.pct)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Inventory & stock status report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Inventory Summary"
          subtitle="Physical product stock distribution"
        >
          <div className="flex items-center gap-6 justify-around py-4">
            {/* SVG Pie Chart representation */}
            <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* In stock */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="3"
                  strokeDasharray={`${((data?.totalItems - data?.lowStockItems - data?.outOfStockItems) / Math.max(1, data?.totalItems)) * 100} 100`} />
                {/* Low stock */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f59e0b" strokeWidth="3"
                  strokeDasharray={`${(data?.lowStockItems / Math.max(1, data?.totalItems)) * 100} 100`}
                  strokeDashoffset={`-${((data?.totalItems - data?.lowStockItems - data?.outOfStockItems) / Math.max(1, data?.totalItems)) * 100}`} />
                {/* Out of stock */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#ef4444" strokeWidth="3"
                  strokeDasharray={`${(data?.outOfStockItems / Math.max(1, data?.totalItems)) * 100} 100`}
                  strokeDashoffset={`-${((data?.totalItems - data?.outOfStockItems) / Math.max(1, data?.totalItems)) * 100}`} />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white">{data?.totalItems}</span>
                <span className="text-[10px] text-white/30 uppercase font-semibold">Products</span>
              </div>
            </div>

            <div className="space-y-3 text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  In Stock
                </span>
                <span className="font-semibold text-white">
                  {data?.totalItems - data?.lowStockItems - data?.outOfStockItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Low Stock
                </span>
                <span className="font-semibold text-white">
                  {data?.lowStockItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-white/70">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
                <span className="font-semibold text-white">
                  {data?.outOfStockItems}
                </span>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Analytics Insights Card */}
        <ChartCard
          title="Performance Insights"
          subtitle="Autogenerated business reviews"
        >
          <div className="space-y-4 text-xs text-white/60">
            <div className="bg-[#0f1117] border border-white/5 p-4 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Leads to Sales Conversion</h4>
                  <p>Your conversion rate is standing strong at {((data?.leadsByStatus.converted || 0) / Math.max(1, totalLeads) * 100).toFixed(0)}%. Continued follow-up on contacted leads can increase this rate.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-0.5">Inventory Depletion Alert</h4>
                  <p>You have {data?.lowStockItems} items running low on stock and {data?.outOfStockItems} items completely sold out. Schedule restock cycles for top categories.</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

    </div>
  );
}

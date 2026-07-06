import { useEffect, useState } from 'react';
import { Package, MessageSquare, Receipt, Tag, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatsCard } from '../components/StatsCard';
import { fetchAnalyticsSummary } from '../api/analytics';
import { useAdminUser } from '../hooks/useAdminUser';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function OverviewPage() {
  const { adminUser, tenant } = useAdminUser();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAnalyticsSummary>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  useEffect(() => {
    if (!tenantId) return;
    fetchAnalyticsSummary(tenantId).then(s => {
      setStats(s);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [tenantId]);

  const currency = tenant?.currency_symbol ?? '₱';

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h2 className="text-white/60 text-sm">Welcome back,</h2>
          <p className="text-white font-bold text-xl">{adminUser?.full_name ?? 'Admin'} 👋</p>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-xs">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Items"
          value={isLoading ? '—' : stats?.totalItems ?? 0}
          icon={Package}
          color="blue"
          delay={0}
        />
        <StatsCard
          label="Active Leads"
          value={isLoading ? '—' : stats?.activeLeads ?? 0}
          icon={MessageSquare}
          color="pink"
          delay={0.05}
        />
        <StatsCard
          label="This Month's Expenses"
          value={isLoading ? '—' : `${currency}${(stats?.monthlyExpenses ?? 0).toLocaleString()}`}
          icon={Receipt}
          color="amber"
          delay={0.1}
        />
        <StatsCard
          label="Total Categories"
          value={isLoading ? '—' : '—'}
          icon={Tag}
          color="purple"
          delay={0.15}
        />
      </div>

      {/* Alerts */}
      {!isLoading && (stats?.lowStockItems ?? 0) + (stats?.outOfStockItems ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-amber-400 font-semibold">{stats?.lowStockItems} low stock</span>
            {(stats?.outOfStockItems ?? 0) > 0 && (
              <span className="text-white/50"> and <span className="text-red-400 font-semibold">{stats?.outOfStockItems} out of stock</span></span>
            )}
            <span className="text-white/40"> — update your inventory</span>
          </div>
          <Link to="/admin/items" className="ml-auto text-amber-400 hover:text-amber-300 transition-colors">
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}

      {/* Lead Funnel */}
      {!isLoading && stats && (
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Lead Pipeline</h3>
            <Link to="/admin/leads" className="text-[#fb7a90] text-xs hover:text-[#f16881] transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: 'New', count: stats.leadsByStatus.new, color: 'bg-blue-500' },
              { label: 'Contacted', count: stats.leadsByStatus.contacted, color: 'bg-purple-500' },
              { label: 'Qualified', count: stats.leadsByStatus.qualified, color: 'bg-amber-500' },
              { label: 'Converted', count: stats.leadsByStatus.converted, color: 'bg-emerald-500' },
              { label: 'Archived', count: stats.leadsByStatus.archived, color: 'bg-white/10' },
            ].map((stage) => (
              <div key={stage.label} className="flex-1 min-w-[80px] bg-[#0f1117] rounded-xl p-3 text-center">
                <div className={`w-2 h-2 rounded-full ${stage.color} mx-auto mb-2`} />
                <p className="text-white font-bold text-lg">{stage.count}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">{stage.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Add Item', href: '/admin/items', icon: Package },
            { label: 'View Leads', href: '/admin/leads', icon: MessageSquare },
            { label: 'Add Expense', href: '/admin/expenses', icon: Receipt },
            { label: 'View Analytics', href: '/admin/analytics', icon: TrendingUp },
          ].map(action => (
            <Link
              key={action.label}
              to={action.href}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm text-white/70 hover:text-white transition-all"
            >
              <action.icon className="w-4 h-4" strokeWidth={1.5} />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

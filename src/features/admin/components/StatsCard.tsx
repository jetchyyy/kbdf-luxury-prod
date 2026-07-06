import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string }; // e.g. { value: 12.5, label: "vs last month" }
  color?: 'pink' | 'blue' | 'green' | 'amber' | 'purple';
  delay?: number;
}

const COLOR_MAP = {
  pink:   { bg: 'bg-[#fb7a90]/10', icon: 'text-[#fb7a90]', border: 'border-[#fb7a90]/20' },
  blue:   { bg: 'bg-blue-500/10',  icon: 'text-blue-400',   border: 'border-blue-500/20' },
  green:  { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber:  { bg: 'bg-amber-500/10', icon: 'text-amber-400',   border: 'border-amber-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
};

export function StatsCard({ label, value, icon: Icon, trend, color = 'pink', delay = 0 }: StatsCardProps) {
  const colors = COLOR_MAP[color];
  const isPositive = (trend?.value ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.32, 0.72, 0, 1] }}
      className={clsx(
        'bg-[#111827] rounded-2xl p-5 border flex flex-col gap-4',
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={clsx('w-5 h-5', colors.icon)} strokeWidth={1.5} />
        </div>
        {trend !== undefined && (
          <div className={clsx(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
            isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
          )}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-white/40 text-xs mt-0.5">{label}</p>
        {trend && (
          <p className="text-white/25 text-[10px] mt-1">{trend.label}</p>
        )}
      </div>
    </motion.div>
  );
}

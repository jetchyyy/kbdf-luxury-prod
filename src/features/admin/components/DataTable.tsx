import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pageSize?: number;
  // For Server-side pagination
  serverSide?: boolean;
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void;
  onSearchChange?: (search: string) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onRowClick,
  emptyMessage = 'No records found.',
  pageSize = 10,
  serverSide = false,
  totalCount = 0,
  currentPage = 1,
  onPageChange,
  onSortChange,
  onSearchChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const activePage = serverSide ? currentPage : page;

  const filtered = useMemo(() => {
    if (serverSide) return data;
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      Object.values(row as Record<string, unknown>).some(v =>
        String(v ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, search, serverSide]);

  const sorted = useMemo(() => {
    if (serverSide) return data;
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, serverSide, data]);

  const totalPages = Math.max(1, Math.ceil((serverSide ? totalCount : sorted.length) / pageSize));
  const paginated = serverSide ? data : sorted.slice((page - 1) * pageSize, page * pageSize);

  function handleSort(key: string) {
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortKey === key) {
      nextDir = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(nextDir);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    
    if (serverSide) {
      onSortChange?.(key, nextDir);
    } else {
      setPage(1);
    }
  }

  function handleSearch(val: string) {
    setSearch(val);
    if (serverSide) {
      onSearchChange?.(val);
    } else {
      setPage(1);
    }
  }

  function handlePageChange(newPage: number) {
    if (serverSide) {
      onPageChange?.(newPage);
    } else {
      setPage(newPage);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full max-w-xs bg-[#111827] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#fb7a90]/50 transition-colors"
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                    style={{ width: col.width }}
                    className={clsx(
                      'px-4 py-3.5 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider',
                      col.sortable && 'cursor-pointer hover:text-white/60 select-none'
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && sortKey === String(col.key) && (
                        sortDir === 'asc'
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-white/5 last:border-0">
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-3.5">
                        <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-white/30 text-sm">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => onRowClick?.(row)}
                    className={clsx(
                      'border-b border-white/5 last:border-0 transition-colors',
                      onRowClick ? 'cursor-pointer hover:bg-white/3' : ''
                    )}
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-3.5 text-sm text-white/70">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-white/30 text-xs">
              {serverSide ? totalCount : sorted.length} record{(serverSide ? totalCount : sorted.length) !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                disabled={activePage === 1}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-white/40 text-xs">{activePage} / {totalPages}</span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                disabled={activePage === totalPages}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

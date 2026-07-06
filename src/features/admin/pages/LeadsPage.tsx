import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchLeads, updateLead, deleteLead } from '../api/leads';
import type { Lead } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { MessageSquare, Trash2, Filter } from 'lucide-react';
import { LeadDetailDrawer } from '../components/LeadDetailDrawer';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function LeadsPage() {
  const { adminUser } = useAdminUser();
  const { canDelete } = usePermissions('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  useEffect(() => {
    if (tenantId) {
      loadLeads();
    }
  }, [tenantId]);

  async function loadLeads() {
    setIsLoading(true);
    try {
      const data = await fetchLeads(tenantId);
      setLeads(data);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveNotes(id: string, notes: string, status: Lead['status']) {
    try {
      await updateLead(id, { notes, status });
      await loadLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  }

  async function handleDeleteLead(id: string) {
    if (window.confirm('Are you sure you want to delete this lead submission permanently?')) {
      try {
        await deleteLead(id);
        await loadLeads();
      } catch (err) {
        alert('Failed to delete lead: ' + (err as any).message);
      }
    }
  }

  function handleRowClick(lead: Lead) {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  }

  const statusColors: Record<Lead['status'], string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    archived: 'bg-white/5 text-white/40 border-white/5',
  };

  const filteredLeads = leads.filter(l => {
    return statusFilter === 'all' || l.status === statusFilter;
  });

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      label: 'Client Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.name}</p>
          {row.phone && <p className="text-[11px] text-white/40">{row.phone}</p>}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (row) => <span className="text-white/60">{row.email}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (row) => (
        <span className="text-white/60 truncate max-w-[200px] block">
          {row.subject || 'No Subject'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2.5 py-0.5 text-xs rounded-full border ${statusColors[row.status]}`}>
          {row.status.toUpperCase()}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'created_at',
      label: 'Date Received',
      sortable: true,
      render: (row) => (
        <span className="text-white/40 text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleRowClick(row)}
            className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="View Details"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          {canDelete && (
            <button
              onClick={() => handleDeleteLead(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Submission"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Lead Management</h2>
          <p className="text-white/40 text-xs mt-0.5">Track contact submissions, customer inquiries, and customer outreach pipeline.</p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-semibold">
          <Filter className="w-4 h-4" /> Filter Status
        </div>
        <div className="flex flex-col gap-1">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        isLoading={isLoading}
        searchPlaceholder="Search leads by name, email or message..."
        onRowClick={handleRowClick}
      />

      {/* Detail Drawer */}
      <LeadDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }}
        lead={selectedLead}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}

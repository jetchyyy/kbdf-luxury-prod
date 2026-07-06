import { useState, useEffect } from 'react';
import type { Lead } from '../../../lib/supabase/database.types';
import { X, Calendar, User, Mail, Phone, Bookmark, MessageSquare } from 'lucide-react';

interface LeadDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSaveNotes: (id: string, notes: string, status: Lead['status']) => Promise<void>;
}

export function LeadDetailDrawer({ isOpen, onClose, lead, onSaveNotes }: LeadDetailDrawerProps) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Lead['status']>('new');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || '');
      setStatus(lead.status);
    }
  }, [lead]);

  if (!isOpen || !lead) return null;

  async function handleSave() {
    if (!lead) return;
    setIsSaving(true);
    try {
      await onSaveNotes(lead.id, notes.trim(), status);
      onClose();
    } catch (err) {
      alert('Failed to update lead details');
    } finally {
      setIsSaving(false);
    }
  }

  const statusColors: Record<Lead['status'], string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    qualified: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    archived: 'bg-white/5 text-white/40 border-white/5',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      {/* Sliding Drawer Container */}
      <div className="w-full max-w-md bg-[#111827] border-l border-white/10 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-white font-semibold text-base">Lead details</h3>
            <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full border ${statusColors[status]}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Card */}
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <User className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Client Name</p>
                <p className="text-sm font-medium">{lead.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/80">
              <Mail className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Email Address</p>
                <a href={`mailto:${lead.email}`} className="text-sm text-[#fb7a90] hover:underline font-medium">
                  {lead.email}
                </a>
              </div>
            </div>

            {lead.phone && (
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Phone Number</p>
                  <a href={`tel:${lead.phone}`} className="text-sm text-white/70 hover:underline">
                    {lead.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-white/80">
              <Calendar className="w-4 h-4 text-white/30" />
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Submitted On</p>
                <p className="text-sm text-white/70">
                  {new Date(lead.created_at).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            </div>
          </div>

          {/* Subject & Message */}
          <div className="space-y-4">
            {lead.subject && (
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <Bookmark className="w-3.5 h-3.5" /> Subject
                </span>
                <p className="text-sm font-medium text-white px-1">{lead.subject}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/40 uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </span>
              <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                {lead.message || 'No message provided.'}
              </div>
            </div>
          </div>

          {/* Pipeline Status selector */}
          <div className="space-y-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">Update Status Pipeline</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">Internal Staff Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g. Called client on Monday. Interested in preloved handbag..."
              className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 bg-white/5 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : null}
            {isSaving ? 'Saving...' : 'Save Updates'}
          </button>
        </div>
      </div>
    </div>
  );
}

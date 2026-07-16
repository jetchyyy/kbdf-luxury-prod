import { useState, useEffect } from 'react';
import type { Category } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';
import { ImageUploadInput } from './ImageUploadInput';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (catData: any) => Promise<void>;
  category?: Category | null;
  tenantId: string;
}

export function CategoryFormModal({ isOpen, onClose, onSave, category, tenantId }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name);
        setDescription(category.description || '');
        setImageUrl(category.image_url || '');
        setSortOrder(category.sort_order);
        setIsActive(category.is_active);
      } else {
        setName('');
        setDescription('');
        setImageUrl('');
        setSortOrder(0);
        setIsActive(true);
      }
      setError('');
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim();
      const payload = {
        tenant_id: tenantId,
        name: name.trim(),
        slug,
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Handbags"
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="The ultimate collection of bags..."
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors resize-none"
            />
          </div>

          {/* Category Image */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Category Image URL / Photo</label>
            <ImageUploadInput
              value={imageUrl}
              onChange={setImageUrl}
              tenantId={tenantId}
              placeholder="https://example.com/image.jpg"
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            {/* Sort Order */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Is Active */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Status</label>
              <div className="flex items-center h-full">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fb7a90]"></div>
                  <span className="ml-3 text-sm font-medium text-white/70">{isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-white/5 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

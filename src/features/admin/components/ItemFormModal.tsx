import { useState, useEffect } from 'react';
import type { Item, Category } from '../../../lib/supabase/database.types';
import { X, Plus, Trash } from 'lucide-react';
import { fetchCategories } from '../api/categories';
import { generateSlug } from '../api/items';
import { ImageUploadInput } from './ImageUploadInput';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => Promise<void>;
  item?: Item | null;
  tenantId: string;
}

export function ItemFormModal({ isOpen, onClose, onSave, item, tenantId }: ItemFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(0);
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState<'new' | 'preloved_excellent' | 'preloved_good' | 'preloved_fair'>('new');
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories(tenantId)
        .then(setCategories)
        .catch(err => console.error('Error loading categories:', err));

      if (item) {
        setTitle(item.title);
        setDescription(item.description || '');
        setPrice(Number(item.price));
        setOriginalPrice(item.original_price ? Number(item.original_price) : '');
        setQuantity(item.quantity);
        setSku(item.sku || '');
        setBrand(item.brand || '');
        setCondition(item.condition);
        setStockStatus(item.stock_status);
        setCategoryId(item.category_id || '');
        setImageUrls(item.image_urls && item.image_urls.length > 0 ? item.image_urls : ['']);
      } else {
        setTitle('');
        setDescription('');
        setPrice(0);
        setOriginalPrice('');
        setQuantity(0);
        setSku('');
        setBrand('');
        setCondition('new');
        setStockStatus('in_stock');
        setCategoryId('');
        setImageUrls(['']);
      }
      setError('');
    }
  }, [isOpen, item, tenantId]);

  // Auto-adjust stock status when quantity changes
  useEffect(() => {
    if (quantity <= 0) {
      setStockStatus('out_of_stock');
    } else if (quantity < 5) {
      setStockStatus('low_stock');
    } else {
      setStockStatus('in_stock');
    }
  }, [quantity]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const filteredImages = imageUrls.map(url => url.trim()).filter(url => url !== '');

    if (!title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }
    if (price <= 0) {
      setError('Price must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      const slug = generateSlug(title);
      const payload = {
        tenant_id: tenantId,
        category_id: categoryId || null,
        title: title.trim(),
        slug,
        description: description.trim() || null,
        price,
        original_price: originalPrice !== '' ? Number(originalPrice) : null,
        quantity,
        sku: sku.trim() || null,
        brand: brand.trim() || null,
        condition,
        stock_status: stockStatus,
        image_urls: filteredImages,
        is_active: true
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAddImageUrl() {
    setImageUrls([...imageUrls, '']);
  }

  function handleImageChange(index: number, val: string) {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  }

  function handleRemoveImageUrl(index: number) {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
    } else {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {item ? 'Edit Item' : 'Add Item'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Item Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                placeholder="The Continental Tote"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="KBDF"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* SKU */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="KBDF-TOT-01"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Price (PHP) *</label>
              <input
                type="number"
                value={price || ''}
                onChange={e => setPrice(Number(e.target.value))}
                required
                min="0.01"
                step="0.01"
                placeholder="3200"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Original Price */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Original / Strike price</label>
              <input
                type="number"
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="3800"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                required
                min="0"
                placeholder="10"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="new">New</option>
                <option value="preloved_excellent">Preloved (Excellent)</option>
                <option value="preloved_good">Preloved (Good)</option>
                <option value="preloved_fair">Preloved (Fair)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="A masterpiece in fine-grained calfskin leather..."
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors resize-none"
            />
          </div>

          {/* Image URLs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Image URLs</label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="flex items-center gap-1 text-xs text-[#fb7a90] hover:text-[#f16881] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add URL
              </button>
            </div>

            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-start gap-2 w-full">
                <ImageUploadInput
                  value={url}
                  onChange={val => handleImageChange(idx, val)}
                  tenantId={tenantId}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImageUrl(idx)}
                  className="p-2.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all self-start"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
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
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

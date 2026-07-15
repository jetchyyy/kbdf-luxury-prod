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
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([]);
  const [sizeInput, setSizeInput] = useState('');
  const [sizeQuantityInput, setSizeQuantityInput] = useState<number>(1);
  const [colors, setColors] = useState<{ name: string; hex: string }[]>([]);
  const [colorNameInput, setColorNameInput] = useState('');
  const [colorHexInput, setColorHexInput] = useState('#000000');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [weight, setWeight] = useState(0.0);

  const [hasMultipleSizes, setHasMultipleSizes] = useState(false);
  const [hasMultipleColors, setHasMultipleColors] = useState(false);

  // Leeway states
  const [leewayEnabled, setLeewayEnabled] = useState(false);
  const [leewayDownPaymentRequired, setLeewayDownPaymentRequired] = useState(false);
  const [leewayDownPaymentAmount, setLeewayDownPaymentAmount] = useState(0);

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
        setSizes(item.sizes || []);
        setHasMultipleSizes(!!item.sizes && item.sizes.length > 0);
        setColors(item.colors || []);
        setHasMultipleColors(!!item.colors && item.colors.length > 0);
        setFeatures(item.features || []);
        setDeliveryInfo(item.delivery_info || '');
        setLeewayEnabled((item as any).leeway_enabled || false);
        setLeewayDownPaymentRequired((item as any).leeway_down_payment_required || false);
        setLeewayDownPaymentAmount(Number((item as any).leeway_down_payment_amount || 0));
        setWeight(Number((item as any).weight || 0.0));
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
        setSizes([]);
        setHasMultipleSizes(false);
        setColors([]);
        setHasMultipleColors(false);
        setFeatures([]);
        setDeliveryInfo('');
        setLeewayEnabled(false);
        setLeewayDownPaymentRequired(false);
        setLeewayDownPaymentAmount(0);
        setWeight(0.0);
      }
      setSizeInput('');
      setSizeQuantityInput(1);
      setColorNameInput('');
      setColorHexInput('#000000');
      setFeatureInput('');
      setError('');
    }
  }, [isOpen, item, tenantId]);

  // Auto-calculate global quantity if sizes are defined and enabled
  useEffect(() => {
    if (hasMultipleSizes && sizes.length > 0) {
      const sum = sizes.reduce((acc, curr) => acc + curr.quantity, 0);
      setQuantity(sum);
    }
  }, [sizes, hasMultipleSizes]);

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

  function handleAddSize() {
    const trimmed = sizeInput.trim();
    if (trimmed && !sizes.some(s => s.size === trimmed)) {
      setSizes([...sizes, { size: trimmed, quantity: Math.max(0, sizeQuantityInput) }]);
      setSizeInput('');
      setSizeQuantityInput(1);
    }
  }

  function handleRemoveSize(sizeToRemove: string) {
    setSizes(sizes.filter(s => s.size !== sizeToRemove));
  }

  function handleAddColor() {
    const trimmed = colorNameInput.trim();
    if (trimmed && !colors.some(c => c.name === trimmed)) {
      setColors([...colors, { name: trimmed, hex: colorHexInput }]);
      setColorNameInput('');
      setColorHexInput('#000000');
    }
  }

  function handleRemoveColor(colorToRemove: string) {
    setColors(colors.filter(c => c.name !== colorToRemove));
  }

  function handleAddFeature() {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setFeatureInput('');
    }
  }

  function handleRemoveFeature(featureToRemove: string) {
    setFeatures(features.filter(f => f !== featureToRemove));
  }

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

    if (hasMultipleSizes && sizes.length === 0) {
      setError('Please add at least one size option or disable "multiple sizes" option.');
      setIsSubmitting(false);
      return;
    }

    if (hasMultipleColors && colors.length === 0) {
      setError('Please add at least one color option or disable "multiple colors" option.');
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
        sizes: hasMultipleSizes ? sizes : null,
        colors: hasMultipleColors ? colors : null,
        features: features.length > 0 ? features : null,
        delivery_info: deliveryInfo.trim() || null,
        leeway_enabled: leewayEnabled,
        leeway_down_payment_required: leewayDownPaymentRequired,
        leeway_down_payment_amount: leewayEnabled && leewayDownPaymentRequired ? leewayDownPaymentAmount : 0,
        weight: Number(weight),
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

            {/* Weight (kg) */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Weight (kg) *</label>
              <input
                type="number"
                value={weight || ''}
                onChange={e => setWeight(Math.max(0, Number(e.target.value)))}
                required
                min="0"
                step="0.01"
                placeholder="1.0"
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
                disabled={hasMultipleSizes}
                placeholder="10"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {hasMultipleSizes && (
                <span className="text-[#fb7a90] text-[9px] font-semibold">Total quantity calculated from size inventory below.</span>
              )}
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

            {/* Multiple Sizes Toggle */}
            <div className="md:col-span-2 flex items-center gap-3 py-2 border-b border-white/5 pb-2">
              <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasMultipleSizes}
                  onChange={e => {
                    setHasMultipleSizes(e.target.checked);
                    if (e.target.checked && sizes.length > 0) {
                      const sum = sizes.reduce((acc, curr) => acc + curr.quantity, 0);
                      setQuantity(sum);
                    }
                  }}
                  className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                This product has multiple sizes / measurement options (e.g. S, M, L, US 9)
              </label>
            </div>

            {/* Multiple Colors Toggle */}
            <div className="md:col-span-2 flex items-center gap-3 py-2 border-b border-white/5 pb-4">
              <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasMultipleColors}
                  onChange={e => setHasMultipleColors(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                This product comes in multiple colors
              </label>
            </div>
          </div>

          {/* Leeway Configuration */}
          <div className="border-t border-white/5 pt-4 space-y-4">
            <h4 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Leeway Payment Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={leewayEnabled}
                  onChange={e => {
                    setLeewayEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setLeewayDownPaymentRequired(false);
                      setLeewayDownPaymentAmount(0);
                    }
                  }}
                  className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                Available for Leeway Checkout
              </label>

              {leewayEnabled && (
                <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={leewayDownPaymentRequired}
                    onChange={e => {
                      setLeewayDownPaymentRequired(e.target.checked);
                      if (!e.target.checked) setLeewayDownPaymentAmount(0);
                    }}
                    className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  Require Down Payment
                </label>
              )}
            </div>

            {leewayEnabled && leewayDownPaymentRequired && (
              <div className="flex flex-col gap-2 max-w-xs">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Required Down Payment Amount (PHP)</label>
                <input
                  type="number"
                  value={leewayDownPaymentAmount || ''}
                  onChange={e => setLeewayDownPaymentAmount(Math.max(0, Number(e.target.value)))}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1000"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>
            )}
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

          {/* Size Options Section */}
          {hasMultipleSizes && (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Sizes / Measurement Options</label>
              <p className="text-white/40 text-[10px] -mt-1">Add selectable sizes with their respective quantities for this product.</p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={e => setSizeInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSize();
                    }
                  }}
                  placeholder="e.g. S, US 9, Chest 38"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors flex-1"
                />
                <input
                  type="number"
                  value={sizeQuantityInput}
                  onChange={e => setSizeQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  placeholder="Qty"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#fb7a90]/50 transition-colors w-20 text-center"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 rounded-xl font-semibold transition-all"
                >
                  Add Size
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <span className="text-white/30 text-[9px] uppercase font-bold mr-1">Presets (Qty: 5):</span>
                <button
                  type="button"
                  onClick={() => setSizes(['S', 'M', 'L', 'XL', 'XXL'].map(s => ({ size: s, quantity: 5 })))}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] px-2 py-1 rounded border border-white/5 hover:text-white transition-all"
                >
                  Clothes (S-XXL)
                </button>
                <button
                  type="button"
                  onClick={() => setSizes(['US 7', 'US 8', 'US 9', 'US 10', 'US 11'].map(s => ({ size: s, quantity: 5 })))}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] px-2 py-1 rounded border border-white/5 hover:text-white transition-all"
                >
                  Shoes (US 7-11)
                </button>
                <button
                  type="button"
                  onClick={() => setSizes([{ size: 'One Size', quantity: 5 }])}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] px-2 py-1 rounded border border-white/5 hover:text-white transition-all"
                >
                  One Size
                </button>
                {sizes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSizes([])}
                    className="text-red-400 hover:text-red-300 text-[9px] font-bold ml-auto"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Size Tags Display */}
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 bg-[#0f1117] border border-white/5 p-3 rounded-xl">
                  {sizes.map((s) => (
                    <span
                      key={s.size}
                      onClick={() => handleRemoveSize(s.size)}
                      className="flex items-center gap-1.5 bg-[#fb7a90]/10 hover:bg-red-500/10 text-[#fb7a90] hover:text-red-400 border border-[#fb7a90]/20 hover:border-red-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                      title="Click to remove"
                    >
                      {s.size} <span className="text-white/40 text-[10px] font-normal">({s.quantity} left)</span> <X className="w-3 h-3 opacity-60" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Color Options Section */}
          {hasMultipleColors && (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Color Options</label>
              <p className="text-white/40 text-[10px] -mt-1">Add colors available for this product with their hex codes.</p>
              
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={colorNameInput}
                  onChange={e => setColorNameInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  placeholder="e.g. Black, Rose Gold, Midnight"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors flex-1"
                />
                <input
                  type="color"
                  value={colorHexInput}
                  onChange={e => setColorHexInput(e.target.value)}
                  className="w-10 h-10 p-1 bg-[#0f1117] border border-white/10 rounded-xl outline-none focus:border-[#fb7a90]/50 cursor-pointer"
                  title="Select Hex Color"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs px-4 py-2.5 rounded-xl font-semibold transition-all h-full"
                >
                  Add Color
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 items-center mt-1">
                <span className="text-white/30 text-[9px] uppercase font-bold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => setColors([{ name: 'Black', hex: '#000000' }, { name: 'White', hex: '#ffffff' }])}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] px-2 py-1 rounded border border-white/5 hover:text-white transition-all"
                >
                  B/W
                </button>
                <button
                  type="button"
                  onClick={() => setColors([{ name: 'Gold', hex: '#ffd700' }, { name: 'Silver', hex: '#c0c0c0' }, { name: 'Rose Gold', hex: '#b76e79' }])}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-[9px] px-2 py-1 rounded border border-white/5 hover:text-white transition-all"
                >
                  Metals
                </button>
                {colors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setColors([])}
                    className="text-red-400 hover:text-red-300 text-[9px] font-bold ml-auto"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Color Tags Display */}
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 bg-[#0f1117] border border-white/5 p-3 rounded-xl">
                  {colors.map((c) => (
                    <span
                      key={c.name}
                      onClick={() => handleRemoveColor(c.name)}
                      className="flex items-center gap-1.5 bg-[#fb7a90]/10 hover:bg-red-500/10 text-[#fb7a90] hover:text-red-400 border border-[#fb7a90]/20 hover:border-red-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                      title="Click to remove"
                    >
                      <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      {c.name} <X className="w-3 h-3 opacity-60" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Features (Bullet Points) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-typography-primary uppercase tracking-wider">Features (Bullet Points)</label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Material: Premium vegan leather"
                className="flex-1 bg-surface-white border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted outline-none focus:border-brand-pink transition-colors"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-brand-navy hover:bg-brand-navy/90 text-white text-xs px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all"
              >
                Add
              </button>
            </div>
            
            {features.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 bg-surface-offWhite border border-surface-light p-4 rounded-xl">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 text-sm text-typography-primary bg-white p-3 rounded-lg border border-surface-light">
                    <div className="flex gap-2 items-start flex-1">
                      <span className="text-brand-pink mt-0.5">•</span>
                      <span>{f}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(f)}
                      className="text-typography-muted hover:text-red-500 transition-colors shrink-0"
                      title="Remove feature"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Delivery Info */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-typography-primary uppercase tracking-wider">Custom Delivery & Returns (Optional)</label>
            <p className="text-xs text-typography-muted">Leave blank to use the store's default delivery text.</p>
            <textarea
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              placeholder="e.g. Ships within 2 weeks. Non-refundable."
              rows={3}
              className="w-full bg-surface-white border border-surface-light rounded-xl px-4 py-3 text-sm text-typography-primary placeholder:text-typography-muted outline-none focus:border-brand-pink transition-colors resize-none"
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

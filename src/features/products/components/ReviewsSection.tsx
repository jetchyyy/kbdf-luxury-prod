import { useEffect, useState, useRef } from 'react';
import { Star, Loader2, X, Camera, AlertCircle } from 'lucide-react';
import type { Review } from '../types';
import { submitProductReview } from '../api';
import { useUserAuth } from '../../../core/context/UserAuthContext';
import { useTenant } from '../../../core/context/TenantContext';
import { useNotification } from '../../../core/context/NotificationContext';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { compressImage } from '../../admin/utils/compression';

interface ReviewsSectionProps {
  productId: string;
  reviews: Review[];
  onReviewSubmitted: () => void;
  productColors?: { name: string; hex: string }[] | null;
  productSizes?: { size: string; quantity: number }[] | null;
}

export function ReviewsSection({ 
  productId, 
  reviews, 
  onReviewSubmitted,
  productColors,
  productSizes
}: ReviewsSectionProps) {
  const { user } = useUserAuth();
  const { tenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Pre-fill name if user status changes
  useEffect(() => {
    if (user) {
      setAuthorName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
    } else {
      setAuthorName('');
    }
  }, [user, isFormOpen]);

  // Calculations for summary stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(2) 
    : '0.00';
  
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingCounts[r.rating as keyof typeof ratingCounts] !== undefined) {
      ratingCounts[r.rating as keyof typeof ratingCounts]++;
    }
  });

  // Pagination calculation
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  // Image Upload handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!tenant?.id) {
      showError("Store configuration is missing. Cannot upload photos.");
      return;
    }

    setIsUploading(true);
    setFormError(null);

    try {
      const newUrls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate type
        if (!file.type.startsWith('image/')) {
          throw new Error('All uploaded files must be images.');
        }

        // Validate size (before compression)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image files must not exceed 5MB.');
        }

        // 1. Compress Image
        const compressedBlob = await compressImage(file);
        const uuid = crypto.randomUUID();
        
        // Save to reviews/ subfolder of tenant
        const filePath = `${tenant.id}/reviews/${uuid}.jpg`;

        // 2. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, compressedBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // 3. Get Public URL
        const { data } = supabase.storage.from('media').getPublicUrl(filePath);
        if (!data?.publicUrl) {
          throw new Error('Failed to retrieve public URL');
        }

        newUrls.push(data.publicUrl);
      }

      setUploadedImages(prev => [...prev, ...newUrls]);
      showSuccess(`Successfully uploaded ${newUrls.length} photo(s).`);
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setFormError(err.message || 'Failed to upload review photos.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  // Remove uploaded image
  const removeUploadedImage = (urlToRemove: string) => {
    setUploadedImages(prev => prev.filter(url => url !== urlToRemove));
  };

  // Submit Review Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!authorName.trim()) {
      setFormError('Please enter your name.');
      return;
    }

    if (!content.trim()) {
      setFormError('Please write your review feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitProductReview({
        item_id: productId,
        author_name: authorName.trim(),
        rating,
        content: content.trim(),
        images: uploadedImages,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        is_verified_buyer: !!user // Default to true if user is logged in
      });

      showSuccess('Thank you! Your review has been submitted successfully.');
      
      // Reset Form fields
      setRating(5);
      setContent('');
      setSelectedColor('');
      setSelectedSize('');
      setUploadedImages([]);
      setIsFormOpen(false);
      
      // Notify parent to fetch new list
      onReviewSubmitted();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8f5f2] py-16 px-4 md:px-12 mt-12 border-t border-surface-light">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/3">
          <h2 className="text-2xl font-bold font-serif text-typography-primary mb-4">Customer Reviews</h2>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-brand-navy">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-5 h-5 ${s <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-surface-light fill-current'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-typography-primary">{averageRating} out of 5</span>
          </div>
          <p className="text-xs text-typography-muted">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          
          <div className="space-y-2 mt-6">
            {[5, 4, 3, 2, 1].map((r) => {
              const count = ratingCounts[r as keyof typeof ratingCounts];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={r} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 justify-end text-typography-primary font-medium">
                    {r} <Star className="w-3 h-3 fill-current text-brand-navy" />
                  </div>
                  <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-navy" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-typography-muted">{count}</div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="mt-8 text-xs font-bold uppercase tracking-widest text-typography-primary border-b border-typography-primary pb-1 hover:text-brand-pink hover:border-brand-pink transition-colors"
          >
            Write a Review
          </button>
        </div>

        {/* Right Side: Reviews List */}
        <div className="w-full md:w-2/3 space-y-8">
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-typography-muted text-sm uppercase tracking-widest font-light bg-white rounded-2xl border border-surface-light/40">
              No reviews yet. Be the first to review!
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {currentReviews.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-surface-light/50 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="flex text-brand-navy mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'text-surface-light'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-typography-muted">
                        {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-typography-primary text-sm">{review.author_name}</span>
                      {review.is_verified_buyer && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 font-sans">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-typography-primary mb-4 leading-relaxed">{review.content}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        {review.images.map((img, idx) => (
                          <a 
                            key={idx} 
                            href={img} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-16 h-16 rounded-xl overflow-hidden border border-surface-light hover:border-brand-navy transition-all hover:scale-105"
                          >
                            <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-4 text-[10px] text-typography-muted font-semibold uppercase tracking-wider">
                      {review.size && <span>Size: {review.size}</span>}
                      {review.color && (
                        <span className="flex items-center gap-1.5">
                          Color: {review.color}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-light text-typography-primary bg-white hover:bg-surface-offWhite disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs font-semibold ${
                        currentPage === idx + 1 
                          ? 'bg-brand-navy border-brand-navy text-white shadow-md' 
                          : 'border-surface-light text-typography-primary bg-white hover:bg-surface-offWhite'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-surface-light text-typography-primary bg-white hover:bg-surface-offWhite disabled:opacity-40 disabled:cursor-not-allowed font-bold"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Submission Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center p-4 z-[90] overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-3xl p-8 border border-surface-light shadow-2xl relative my-8">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 text-typography-muted hover:text-brand-pink transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-serif text-typography-primary mb-1">Write a Product Review</h3>
            <p className="text-xs text-typography-muted mb-6 uppercase tracking-wider">Share your experience with our quality products.</p>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Rating selection */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary block mb-2">Overall Rating *</label>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="focus:outline-none transition-transform active:scale-95"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          s <= (hoverRating ?? rating) 
                            ? 'text-brand-navy fill-current' 
                            : 'text-surface-light fill-none'
                        }`} 
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author name input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary">Your Name *</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="bg-transparent border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary placeholder:text-typography-muted/50 outline-none focus:border-brand-navy transition-all"
                />
              </div>

              {/* Color and Size optional selection dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary">Purchased Color</label>
                  <select
                    value={selectedColor}
                    onChange={e => setSelectedColor(e.target.value)}
                    className="bg-transparent border border-surface-light rounded-xl px-3 py-2.5 text-xs text-typography-primary outline-none focus:border-brand-navy transition-all cursor-pointer"
                  >
                    <option value="">Select Color...</option>
                    {productColors?.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary">Purchased Size</label>
                  <select
                    value={selectedSize}
                    onChange={e => setSelectedSize(e.target.value)}
                    className="bg-transparent border border-surface-light rounded-xl px-3 py-2.5 text-xs text-typography-primary outline-none focus:border-brand-navy transition-all cursor-pointer"
                  >
                    <option value="">Select Size...</option>
                    {productSizes?.map((s) => (
                      <option key={s.size} value={s.size}>{s.size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Review content body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary">Review Details *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Tell us about the texture, fit, elegance, packaging..."
                  className="bg-transparent border border-surface-light rounded-xl px-4 py-2.5 text-sm text-typography-primary placeholder:text-typography-muted/50 outline-none focus:border-brand-navy transition-all resize-none"
                />
              </div>

              {/* Photo uploader */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-typography-primary block">Attach Photos (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  ref={fileInputRef}
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2.5">
                  {/* Preview list */}
                  {uploadedImages.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-surface-light group bg-surface-offWhite">
                      <img src={url} alt="Uploaded attachment preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(url)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Trigger box */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isSubmitting}
                    className="w-16 h-16 rounded-xl border border-dashed border-surface-light flex flex-col items-center justify-center gap-1 text-typography-muted hover:border-brand-navy hover:text-brand-navy transition-all bg-surface-offWhite/30 animate-pulse"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand-navy" />
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation/Error box */}
              {formError && (
                <div className="flex items-center gap-2 text-xs text-red-500 font-semibold bg-red-50 border border-red-200/50 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit trigger button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 text-xs font-bold uppercase tracking-widest text-white bg-brand-navy hover:bg-brand-pink disabled:bg-surface-light disabled:text-typography-muted rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

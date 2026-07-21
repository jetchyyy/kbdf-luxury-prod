import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Check, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { compressImage } from '../utils/compression';

interface ImageUploadInputProps {
  value: string;
  onChange: (val: string) => void;
  tenantId: string;
  placeholder?: string;
  maxSizeMB?: number;
  theme?: 'dark' | 'light';
  disabled?: boolean;
}

export function ImageUploadInput({
  value,
  onChange,
  tenantId,
  placeholder = 'Select photo...',
  maxSizeMB = 5,
  theme,
  disabled = false
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [globalTheme, setGlobalTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      setGlobalTheme((e as CustomEvent).detail);
    };
    window.addEventListener('admin-theme-change', handleThemeChange);
    return () => window.removeEventListener('admin-theme-change', handleThemeChange);
  }, []);

  const effectiveTheme = theme || globalTheme;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selected file must be an image.');
      return;
    }

    // Validate size (before compression check)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`Image exceeds size limit of ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);

    try {
      // 1. Compress Image
      const compressedBlob = await compressImage(file);
      const uuid = crypto.randomUUID();
      
      // Determine folder prefix based on path hints
      const folder = placeholder.toLowerCase().includes('receipt') ? 'receipts' : 'uploads';
      const filePath = `${tenantId}/${folder}/${uuid}.jpg`;

      // 2. Upload to Supabase storage
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

      // 4. Update parent value
      onChange(data.publicUrl);
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setErrorMsg(err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  const triggerUpload = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const isDark = effectiveTheme === 'dark';
  const containerClasses = isDark 
    ? "bg-[#0f1117] hover:bg-[#0f1117]/80 border-white/10 hover:border-[#fb7a90]/40" 
    : "bg-surface-white hover:bg-surface-offWhite border-surface-light hover:border-brand-navy";
  const textTitleClasses = isDark ? "text-white" : "text-typography-primary";
  const textSubClasses = isDark ? "text-white/30" : "text-typography-muted";
  const iconBgClasses = isDark ? "bg-white/5 text-white/50" : "bg-surface-offWhite border border-surface-light text-typography-muted shadow-sm";

  return (
    <div className="w-full space-y-1">
      {/* Invisible input file trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading || disabled}
        className="hidden"
      />

      {isUploading ? (
        /* UPLOADING STATE */
        <div className={`flex items-center justify-center gap-3 border rounded-xl p-4 text-sm ${isDark ? 'bg-[#0f1117] border-white/10 text-white/70' : 'bg-surface-white border-surface-light text-typography-muted shadow-sm'}`}>
          <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-[#fb7a90]' : 'text-brand-navy'}`} />
          <span>Uploading and compressing photo...</span>
        </div>
      ) : value ? (
        /* UPLOAD SUCCESS STATE WITH PREVIEW */
        /* UPLOAD SUCCESS STATE WITH PREVIEW */
        <div className={`flex flex-wrap items-center justify-between gap-2 sm:gap-4 border rounded-xl p-2.5 sm:p-3.5 ${isDark ? 'bg-[#0f1117]/50 border-white/10' : 'bg-surface-white border-surface-light shadow-sm'}`}>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Small image preview circle */}
            <div className={`w-10 h-10 rounded-lg overflow-hidden border flex-shrink-0 ${isDark ? 'bg-black border-white/10' : 'bg-surface-light border-surface-light'}`}>
              <img src={value} alt="Preview" className={`w-full h-full object-cover ${!isDark ? 'mix-blend-multiply' : ''}`} />
            </div>
            <div className="min-w-0 flex items-center">
              <span className={`text-[10px] sm:text-xs font-semibold flex items-center gap-1 truncate ${textTitleClasses}`}>
                <Check className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} /> 
                <span className="truncate">Photo Uploaded</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={triggerUpload}
              disabled={disabled}
              className={`px-3 py-1.5 border text-[11px] font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark 
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' 
                  : 'bg-white hover:bg-surface-light border-surface-light text-typography-primary shadow-sm'
              }`}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className={`p-1.5 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                  : 'bg-red-50 hover:bg-red-100 text-red-500 border-red-200 shadow-sm'
              }`}
              title="Delete photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* DORMANT / EMPTY UPLOAD DROPZONE BUTTON */
        <button
          type="button"
          onClick={triggerUpload}
          disabled={disabled}
          className={`w-full flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl p-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${containerClasses}`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBgClasses}`}>
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-center">
            <p className={`text-xs font-semibold ${textTitleClasses}`}>{placeholder}</p>
            <p className={`text-[10px] mt-0.5 ${textSubClasses}`}>JPEG/PNG up to {maxSizeMB}MB</p>
          </div>
        </button>
      )}

      {errorMsg && (
        <div className={`flex items-center gap-1.5 text-[11px] mt-1 pl-1 ${isDark ? 'text-red-400' : 'text-red-500 font-medium'}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

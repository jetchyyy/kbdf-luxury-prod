import { useState, useRef } from 'react';
import { Upload, Loader2, Check, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import { compressImage } from '../utils/compression';

interface ImageUploadInputProps {
  value: string;
  onChange: (val: string) => void;
  tenantId: string;
  placeholder?: string;
  maxSizeMB?: number;
}

export function ImageUploadInput({
  value,
  onChange,
  tenantId,
  placeholder = 'Select photo...',
  maxSizeMB = 5
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-1">
      {/* Invisible input file trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading ? (
        /* UPLOADING STATE */
        <div className="flex items-center justify-center gap-3 bg-[#0f1117] border border-white/10 rounded-xl p-4 text-sm text-white/70">
          <Loader2 className="w-5 h-5 animate-spin text-[#fb7a90]" />
          <span>Uploading and compressing photo...</span>
        </div>
      ) : value ? (
        /* UPLOAD SUCCESS STATE WITH PREVIEW */
        <div className="flex items-center justify-between gap-4 bg-[#0f1117]/50 border border-white/10 rounded-xl p-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Small image preview circle */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-white/10 flex-shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex items-center">
              <span className="text-white text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Photo Uploaded
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerUpload}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold rounded-lg transition-all"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all"
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
          className="w-full flex flex-col items-center justify-center gap-2 bg-[#0f1117] hover:bg-[#0f1117]/80 border border-dashed border-white/10 hover:border-[#fb7a90]/40 rounded-xl p-6 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-center">
            <p className="text-white text-xs font-semibold">{placeholder}</p>
            <p className="text-white/30 text-[10px] mt-0.5">JPEG/PNG up to {maxSizeMB}MB</p>
          </div>
        </button>
      )}

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

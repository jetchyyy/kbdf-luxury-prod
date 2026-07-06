import { useState, useRef } from 'react';
import { Upload, Loader2, Check, AlertCircle } from 'lucide-react';
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
  placeholder = 'https://images.unsplash.com/...',
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
      const filePath = `${tenantId}/${uuid}.jpg`;

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
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center gap-2 w-full">
        {/* Text Input for direct pasting */}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
        />

        {/* Upload Trigger Button */}
        <label className="flex-shrink-0 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer active:scale-[0.98] transition-all">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#fb7a90]" />
          ) : value ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Upload className="w-4 h-4 text-white/60" />
          )}
          <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-red-400 text-[11px] mt-1 pl-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

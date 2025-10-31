"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

export default function ImageUploader({ onUpload }: { onUpload: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 3 images
    const filesToUpload = Array.from(files).slice(0, 3);

    try {
      setError(null);
      setUploading(true);
      setPreviews([]);

      const uploadedUrls: string[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        console.log(`Compressing image ${i + 1}/${filesToUpload.length}...`);

        // Compress image
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
        });

        console.log(`Compression done for image ${i + 1}, file size:`, compressed.size);

        // Add preview
        setPreviews(prev => [...prev, URL.createObjectURL(compressed)]);

        // Create unique filename
        const fileExt = compressed.name.split('.').pop();
        const fileName = `${Date.now()}_${i}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log(`Uploading image ${i + 1} to Supabase Storage...`, filePath);

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, compressed, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        console.log(`Upload ${i + 1} successful! URL:`, publicUrl);
        uploadedUrls.push(publicUrl);
      }

      setUploading(false);
      onUpload(uploadedUrls);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
      setUploading(false);
      alert(`Upload failed: ${err.message}`);
    }
  }

  return (
    <div className="flex flex-col gap-3 items-center border rounded-xl p-4 bg-white shadow-sm">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm"
      />
      <p className="text-xs text-gray-500">Upload 1-3 images</p>
      {uploading && (
        <div className="text-center">
          <p className="text-brand-primary font-medium">Uploading images...</p>
          <p className="text-xs text-gray-500">Please wait, this may take a moment</p>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {previews.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {previews.map((preview, idx) => (
            <img key={idx} src={preview} alt={`preview ${idx + 1}`} className="w-32 h-32 rounded-lg object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}

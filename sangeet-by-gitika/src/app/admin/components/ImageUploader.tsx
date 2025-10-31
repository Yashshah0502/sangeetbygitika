"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);

      console.log("Starting compression...");
      // Compress image
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
      });
      console.log("Compression done, file size:", compressed.size);

      setPreview(URL.createObjectURL(compressed));

      // Create unique filename
      const fileExt = compressed.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log("Uploading to Supabase Storage...", filePath);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressed, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      console.log("Getting public URL...");

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log("Upload successful! URL:", publicUrl);

      setUploading(false);
      onUpload(publicUrl);
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
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm"
      />
      {uploading && (
        <div className="text-center">
          <p className="text-sangeet-gold font-medium">Uploading...</p>
          <p className="text-xs text-gray-500">Please wait, this may take a moment</p>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {preview && <img src={preview} alt="preview" className="w-40 rounded-lg" />}
    </div>
  );
}

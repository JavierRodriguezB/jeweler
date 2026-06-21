import { createClient } from "./client";

const BUCKET = "product-images";

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Sube una imagen de producto a Supabase Storage y devuelve su URL pública.
 * Requiere sesión de admin (lo exige la política RLS del bucket).
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `products/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

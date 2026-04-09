import "server-only";
import { randomUUID } from "node:crypto";
import { validateAdminImageUpload } from "@/lib/image-security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type StorageBucket = "notices" | "home-feed" | "site-media";

export async function uploadAdminImageToSupabaseStorage(input: {
  bucket: StorageBucket;
  file: File;
  prefix?: string;
}) {
  const safeImage = await validateAdminImageUpload(input.file);
  const supabase = getSupabaseAdminClient();
  const filePath = `${input.prefix ?? "uploads"}/${randomUUID()}${safeImage.extension}`;

  const { error } = await supabase.storage
    .from(input.bucket)
    .upload(filePath, safeImage.buffer, {
      cacheControl: "31536000",
      upsert: false,
      contentType: safeImage.mimeType,
    });

  if (error) {
    throw new Error("이미지 업로드 중 문제가 생겼습니다.");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(input.bucket).getPublicUrl(filePath);

  return publicUrl;
}

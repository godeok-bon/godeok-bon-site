import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { validateAdminImageUpload } from "@/lib/image-security";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { uploadAdminImageToSupabaseStorage } from "@/lib/supabase/storage";

export const runtime = "nodejs";

const uploadDirectory = path.join(process.cwd(), "public", "uploads", "notices");

export async function POST(request: Request) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      { error: "관리자 인증이 필요합니다." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "이미지 파일을 확인해 주세요." },
      { status: 400 },
    );
  }

  try {
    let url = "";

    if (hasSupabaseAdminEnv()) {
      url = await uploadAdminImageToSupabaseStorage({
        bucket: "notices",
        file,
        prefix: "editor",
      });
    } else {
      const safeImage = await validateAdminImageUpload(file);

      await mkdir(uploadDirectory, { recursive: true });

      const fileName = `${randomUUID()}${safeImage.extension}`;
      const filePath = path.join(uploadDirectory, fileName);

      await writeFile(filePath, safeImage.buffer);
      url = `/uploads/notices/${fileName}`;
    }

    return NextResponse.json({
      url,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "이미지 보안 검증 중 문제가 생겼습니다.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

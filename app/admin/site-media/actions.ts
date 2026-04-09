"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import {
  isSiteHeroKey,
  type SiteHeroKey,
  updateSiteHeroImage,
} from "@/lib/site-media";

function redirectWithParams(
  pathname: string,
  params?: Record<string, string>,
): never {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();

  redirect(query ? `${pathname}?${query}` : pathname);
}

function revalidateSiteMediaPaths(key: SiteHeroKey) {
  switch (key) {
    case "mainSlide1":
    case "mainSlide2":
    case "mainSlide3":
      revalidatePath("/");
      break;
    case "aboutHero":
      revalidatePath("/about");
      break;
    case "columnHero":
      revalidatePath("/column");
      break;
    case "programHero":
      revalidatePath("/program");
      break;
    case "contactHero":
      revalidatePath("/contact");
      break;
    case "noticeHero":
      revalidatePath("/notice");
      break;
    case "noticeDetailHero":
      revalidatePath("/notice/[id]", "page");
      break;
    case "noticeWriteHero":
      revalidatePath("/notice/write");
      break;
    case "noticeEditHero":
      revalidatePath("/notice/[id]/edit", "page");
      break;
    case "feedWriteHero":
      revalidatePath("/home-feed/write");
      break;
    case "feedEditHero":
      revalidatePath("/home-feed/[id]/edit", "page");
      break;
  }

  revalidatePath("/admin/site-media");
}

export async function updateSiteHeroImageAction(formData: FormData) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirectWithParams("/admin", { error: "not-authenticated" });
  }

  const key = String(formData.get("key") ?? "");
  const imageFile = formData.get("imageFile");

  if (!isSiteHeroKey(key)) {
    redirectWithParams("/admin/site-media", { error: "invalid-key" });
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirectWithParams("/admin/site-media", { error: "missing-file" });
  }

  try {
    await updateSiteHeroImage({
      key,
      imageFile,
    });
    revalidateSiteMediaPaths(key);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "이미지 저장 중 문제가 생겼습니다. 파일 형식과 용량을 확인해 주세요.";

    redirectWithParams("/admin/site-media", { error: message });
  }

  redirectWithParams("/admin/site-media", { success: key });
}

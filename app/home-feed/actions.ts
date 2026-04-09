"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isNoticeAdminAuthenticated } from "@/lib/notice-admin";
import { removeHomeFeedItem, saveHomeFeedItem } from "@/lib/home-feed";

function redirectWithParams(pathname: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();

  redirect(query ? `${pathname}?${query}` : pathname);
}

function revalidateHomeFeedPaths(itemId?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/home-feed/write");

  if (itemId) {
    revalidatePath(`/home-feed/${itemId}/edit`);
    revalidatePath(`/feed/${itemId}`);
  }
}

export async function saveHomeFeedItemAction(formData: FormData) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirectWithParams("/admin", { error: "not-authenticated" });
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const category = String(formData.get("category") ?? "");
  const tags = String(formData.get("tags") ?? "");
  const existingImageUrl = String(formData.get("existingImageUrl") ?? "");
  const imageFile = formData.get("imageFile");
  const returnTo = String(formData.get("returnTo") ?? "/home-feed/write");
  let savedItemId = "";

  try {
    const savedItem = await saveHomeFeedItem({
      id: id || undefined,
      title,
      content,
      category,
      tags,
      existingImageUrl,
      imageFile: imageFile instanceof File ? imageFile : null,
    });

    savedItemId = savedItem.id;
    revalidateHomeFeedPaths(savedItem.id);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "저장 중 문제가 생겼습니다.";

    redirectWithParams(returnTo, { error: message });
  }

  redirect(`/feed/${savedItemId}`);
}

export async function deleteHomeFeedItemAction(formData: FormData) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirectWithParams("/admin", { error: "not-authenticated" });
  }

  const id = String(formData.get("id") ?? "");

  if (!id) {
    redirect("/");
  }

  await removeHomeFeedItem(id);
  revalidateHomeFeedPaths(id);
  redirect("/");
}

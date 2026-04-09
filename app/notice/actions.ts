"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isNoticeAdminAuthenticated,
  isNoticeAdminCredentialsConfigured,
  loginNoticeAdminWithUsernamePassword,
  logoutNoticeAdminSession,
} from "@/lib/notice-admin";
import { removeNotice, saveNotice } from "@/lib/notices";

function redirectWithParams(pathname: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();

  redirect(query ? `${pathname}?${query}` : pathname);
}

function revalidateNoticePaths(noticeId?: string) {
  revalidatePath("/notice");
  revalidatePath("/admin");

  if (noticeId) {
    revalidatePath(`/notice/${noticeId}`);
  }
}

export async function loginNoticeAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isNoticeAdminCredentialsConfigured()) {
    redirectWithParams("/admin", { error: "not-configured" });
  }

  const authenticated = await loginNoticeAdminWithUsernamePassword({
    username,
    password,
  });

  if (!authenticated) {
    redirectWithParams("/admin", { error: "invalid-credentials" });
  }

  redirect("/notice");
}

export async function logoutNoticeAdmin() {
  await logoutNoticeAdminSession();
  redirect("/admin");
}

export async function saveNoticeAction(formData: FormData) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirectWithParams("/admin", { error: "not-authenticated" });
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "");
  const content = String(formData.get("content") ?? "");
  const category = String(formData.get("category") ?? "");
  const pinned = formData.get("pinned") === "on";
  const returnTo = String(formData.get("returnTo") ?? "/admin");
  let savedNoticeId = "";

  try {
    const result = await saveNotice({
      id: id || undefined,
      title,
      content,
      category,
      pinned,
    });

    savedNoticeId = result.notice.id;
  } catch {
    redirectWithParams(returnTo, { error: "save-failed" });
  }

  revalidateNoticePaths(savedNoticeId);
  redirect(`/notice/${savedNoticeId}`);
}

export async function deleteNoticeAction(formData: FormData) {
  const authenticated = await isNoticeAdminAuthenticated();

  if (!authenticated) {
    redirectWithParams("/admin", { error: "not-authenticated" });
  }

  const id = String(formData.get("id") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/admin");

  if (!id) {
    redirectWithParams("/admin", { error: "delete-failed" });
  }

  const removed = await removeNotice(id);

  if (!removed) {
    redirectWithParams("/admin", { error: "delete-failed" });
  }

  revalidateNoticePaths(id);

  if (redirectTo === "/notice") {
    redirect("/notice");
  }

  redirectWithParams("/admin", { success: "deleted" });
}

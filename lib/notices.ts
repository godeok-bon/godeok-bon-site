import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";

export const noticeCategories = ["공지사항", "센터소식", "홍보"] as const;

export type NoticeCategory = (typeof noticeCategories)[number];

export type Notice = {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  pinned: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
};

type NoticeRecord = {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  views: number;
  created_at: string;
  updated_at: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const noticeFilePath = path.join(dataDirectory, "notices.json");

export function isNoticeCategory(value: string): value is NoticeCategory {
  return noticeCategories.includes(value as NoticeCategory);
}

function normalizeNoticeCategory(rawCategory: string) {
  if (rawCategory === "보도자료" || rawCategory === "기관홍보") {
    return "홍보";
  }

  return isNoticeCategory(rawCategory) ? rawCategory : "공지사항";
}

function normalizeNotice(value: unknown): Notice | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;
  const notice = source as Partial<Notice>;

  if (
    typeof notice.id !== "string" ||
    typeof notice.title !== "string" ||
    typeof notice.content !== "string" ||
    typeof notice.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    category: normalizeNoticeCategory(
      typeof source.category === "string" ? source.category : "",
    ),
    pinned: typeof notice.pinned === "boolean" ? notice.pinned : false,
    views: typeof notice.views === "number" ? notice.views : 0,
    createdAt: notice.createdAt,
    updatedAt:
      typeof notice.updatedAt === "string" ? notice.updatedAt : notice.createdAt,
  };
}

function mapNoticeRecord(record: NoticeRecord): Notice {
  return {
    id: String(record.id),
    title: record.title,
    content: record.content,
    category: normalizeNoticeCategory(record.category),
    pinned: Boolean(record.pinned),
    views: Number(record.views ?? 0),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function ensureNoticeStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(noticeFilePath, "utf8");
  } catch {
    await writeFile(noticeFilePath, "[]\n", "utf8");
  }
}

async function readNoticeStore() {
  await ensureNoticeStore();

  try {
    const raw = await readFile(noticeFilePath, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeNotice)
      .filter((notice): notice is Notice => notice !== null);
  } catch {
    return [];
  }
}

async function writeNoticeStore(notices: Notice[]) {
  await ensureNoticeStore();
  await writeFile(noticeFilePath, `${JSON.stringify(notices, null, 2)}\n`, "utf8");
}

function sortNotices(notices: Notice[]) {
  return [...notices].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

function getNextNoticeId(notices: Notice[]) {
  const maxId = notices.reduce((currentMax, notice) => {
    const numericId = Number.parseInt(notice.id, 10);

    if (Number.isNaN(numericId)) {
      return currentMax;
    }

    return Math.max(currentMax, numericId);
  }, 0);

  return String(maxId + 1);
}

async function getNoticesFromSupabase(category?: string) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("notices")
    .select("id, title, content, category, pinned, views, created_at, updated_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "전체") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("공지사항 데이터를 불러오지 못했습니다.");
  }

  return (data ?? []).map((record) => mapNoticeRecord(record as NoticeRecord));
}

async function getNoticeByIdFromSupabase(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, content, category, pinned, views, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("공지사항을 불러오지 못했습니다.");
  }

  return data ? mapNoticeRecord(data as NoticeRecord) : null;
}

async function getSortedSupabaseNotices() {
  return getNoticesFromSupabase();
}

async function saveNoticeToSupabase(input: {
  id?: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
}) {
  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("제목과 내용을 모두 입력해 주세요.");
  }

  if (!isNoticeCategory(input.category)) {
    throw new Error("올바른 분류를 선택해 주세요.");
  }

  const supabase = getSupabaseAdminClient();

  if (input.id) {
    const { data, error } = await supabase
      .from("notices")
      .update({
        title,
        content,
        category: input.category,
        pinned: input.pinned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("id, title, content, category, pinned, views, created_at, updated_at")
      .single();

    if (error) {
      throw new Error("공지사항 저장에 실패했습니다.");
    }

    return {
      mode: "updated" as const,
      notice: mapNoticeRecord(data as NoticeRecord),
    };
  }

  const { data, error } = await supabase
    .from("notices")
    .insert({
      title,
      content,
      category: input.category,
      pinned: input.pinned,
      views: 0,
    })
    .select("id, title, content, category, pinned, views, created_at, updated_at")
    .single();

  if (error) {
    throw new Error("공지사항 저장에 실패했습니다.");
  }

  return {
    mode: "created" as const,
    notice: mapNoticeRecord(data as NoticeRecord),
  };
}

async function removeNoticeFromSupabase(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    throw new Error("공지사항 삭제에 실패했습니다.");
  }

  return true;
}

async function incrementNoticeViewsInSupabase(id: string) {
  const currentNotice = await getNoticeByIdFromSupabase(id);

  if (!currentNotice) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notices")
    .update({
      views: currentNotice.views + 1,
      updated_at: currentNotice.updatedAt,
    })
    .eq("id", id)
    .select("id, title, content, category, pinned, views, created_at, updated_at")
    .single();

  if (error) {
    throw new Error("공지 조회수를 갱신하지 못했습니다.");
  }

  return mapNoticeRecord(data as NoticeRecord);
}

export async function getNotices(category?: string) {
  if (hasSupabaseAdminEnv()) {
    return getNoticesFromSupabase(category);
  }

  const notices = sortNotices(await readNoticeStore());

  if (!category || category === "전체") {
    return notices;
  }

  return notices.filter((notice) => notice.category === category);
}

export async function getNoticeById(id: string) {
  if (hasSupabaseAdminEnv()) {
    return getNoticeByIdFromSupabase(id);
  }

  const notices = await readNoticeStore();
  return notices.find((notice) => notice.id === id) ?? null;
}

export async function getAdjacentNotices(id: string) {
  const notices = hasSupabaseAdminEnv()
    ? await getSortedSupabaseNotices()
    : sortNotices(await readNoticeStore());
  const index = notices.findIndex((notice) => notice.id === id);

  if (index < 0) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: index > 0 ? notices[index - 1] : null,
    next: index < notices.length - 1 ? notices[index + 1] : null,
  };
}

export async function incrementNoticeViews(id: string) {
  if (hasSupabaseAdminEnv()) {
    return incrementNoticeViewsInSupabase(id);
  }

  const notices = await readNoticeStore();
  const index = notices.findIndex((notice) => notice.id === id);

  if (index < 0) {
    return null;
  }

  const nextNotice: Notice = {
    ...notices[index],
    views: notices[index].views + 1,
  };

  notices[index] = nextNotice;
  await writeNoticeStore(notices);

  return nextNotice;
}

export async function saveNotice(input: {
  id?: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
}) {
  if (hasSupabaseAdminEnv()) {
    return saveNoticeToSupabase(input);
  }

  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error("제목과 내용을 모두 입력해 주세요.");
  }

  if (!isNoticeCategory(input.category)) {
    throw new Error("올바른 분류를 선택해 주세요.");
  }

  const notices = await readNoticeStore();
  const now = new Date().toISOString();
  const existingIndex = input.id
    ? notices.findIndex((notice) => notice.id === input.id)
    : -1;

  if (existingIndex >= 0) {
    const updatedNotice: Notice = {
      ...notices[existingIndex],
      title,
      content,
      category: input.category,
      pinned: input.pinned,
      updatedAt: now,
    };

    notices[existingIndex] = updatedNotice;
    await writeNoticeStore(sortNotices(notices));

    return {
      mode: "updated" as const,
      notice: updatedNotice,
    };
  }

  const nextNotice: Notice = {
    id: getNextNoticeId(notices),
    title,
    content,
    category: input.category,
    pinned: input.pinned,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };

  notices.push(nextNotice);
  await writeNoticeStore(sortNotices(notices));

  return {
    mode: "created" as const,
    notice: nextNotice,
  };
}

export async function removeNotice(id: string) {
  if (hasSupabaseAdminEnv()) {
    return removeNoticeFromSupabase(id);
  }

  const notices = await readNoticeStore();
  const nextNotices = notices.filter((notice) => notice.id !== id);

  if (nextNotices.length === notices.length) {
    return false;
  }

  await writeNoticeStore(sortNotices(nextNotices));
  return true;
}

export function formatNoticeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getNoticeExcerpt(content: string) {
  return content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { validateAdminImageUpload } from "@/lib/image-security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { uploadAdminImageToSupabaseStorage } from "@/lib/supabase/storage";

export const homeFeedCategories = [
  "Program",
  "Education",
  "Notice",
  "Column",
] as const;

export type HomeFeedCategory = (typeof homeFeedCategories)[number];

export type HomeFeedItem = {
  id: string;
  title: string;
  content: string;
  category: HomeFeedCategory;
  tags: string[];
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

type HomeFeedRecord = {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  image_url: string;
  created_at: string;
  updated_at: string;
};

const dataDirectory = path.join(process.cwd(), "data");
const feedFilePath = path.join(dataDirectory, "home-feed.json");
const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "home-feed",
);

const initialFeedItems: HomeFeedItem[] = [];

export function isHomeFeedCategory(value: string): value is HomeFeedCategory {
  return homeFeedCategories.includes(value as HomeFeedCategory);
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeHomeFeedItem(value: unknown): HomeFeedItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Record<string, unknown>;

  if (
    typeof source.id !== "string" ||
    typeof source.title !== "string" ||
    typeof source.imageUrl !== "string" ||
    typeof source.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: source.id,
    title: source.title,
    content: typeof source.content === "string" ? source.content : "",
    category: isHomeFeedCategory(source.category as string)
      ? (source.category as HomeFeedCategory)
      : "Notice",
    tags: normalizeTags(source.tags),
    imageUrl: source.imageUrl,
    createdAt: source.createdAt,
    updatedAt:
      typeof source.updatedAt === "string" ? source.updatedAt : source.createdAt,
  };
}

function mapHomeFeedRecord(record: HomeFeedRecord): HomeFeedItem {
  return {
    id: String(record.id),
    title: record.title,
    content: record.content ?? "",
    category: isHomeFeedCategory(record.category)
      ? record.category
      : "Notice",
    tags: normalizeTags(record.tags),
    imageUrl: record.image_url,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function ensureHomeFeedStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(feedFilePath, "utf8");
  } catch {
    await writeFile(
      feedFilePath,
      `${JSON.stringify(initialFeedItems, null, 2)}\n`,
      "utf8",
    );
  }
}

async function readHomeFeedStore() {
  await ensureHomeFeedStore();

  try {
    const raw = await readFile(feedFilePath, "utf8");
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeHomeFeedItem)
      .filter((item): item is HomeFeedItem => item !== null);
  } catch {
    return [];
  }
}

async function writeHomeFeedStore(items: HomeFeedItem[]) {
  await ensureHomeFeedStore();
  await writeFile(feedFilePath, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

function getNextHomeFeedId(items: HomeFeedItem[]) {
  const maxId = items.reduce((currentMax, item) => {
    const numericId = Number.parseInt(item.id, 10);

    if (Number.isNaN(numericId)) {
      return currentMax;
    }

    return Math.max(currentMax, numericId);
  }, 0);

  return String(maxId + 1);
}

function sortHomeFeedItems(items: HomeFeedItem[]) {
  return [...items].sort((left, right) => {
    const rightId = Number.parseInt(right.id, 10);
    const leftId = Number.parseInt(left.id, 10);

    if (Number.isNaN(leftId) || Number.isNaN(rightId)) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return rightId - leftId;
  });
}

async function storeHomeFeedImageLocally(file: File) {
  const safeImage = await validateAdminImageUpload(file);
  await mkdir(uploadDirectory, { recursive: true });

  const fileName = `${randomUUID()}${safeImage.extension}`;
  const filePath = path.join(uploadDirectory, fileName);

  await writeFile(filePath, safeImage.buffer);

  return `/uploads/home-feed/${fileName}`;
}

async function storeHomeFeedImage(file: File) {
  if (hasSupabaseAdminEnv()) {
    return uploadAdminImageToSupabaseStorage({
      bucket: "home-feed",
      file,
      prefix: "cards",
    });
  }

  return storeHomeFeedImageLocally(file);
}

async function getSupabaseHomeFeedItems() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("home_feeds")
    .select("id, title, content, category, tags, image_url, created_at, updated_at")
    .order("id", { ascending: false });

  if (error) {
    throw new Error("메인 피드 데이터를 불러오지 못했습니다.");
  }

  return (data ?? []).map((record) => mapHomeFeedRecord(record as HomeFeedRecord));
}

async function getSupabaseHomeFeedItemById(id: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("home_feeds")
    .select("id, title, content, category, tags, image_url, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("메인 피드를 불러오지 못했습니다.");
  }

  return data ? mapHomeFeedRecord(data as HomeFeedRecord) : null;
}

async function saveHomeFeedItemToSupabase(input: {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  imageFile?: File | null;
  existingImageUrl?: string;
}) {
  const title = input.title.trim();
  const content = input.content.trim();
  const tags = input.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!title) {
    throw new Error("관리용 제목을 입력해 주세요.");
  }

  if (!isHomeFeedCategory(input.category)) {
    throw new Error("피드 분류를 다시 확인해 주세요.");
  }

  const imageFile =
    input.imageFile instanceof File && input.imageFile.size > 0
      ? input.imageFile
      : null;

  let imageUrl = input.existingImageUrl?.trim() ?? "";

  if (imageFile) {
    imageUrl = await storeHomeFeedImage(imageFile);
  }

  if (!imageUrl) {
    throw new Error("이미지를 등록해 주세요.");
  }

  const supabase = getSupabaseAdminClient();

  if (input.id) {
    const { data, error } = await supabase
      .from("home_feeds")
      .update({
        title,
        content,
        category: input.category,
        tags,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select("id, title, content, category, tags, image_url, created_at, updated_at")
      .single();

    if (error) {
      throw new Error("메인 피드 저장에 실패했습니다.");
    }

    return mapHomeFeedRecord(data as HomeFeedRecord);
  }

  const { data, error } = await supabase
    .from("home_feeds")
    .insert({
      title,
      content,
      category: input.category,
      tags,
      image_url: imageUrl,
    })
    .select("id, title, content, category, tags, image_url, created_at, updated_at")
    .single();

  if (error) {
    throw new Error("메인 피드 저장에 실패했습니다.");
  }

  return mapHomeFeedRecord(data as HomeFeedRecord);
}

async function removeHomeFeedItemFromSupabase(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("home_feeds").delete().eq("id", id);

  if (error) {
    throw new Error("메인 피드 삭제에 실패했습니다.");
  }

  return true;
}

export async function getHomeFeedItems() {
  if (hasSupabaseAdminEnv()) {
    return getSupabaseHomeFeedItems();
  }

  return sortHomeFeedItems(await readHomeFeedStore());
}

export async function getHomeFeedItemsByCategory(category?: string) {
  const items = await getHomeFeedItems();

  if (!category || category === "All") {
    return items;
  }

  return items.filter((item) => item.category === category);
}

export async function getHomeFeedItemById(id: string) {
  if (hasSupabaseAdminEnv()) {
    return getSupabaseHomeFeedItemById(id);
  }

  const items = await readHomeFeedStore();
  return items.find((item) => item.id === id) ?? null;
}

export async function getAdjacentHomeFeedItems(id: string) {
  const items = await getHomeFeedItems();
  const index = items.findIndex((item) => item.id === id);

  if (index < 0) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

export async function saveHomeFeedItem(input: {
  id?: string;
  title: string;
  content: string;
  category: string;
  tags: string;
  imageFile?: File | null;
  existingImageUrl?: string;
}) {
  if (hasSupabaseAdminEnv()) {
    return saveHomeFeedItemToSupabase(input);
  }

  const title = input.title.trim();
  const content = input.content.trim();
  const tags = input.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 6);

  if (!title) {
    throw new Error("관리용 제목을 입력해 주세요.");
  }

  if (!isHomeFeedCategory(input.category)) {
    throw new Error("피드 분류를 다시 확인해 주세요.");
  }

  const imageFile =
    input.imageFile instanceof File && input.imageFile.size > 0
      ? input.imageFile
      : null;

  let imageUrl = input.existingImageUrl?.trim() ?? "";

  if (imageFile) {
    imageUrl = await storeHomeFeedImage(imageFile);
  }

  if (!imageUrl) {
    throw new Error("이미지를 등록해 주세요.");
  }

  const items = await readHomeFeedStore();
  const now = new Date().toISOString();
  const existingIndex = input.id
    ? items.findIndex((item) => item.id === input.id)
    : -1;

  if (existingIndex >= 0) {
    const nextItem: HomeFeedItem = {
      ...items[existingIndex],
      title,
      content,
      category: input.category,
      tags,
      imageUrl,
      updatedAt: now,
    };

    items[existingIndex] = nextItem;
    await writeHomeFeedStore(sortHomeFeedItems(items));

    return nextItem;
  }

  const nextItem: HomeFeedItem = {
    id: getNextHomeFeedId(items),
    title,
    content,
    category: input.category,
    tags,
    imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  items.push(nextItem);
  await writeHomeFeedStore(sortHomeFeedItems(items));

  return nextItem;
}

export async function removeHomeFeedItem(id: string) {
  if (hasSupabaseAdminEnv()) {
    return removeHomeFeedItemFromSupabase(id);
  }

  const items = await readHomeFeedStore();
  const nextItems = items.filter((item) => item.id !== id);

  if (nextItems.length === items.length) {
    return false;
  }

  await writeHomeFeedStore(sortHomeFeedItems(nextItems));
  return true;
}

export function formatHomeFeedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

export function getHomeFeedReadTime(content: string) {
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return 1;
  }

  return Math.max(1, Math.ceil(plainText.length / 180));
}

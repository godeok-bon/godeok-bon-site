import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { validateAdminImageUpload } from "@/lib/image-security";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminEnv } from "@/lib/supabase/env";
import { uploadAdminImageToSupabaseStorage } from "@/lib/supabase/storage";

export const siteHeroItems = [
  {
    key: "mainSlide1",
    label: "메인 슬라이드 1",
    description: "메인 페이지 첫 번째 배경 이미지",
    group: "메인 페이지",
  },
  {
    key: "mainSlide2",
    label: "메인 슬라이드 2",
    description: "메인 페이지 두 번째 배경 이미지",
    group: "메인 페이지",
  },
  {
    key: "mainSlide3",
    label: "메인 슬라이드 3",
    description: "메인 페이지 세 번째 배경 이미지",
    group: "메인 페이지",
  },
  {
    key: "noticeHero",
    label: "공지사항 목록",
    description: "공지사항 목록 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "noticeDetailHero",
    label: "공지사항 상세",
    description: "공지 상세 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "columnHero",
    label: "원장님 칼럼",
    description: "원장님 칼럼 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "aboutHero",
    label: "센터 소개",
    description: "센터 소개 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "programHero",
    label: "평가 및 치료",
    description: "평가 및 치료 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "contactHero",
    label: "오시는 길",
    description: "오시는 길 상단 배경",
    group: "서브 페이지",
  },
  {
    key: "noticeWriteHero",
    label: "공지 작성",
    description: "공지 작성 상단 배경",
    group: "관리 페이지",
  },
  {
    key: "noticeEditHero",
    label: "공지 수정",
    description: "공지 수정 상단 배경",
    group: "관리 페이지",
  },
  {
    key: "feedWriteHero",
    label: "메인 피드 등록",
    description: "메인 피드 등록 상단 배경",
    group: "관리 페이지",
  },
  {
    key: "feedEditHero",
    label: "메인 피드 수정",
    description: "메인 피드 수정 상단 배경",
    group: "관리 페이지",
  },
] as const;

export type SiteHeroKey = (typeof siteHeroItems)[number]["key"];
export type SiteMediaSettings = Record<SiteHeroKey, string>;

const dataDirectory = `${process.cwd()}/data`;
const siteMediaFilePath = `${dataDirectory}/site-media.json`;
const uploadDirectory = `${process.cwd()}/public/uploads/site-media`;

const defaultSiteMediaSettings: SiteMediaSettings = {
  mainSlide1:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  mainSlide2:
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  mainSlide3:
    "https://images.unsplash.com/photo-1536640712-4d4c36ef0e52?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  aboutHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  columnHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  programHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  contactHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  noticeHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  noticeDetailHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  noticeWriteHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  noticeEditHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  feedWriteHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
  feedEditHero:
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
};

export function isSiteHeroKey(value: string): value is SiteHeroKey {
  return siteHeroItems.some((item) => item.key === value);
}

function normalizeSiteMediaSettings(value: unknown): SiteMediaSettings {
  const source =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return siteHeroItems.reduce((result, item) => {
    const rawValue = source[item.key];

    result[item.key] =
      typeof rawValue === "string" && rawValue.trim()
        ? rawValue.trim()
        : defaultSiteMediaSettings[item.key];

    return result;
  }, {} as SiteMediaSettings);
}

async function ensureSiteMediaStore() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(siteMediaFilePath, "utf8");
  } catch {
    await writeFile(
      siteMediaFilePath,
      `${JSON.stringify(defaultSiteMediaSettings, null, 2)}\n`,
      "utf8",
    );
  }
}

async function readSiteMediaStore() {
  await ensureSiteMediaStore();

  try {
    const raw = await readFile(siteMediaFilePath, "utf8");
    return normalizeSiteMediaSettings(JSON.parse(raw));
  } catch {
    return defaultSiteMediaSettings;
  }
}

async function writeSiteMediaStore(settings: SiteMediaSettings) {
  await ensureSiteMediaStore();
  await writeFile(
    siteMediaFilePath,
    `${JSON.stringify(settings, null, 2)}\n`,
    "utf8",
  );
}

async function storeSiteHeroImage(file: File) {
  if (hasSupabaseAdminEnv()) {
    return uploadAdminImageToSupabaseStorage({
      bucket: "site-media",
      file,
      prefix: "hero",
    });
  }

  const safeImage = await validateAdminImageUpload(file);
  await mkdir(uploadDirectory, { recursive: true });

  const fileName = `${randomUUID()}${safeImage.extension}`;
  const filePath = `${uploadDirectory}/${fileName}`;
  await writeFile(filePath, safeImage.buffer);

  return `/uploads/site-media/${fileName}`;
}

export async function getSiteMediaSettings() {
  if (hasSupabaseAdminEnv()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("site_media")
      .select("key, image_url");

    if (error) {
      throw new Error("배경 이미지 설정을 불러오지 못했습니다.");
    }

    const overrides = Object.fromEntries(
      (data ?? []).map((item) => [item.key, item.image_url]),
    );

    return normalizeSiteMediaSettings({
      ...defaultSiteMediaSettings,
      ...overrides,
    });
  }

  return readSiteMediaStore();
}

export async function getSiteHeroImage(key: SiteHeroKey) {
  const settings = await getSiteMediaSettings();
  return settings[key];
}

export async function updateSiteHeroImage(input: {
  key: SiteHeroKey;
  imageFile: File;
}) {
  const imageUrl = await storeSiteHeroImage(input.imageFile);

  if (hasSupabaseAdminEnv()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("site_media").upsert(
      {
        key: input.key,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      throw new Error("배경 이미지를 저장하지 못했습니다.");
    }

    return imageUrl;
  }

  const settings = await readSiteMediaStore();
  const nextSettings: SiteMediaSettings = {
    ...settings,
    [input.key]: imageUrl,
  };

  await writeSiteMediaStore(nextSettings);

  return nextSettings[input.key];
}

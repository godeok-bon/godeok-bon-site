import { readFile } from "fs/promises";
import path from "path";

const PLACE_ID = "2095984082";

export const NAVER_PLACE_FEED_URL =
  "https://map.naver.com/p/entry/place/2095984082?c=15.00,0,0,0,dh&placePath=/feed";

const PLACE_FEED_SOURCES = [
  NAVER_PLACE_FEED_URL,
  `https://pcmap.place.naver.com/place/${PLACE_ID}/feed`,
  `https://pcmap.place.naver.com/place/${PLACE_ID}/photo`,
];

const LOCAL_FALLBACK_IMAGES = [
  "/center4.jpeg",
  "/center3.jpeg",
  "/center2.jpeg",
  "/center1.jpeg",
];

export type NaverPlaceFeedItem = {
  id: string;
  imageUrl: string;
  href: string;
  publishedAt: string | null;
  publishedLabel: string;
};

function decodeHtmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function normalizeImageUrl(value: string) {
  const decoded = decodeHtmlEntities(value);

  try {
    const url = new URL(decoded);
    const source = url.searchParams.get("src");

    return source ? decodeURIComponent(source) : decoded;
  } catch {
    return decoded;
  }
}

function formatPublishedDate(imageUrl: string) {
  const match = imageUrl.match(/\/(20\d{2})(\d{2})(\d{2})_/);

  if (!match) {
    return {
      publishedAt: null,
      publishedLabel: "",
    };
  }

  const [, year, month, day] = match;

  return {
    publishedAt: `${year}-${month}-${day}`,
    publishedLabel: `${year}.${month}.${day}`,
  };
}

function extractImageUrls(html: string) {
  const matches = [
    ...html.matchAll(
      /https?:\/\/[^"'\s>]+(?:ldb-phinf|search\.pstatic)[^"'\s>]*/g,
    ),
  ];

  const uniqueUrls = new Set<string>();

  for (const match of matches) {
    const normalized = normalizeImageUrl(match[0]);

    if (!normalized.includes("ldb-phinf.pstatic.net")) {
      continue;
    }

    uniqueUrls.add(normalized);
  }

  return [...uniqueUrls];
}

async function readLocalSnapshot() {
  const snapshotPath = path.join(process.cwd(), "public", "center4.html");

  try {
    return await readFile(snapshotPath, "utf8");
  } catch {
    return "";
  }
}

async function fetchRemoteHtml() {
  for (const url of PLACE_FEED_SOURCES) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        },
        next: {
          revalidate: 3600,
        },
      });

      if (!response.ok) {
        continue;
      }

      const html = await response.text();

      if (html.includes("네이버 플레이스") || html.includes("og:image")) {
        return html;
      }
    } catch {
      continue;
    }
  }

  return "";
}

function buildFeedItems(imageUrls: string[], limit: number): NaverPlaceFeedItem[] {
  return imageUrls.slice(0, limit).map((imageUrl, index) => {
    const { publishedAt, publishedLabel } = formatPublishedDate(imageUrl);

    return {
      id: `naver-place-${index + 1}`,
      imageUrl,
      href: NAVER_PLACE_FEED_URL,
      publishedAt,
      publishedLabel,
    };
  });
}

function buildFallbackItems(limit: number): NaverPlaceFeedItem[] {
  return LOCAL_FALLBACK_IMAGES.slice(0, limit).map((imageUrl, index) => ({
    id: `local-place-${index + 1}`,
    imageUrl,
    href: NAVER_PLACE_FEED_URL,
    publishedAt: null,
    publishedLabel: "",
  }));
}

export async function getNaverPlaceFeed(limit = 6) {
  const remoteHtml = await fetchRemoteHtml();
  const remoteImages = extractImageUrls(remoteHtml);

  if (remoteImages.length > 0) {
    return buildFeedItems(remoteImages, limit);
  }

  const snapshotHtml = await readLocalSnapshot();
  const snapshotImages = extractImageUrls(snapshotHtml);

  if (snapshotImages.length > 0) {
    return buildFeedItems(snapshotImages, limit);
  }

  return buildFallbackItems(limit);
}

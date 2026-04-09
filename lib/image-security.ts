import "server-only";

const defaultMaxBytes = 10 * 1024 * 1024;
const defaultMaxPixels = 40_000_000;
const defaultMaxDimension = 12_000;

type SupportedImageKind = "jpeg" | "png" | "gif" | "webp";

type SupportedImageInfo = {
  kind: SupportedImageKind;
  extension: ".jpg" | ".png" | ".gif" | ".webp";
  mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
};

type ImageDimensions = {
  width: number;
  height: number;
};

type ValidatedAdminImage = {
  buffer: Buffer;
  extension: SupportedImageInfo["extension"];
  mimeType: SupportedImageInfo["mimeType"];
  width: number;
  height: number;
};

function detectImageInfo(buffer: Buffer): SupportedImageInfo | null {
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      kind: "png",
      extension: ".png",
      mimeType: "image/png",
    };
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return {
      kind: "jpeg",
      extension: ".jpg",
      mimeType: "image/jpeg",
    };
  }

  if (
    buffer.length >= 6 &&
    buffer.toString("ascii", 0, 6).startsWith("GIF8")
  ) {
    return {
      kind: "gif",
      extension: ".gif",
      mimeType: "image/gif",
    };
  }

  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return {
      kind: "webp",
      extension: ".webp",
      mimeType: "image/webp",
    };
  }

  return null;
}

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readGifDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 10) {
    return null;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  let offset = 2;

  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) {
      offset += 1;
    }

    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset += 1;
    }

    if (offset >= buffer.length) {
      return null;
    }

    const marker = buffer[offset];
    offset += 1;

    if (marker === 0xd8 || marker === 0x01) {
      continue;
    }

    if (marker === 0xd9 || marker === 0xda) {
      break;
    }

    if (offset + 2 > buffer.length) {
      return null;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    offset += 2;

    if (segmentLength < 2 || offset + segmentLength - 2 > buffer.length) {
      return null;
    }

    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame) {
      if (segmentLength < 7 || offset + 5 > buffer.length) {
        return null;
      }

      return {
        height: buffer.readUInt16BE(offset + 1),
        width: buffer.readUInt16BE(offset + 3),
      };
    }

    offset += segmentLength - 2;
  }

  return null;
}

function readWebpDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 30) {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);

  if (chunkType === "VP8X") {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (chunkType === "VP8L") {
    if (buffer.length < 25 || buffer[20] !== 0x2f) {
      return null;
    }

    const width = 1 + (((buffer[22] & 0x3f) << 8) | buffer[21]);
    const height =
      1 +
      (((buffer[24] & 0x0f) << 10) | (buffer[23] << 2) | ((buffer[22] & 0xc0) >> 6));

    return { width, height };
  }

  if (chunkType === "VP8 ") {
    if (
      buffer.length < 30 ||
      buffer[23] !== 0x9d ||
      buffer[24] !== 0x01 ||
      buffer[25] !== 0x2a
    ) {
      return null;
    }

    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  return null;
}

function readImageDimensions(
  buffer: Buffer,
  kind: SupportedImageKind,
): ImageDimensions | null {
  switch (kind) {
    case "png":
      return readPngDimensions(buffer);
    case "gif":
      return readGifDimensions(buffer);
    case "jpeg":
      return readJpegDimensions(buffer);
    case "webp":
      return readWebpDimensions(buffer);
    default:
      return null;
  }
}

export async function validateAdminImageUpload(
  file: File,
  options?: {
    maxBytes?: number;
    maxPixels?: number;
    maxDimension?: number;
  },
): Promise<ValidatedAdminImage> {
  const maxBytes = options?.maxBytes ?? defaultMaxBytes;
  const maxPixels = options?.maxPixels ?? defaultMaxPixels;
  const maxDimension = options?.maxDimension ?? defaultMaxDimension;
  const fileName = file.name.toLowerCase();

  if (file.size <= 0) {
    throw new Error("비어 있는 파일은 업로드할 수 없습니다.");
  }

  if (file.size > maxBytes) {
    throw new Error("이미지 크기는 10MB 이하만 가능합니다.");
  }

  if (fileName.endsWith(".svg") || file.type === "image/svg+xml") {
    throw new Error("SVG 이미지는 보안상 업로드할 수 없습니다.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedImage = detectImageInfo(buffer);

  if (!detectedImage) {
    throw new Error("JPG, PNG, GIF, WEBP 형식의 이미지 파일만 업로드할 수 있습니다.");
  }

  if (
    file.type &&
    file.type !== "application/octet-stream" &&
    file.type !== detectedImage.mimeType
  ) {
    throw new Error("파일 형식 정보와 실제 이미지 데이터가 일치하지 않습니다.");
  }

  const dimensions = readImageDimensions(buffer, detectedImage.kind);

  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
    throw new Error("이미지 구조를 확인할 수 없습니다.");
  }

  if (
    dimensions.width > maxDimension ||
    dimensions.height > maxDimension ||
    dimensions.width * dimensions.height > maxPixels
  ) {
    throw new Error("이미지 해상도가 너무 커서 업로드할 수 없습니다.");
  }

  return {
    buffer,
    extension: detectedImage.extension,
    mimeType: detectedImage.mimeType,
    width: dimensions.width,
    height: dimensions.height,
  };
}

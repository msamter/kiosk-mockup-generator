import { UploadedAsset } from '../types/assets';

const ALLOWED_IMAGE_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
]);

export const MAX_UPLOAD_ASSETS = 32;
const MAX_IMAGE_FILE_BYTES = 25 * 1024 * 1024;
const MAX_MOCKUP_IMAGE_DIMENSION = 1600;

interface FileSystemEntryLike {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  file?: (success: (file: File) => void, error?: (err: unknown) => void) => void;
  createReader?: () => {
    readEntries: (
      success: (entries: FileSystemEntryLike[]) => void,
      error?: (err: unknown) => void
    ) => void;
  };
}

export interface ExtractedImageBatch {
  files: File[];
  rejectedCount: number;
}

function isSupportedImageFile(file: File): boolean {
  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_BYTES) {
    return false;
  }
  if (ALLOWED_IMAGE_MIMES.has(file.type.toLowerCase())) {
    return true;
  }
  const lower = file.name.toLowerCase();
  return (
    lower.endsWith('.png') ||
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.gif')
  );
}

function inferMimeType(file: File): string {
  const type = file.type.toLowerCase();
  if (ALLOWED_IMAGE_MIMES.has(type)) return type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

const MAX_DIRECTORY_DEPTH = 6;

async function readDirectoryEntries(
  entry: FileSystemEntryLike,
  depth = 0
): Promise<{ files: File[]; rejectedCount: number }> {
  if (depth > MAX_DIRECTORY_DEPTH) {
    return { files: [], rejectedCount: 0 };
  }

  if (entry.isFile && entry.file) {
    return new Promise((resolve) => {
      entry.file!(
        (file) => {
          if (file.name.startsWith('.')) {
            resolve({ files: [], rejectedCount: 0 });
            return;
          }
          resolve(
            isSupportedImageFile(file)
              ? { files: [file], rejectedCount: 0 }
              : { files: [], rejectedCount: 1 }
          );
        },
        () => resolve({ files: [], rejectedCount: 0 })
      );
    });
  }

  if (entry.isDirectory && entry.createReader) {
    const reader = entry.createReader();
    const collected: File[] = [];
    let rejectedCount = 0;

    const readBatch = (): Promise<FileSystemEntryLike[]> =>
      new Promise((resolve) => {
        reader.readEntries(
          (entries) => resolve(entries),
          () => resolve([])
        );
      });

    let batch = await readBatch();
    while (batch.length > 0 && collected.length < MAX_UPLOAD_ASSETS) {
      for (const child of batch) {
        if (child.name.startsWith('.')) continue;
        const childResult = await readDirectoryEntries(child, depth + 1);
        collected.push(...childResult.files);
        rejectedCount += childResult.rejectedCount;
        if (collected.length >= MAX_UPLOAD_ASSETS) break;
      }
      batch = await readBatch();
    }

    return { files: collected, rejectedCount };
  }

  return { files: [], rejectedCount: 0 };
}

export async function extractImageFilesFromDataTransfer(
  dataTransfer: DataTransfer
): Promise<ExtractedImageBatch> {
  const items = Array.from(dataTransfer.items ?? []);
  const entries: FileSystemEntryLike[] = [];

  for (const item of items) {
    const webkitItem = item as DataTransferItem & {
      webkitGetAsEntry?: () => FileSystemEntryLike | null;
    };
    const entry = webkitItem.webkitGetAsEntry?.();
    if (entry) {
      entries.push(entry);
    }
  }

  if (entries.length > 0) {
    const nested = await Promise.all(entries.map((e) => readDirectoryEntries(e)));
    const flat = nested.flatMap((n) => n.files);
    const rejectedCount = nested.reduce((sum, n) => sum + n.rejectedCount, 0);
    return {
      files: flat.slice(0, MAX_UPLOAD_ASSETS),
      rejectedCount,
    };
  }

  return filterSupportedImages(dataTransfer.files ?? []);
}

export function filterSupportedImages(fileList: FileList | File[]): ExtractedImageBatch {
  const visible = Array.from(fileList).filter((f) => !f.name.startsWith('.'));
  const accepted: File[] = [];
  let rejectedCount = 0;

  for (const file of visible) {
    if (isSupportedImageFile(file)) {
      accepted.push(file);
    } else {
      rejectedCount += 1;
    }
  }

  return {
    files: accepted.slice(0, MAX_UPLOAD_ASSETS),
    rejectedCount,
  };
}

async function downscaleOversizedImage(
  image: HTMLImageElement,
  mimeType: string
): Promise<{ objectUrl: string; width: number; height: number } | null> {
  const naturalW = image.naturalWidth;
  const naturalH = image.naturalHeight;
  const maxSide = Math.max(naturalW, naturalH);

  if (mimeType === 'image/gif' || maxSide <= MAX_MOCKUP_IMAGE_DIMENSION) {
    return null;
  }

  const ratio = MAX_MOCKUP_IMAGE_DIMENSION / maxSide;
  const targetW = Math.max(1, Math.round(naturalW * ratio));
  const targetH = Math.max(1, Math.round(naturalH * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.width = 0;
    canvas.height = 0;
    return null;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, targetW, targetH);

  const outputMime = mimeType === 'image/png' ? 'image/png' : 'image/webp';
  const quality = outputMime === 'image/png' ? undefined : 0.92;

  const blob = await new Promise<Blob | null>((resolve) => {
    if (typeof canvas.toBlob === 'function') {
      canvas.toBlob((result) => resolve(result), outputMime, quality);
    } else {
      resolve(null);
    }
  });

  canvas.width = 0;
  canvas.height = 0;

  if (!blob) return null;

  return {
    objectUrl: URL.createObjectURL(blob),
    width: targetW,
    height: targetH,
  };
}

export async function prepareUploadedAsset(file: File): Promise<UploadedAsset> {
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error(`"${file.name}" exceeds the 25 MB image limit.`);
  }

  const rawObjectUrl = URL.createObjectURL(file);
  const mimeType = inferMimeType(file);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      img.onload = null;
      img.onerror = null;
      resolve(img);
    };
    img.onerror = () => {
      img.onload = null;
      img.onerror = null;
      URL.revokeObjectURL(rawObjectUrl);
      reject(new Error(`Unable to decode image "${file.name}".`));
    };
    img.src = rawObjectUrl;
  });

  let resized: { objectUrl: string; width: number; height: number } | null = null;
  try {
    resized = await downscaleOversizedImage(image, mimeType);
  } catch (err) {
    URL.revokeObjectURL(rawObjectUrl);
    throw err;
  }

  if (resized) {
    URL.revokeObjectURL(rawObjectUrl);
  }

  return {
    id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    objectUrl: resized ? resized.objectUrl : rawObjectUrl,
    width: resized ? resized.width : image.naturalWidth || 375,
    height: resized ? resized.height : image.naturalHeight || 780,
  };
}

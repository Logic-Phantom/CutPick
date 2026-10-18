import type { Orientation, PhotoAsset } from '@/domain/models';

/** Subset of expo-image-picker's ImagePickerAsset that we rely on. */
export interface PickedAsset {
  uri: string;
  width: number;
  height: number;
  assetId?: string | null;
  fileName?: string | null;
  fileSize?: number;
  mimeType?: string | null;
  type?: string | null;
  exif?: Record<string, unknown> | null;
}

export const SUPPORTED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];

export function orientationOf(w: number, h: number): Orientation {
  if (!w || !h) return 'portrait';
  const r = w / h;
  if (r > 1.05) return 'landscape';
  if (r < 0.95) return 'portrait';
  return 'square';
}

/** EXIF "YYYY:MM:DD HH:MM:SS" → ISO string, only if well-formed. */
export function parseExifDate(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(v);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
  return Number.isFinite(Date.parse(iso)) ? iso : null;
}

export interface NormalizeResult {
  accepted: Omit<PhotoAsset, 'id' | 'projectId'>[];
  rejected: { reason: 'video' | 'unsupported-type' | 'too-many'; count: number }[];
}

/**
 * Validates picked assets. Only the capture time is read from EXIF (when the user allowed it);
 * GPS and other EXIF fields are never stored.
 */
export function normalizeAssets(assets: PickedAsset[], opts: { hardMax: number; useCaptureTime: boolean }): NormalizeResult {
  const accepted: NormalizeResult['accepted'] = [];
  let video = 0;
  let unsupported = 0;
  let tooMany = 0;
  for (const a of assets) {
    if (a.type === 'video') {
      video++;
      continue;
    }
    const mime = a.mimeType?.toLowerCase() ?? null;
    if (mime && !SUPPORTED_MIME.includes(mime)) {
      unsupported++;
      continue;
    }
    if (accepted.length >= opts.hardMax) {
      tooMany++;
      continue;
    }
    const exif = a.exif ?? null;
    const createdAt = opts.useCaptureTime && exif ? parseExifDate(exif.DateTimeOriginal ?? exif.DateTime) : null;
    accepted.push({
      localUri: a.uri,
      assetId: a.assetId ?? null,
      width: a.width || 0,
      height: a.height || 0,
      fileSizeBytes: a.fileSize ?? null,
      mimeType: mime,
      createdAt,
      orientation: orientationOf(a.width, a.height),
      thumbnailUri: null,
      perceptualHash: null,
      qualityMetrics: null,
      sceneTags: [],
      duplicateGroupId: null,
      analysisStatus: 'pending',
      importIndex: accepted.length,
    });
  }
  const rejected: NormalizeResult['rejected'] = [];
  if (video) rejected.push({ reason: 'video', count: video });
  if (unsupported) rejected.push({ reason: 'unsupported-type', count: unsupported });
  if (tooMany) rejected.push({ reason: 'too-many', count: tooMany });
  return { accepted, rejected };
}

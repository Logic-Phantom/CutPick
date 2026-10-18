import { isRunningInExpoGo } from 'expo';
import { Asset as LibraryAsset, requestPermissionsAsync } from 'expo-media-library';
import * as Sharing from 'expo-sharing';

import { AppError } from '@/domain/errors';
import type { CropPreference, PhotoAsset } from '@/domain/models';
import { clearExports, deleteFile, persistExport, readFileHead } from '@/infrastructure/file-storage/app-files';
import { renderCroppedJpeg } from '@/infrastructure/image-processing/image-pipeline';
import { centerCropRect } from '@/features/platforms/crop';
import type { AspectOption, PlatformPurpose } from '@/features/platforms/platform-profiles';

import { exportFileName } from './file-naming';
import { scanJpegMetadata } from './jpeg-metadata';

export interface ExportedFile {
  photoId: string;
  uri: string;
  fileName: string;
  width: number;
  height: number;
}

export const IS_WEB = process.env.EXPO_OS === 'web';

/**
 * Expo Go on Android cannot obtain media-library access (Android permission policy; confirmed on
 * a Galaxy Z Flip5 / Android 16 with Expo Go 58.0.4). Saving works only in a development or store build.
 */
// Constants.executionEnvironment reports 'bare' inside Expo Go 58 (observed on device), so use isRunningInExpoGo().
export const IS_EXPO_GO_ANDROID = process.env.EXPO_OS === 'android' && isRunningInExpoGo();

const EXPO_GO_SAVE_MESSAGE = 'Expo Go(Android) 테스트 환경에서는 사진 앱 저장 권한을 받을 수 없어요. 정식 앱(개발 빌드)에서는 동작해요. 지금은 아래 "한 장씩 공유"를 이용해 주세요.';

/**
 * Renders ordered, cropped JPEG copies. The re-encoded copies do not carry the source EXIF
 * (incl. GPS); this is verified by unit-level reasoning only — device verification is pending
 * (docs/PRIVACY.md). Originals are never modified.
 */
export async function exportPhotos(params: {
  projectId: string;
  photos: PhotoAsset[];
  orderedIds: string[];
  purpose: PlatformPurpose;
  aspect: AspectOption;
  crops: CropPreference[];
  onProgress?: (done: number, total: number) => void;
}): Promise<ExportedFile[]> {
  const { projectId, photos, orderedIds, purpose, aspect, crops } = params;
  if (!IS_WEB) clearExports(projectId);
  const byId = new Map(photos.map((p) => [p.id, p]));
  const out: ExportedFile[] = [];
  const now = new Date();
  for (let i = 0; i < orderedIds.length; i++) {
    const p = byId.get(orderedIds[i]);
    if (!p) continue;
    const rect = crops.find((c) => c.photoId === p.id && c.aspect === aspect.id)?.rect ?? centerCropRect(p.width, p.height, aspect.ratio);
    const rendered = await renderCroppedJpeg(p.localUri, { width: p.width, height: p.height }, rect, purpose.exportMaxSide, 0.9, IS_WEB);
    const fileName = exportFileName(now, purpose.id, i, orderedIds.length);
    const uri = IS_WEB && rendered.base64 ? `data:image/jpeg;base64,${rendered.base64}` : await persistExport(rendered.uri, projectId, fileName);
    // Privacy guard: an exported copy must never carry location metadata.
    const head = await readFileHead(uri);
    const scan = head ? scanJpegMetadata(head) : null;
    if (__DEV__) {
      const src = await readFileHead(p.localUri);
      const srcScan = src ? scanJpegMetadata(src) : null;
      console.log(`[cutpick:privacy] export #${i + 1} sourceExif=${srcScan?.hasExif} sourceGps=${srcScan?.hasGps} outputExif=${scan?.hasExif} outputGps=${scan?.hasGps}`);
    }
    if (scan?.hasGps) {
      deleteFile(uri);
      throw new AppError('validation', '내보낸 사본에서 위치 정보가 발견돼 저장을 중단했어요. 이 사진은 제외하고 다시 시도해 주세요.');
    }
    out.push({ photoId: p.id, uri, fileName, width: rendered.width, height: rendered.height });
    params.onProgress?.(i + 1, orderedIds.length);
  }
  return out;
}

/** Saves files to the photo library in order. Requests write-only access. */
export async function saveToLibrary(files: ExportedFile[]): Promise<number> {
  if (IS_WEB) throw new AppError('share-unavailable', '웹 미리보기에서는 사진 앱 저장을 지원하지 않아요.');
  if (IS_EXPO_GO_ANDROID) throw new AppError('share-unavailable', EXPO_GO_SAVE_MESSAGE);
  let perm: Awaited<ReturnType<typeof requestPermissionsAsync>>;
  try {
    perm = await requestPermissionsAsync(true, ['photo']);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    throw new AppError('share-unavailable', /Expo Go/i.test(msg) ? EXPO_GO_SAVE_MESSAGE : undefined, e);
  }
  if (!perm.granted) throw new AppError('permission-denied', '사진 저장 권한이 필요해요. 기기 설정 > 컷픽 > 사진에서 "추가만 허용" 이상으로 바꿔 주세요.');
  let saved = 0;
  for (const f of files) {
    try {
      await LibraryAsset.create(f.uri);
      saved++;
    } catch (e) {
      if (saved === 0) throw new AppError('storage-failed', undefined, e);
      break;
    }
  }
  return saved;
}

/** Shares a single file via the OS share sheet (multi-file share is not offered by expo-sharing). */
export async function shareFile(file: ExportedFile): Promise<void> {
  if (IS_WEB || !(await Sharing.isAvailableAsync())) throw new AppError('share-unavailable');
  await Sharing.shareAsync(file.uri, { mimeType: 'image/jpeg', UTI: 'public.jpeg', dialogTitle: file.fileName });
}

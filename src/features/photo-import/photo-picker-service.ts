import * as ImagePicker from 'expo-image-picker';

import { AppError } from '@/domain/errors';
import { IMPORT_LIMITS } from '@/domain/recommendation-policy';

import { normalizeAssets, type NormalizeResult } from './asset-normalizer';

/**
 * Opens the OS photo picker. Only photos the user explicitly selects are accessed —
 * the library is never scanned. No media-library permission is required for the picker.
 */
export async function pickPhotos(opts: { useCaptureTime: boolean }): Promise<NormalizeResult | null> {
  let result: ImagePicker.ImagePickerResult;
  try {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: IMPORT_LIMITS.hardMax,
      orderedSelection: true,
      // EXIF is requested only to read the capture time when the user opted in; GPS is discarded.
      exif: opts.useCaptureTime,
      quality: 1,
    });
  } catch (e) {
    throw new AppError('permission-denied', undefined, e);
  }
  if (result.canceled || !result.assets) return null;
  return normalizeAssets(result.assets, { hardMax: IMPORT_LIMITS.hardMax, useCaptureTime: opts.useCaptureTime });
}

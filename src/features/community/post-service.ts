import { AppError } from '@/domain/errors';
import type { PhotoAsset } from '@/domain/models';
import { scanJpegMetadata } from '@/features/export-share/jpeg-metadata';
import { renderJpeg } from '@/infrastructure/image-processing/image-pipeline';
import { base64ToBytes } from '@/utils/base64';

import type { FeedPost } from './community-repository';
import { COMMUNITY_LIMITS, type PostCategory, type StyleTag } from './moderation-policy';
import { communityRepository } from './supabase-community-repository';

/**
 * Builds the share derivative: re-encoded JPEG (long side ≤ 1440) + thumbnail.
 * Re-encoding drops the source EXIF block (GPS, device data). The original is untouched.
 */
export async function prepareShareDerivative(photo: PhotoAsset) {
  const size = { width: photo.width, height: photo.height };
  const image = await renderJpeg(photo.localUri, size, COMMUNITY_LIMITS.imageMaxSide, COMMUNITY_LIMITS.imageQuality, true);
  const thumb = await renderJpeg(photo.localUri, size, COMMUNITY_LIMITS.thumbMaxSide, COMMUNITY_LIMITS.thumbQuality, true);
  if (!image.base64 || !thumb.base64) throw new Error('derivative-missing-data');
  const imageBytes = base64ToBytes(image.base64);
  const thumbBytes = base64ToBytes(thumb.base64);
  // Privacy guard: refuse to upload anything that still carries GPS metadata.
  if (scanJpegMetadata(imageBytes).hasGps || scanJpegMetadata(thumbBytes).hasGps) {
    throw new AppError('validation', '공유용 사본에서 위치 정보가 발견돼 업로드를 중단했어요.');
  }
  return {
    image: { bytes: imageBytes, width: image.width, height: image.height },
    thumb: { bytes: thumbBytes, width: thumb.width, height: thumb.height },
    previewUri: `data:image/jpeg;base64,${thumb.base64}`,
  };
}

export async function publishPhoto(photo: PhotoAsset, category: PostCategory, styleTags: StyleTag[]): Promise<FeedPost> {
  const d = await prepareShareDerivative(photo);
  return communityRepository.createPost({ image: d.image, thumb: d.thumb, category, styleTags });
}

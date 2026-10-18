import type { PhotoAsset } from '@/domain/models';
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
  return {
    image: { bytes: base64ToBytes(image.base64), width: image.width, height: image.height },
    thumb: { bytes: base64ToBytes(thumb.base64), width: thumb.width, height: thumb.height },
    previewUri: `data:image/jpeg;base64,${thumb.base64}`,
  };
}

export async function publishPhoto(photo: PhotoAsset, category: PostCategory, styleTags: StyleTag[]): Promise<FeedPost> {
  const d = await prepareShareDerivative(photo);
  return communityRepository.createPost({ image: d.image, thumb: d.thumb, category, styleTags });
}

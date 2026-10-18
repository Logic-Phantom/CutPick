import { Asset } from 'expo-asset';

import { orientationOf } from './asset-normalizer';
import type { PhotoAsset } from '@/domain/models';

/**
 * Bundled sample photos: real Wikimedia Commons photos under CC0 / CC BY (credits in
 * ./sample-credits.ts), built by scripts/build-sample-photos.py. A few are deliberately degraded
 * copies (burst shift, blur, brighter shot, blown exposure) so grouping and quality scores have
 * something to find. Projects created from them are flagged isSample and labelled in the UI.
 */
const SAMPLES = [
  require('@/assets/samples/sample-01.jpg'),
  require('@/assets/samples/sample-02.jpg'),
  require('@/assets/samples/sample-03.jpg'),
  require('@/assets/samples/sample-04.jpg'),
  require('@/assets/samples/sample-05.jpg'),
  require('@/assets/samples/sample-06.jpg'),
  require('@/assets/samples/sample-07.jpg'),
  require('@/assets/samples/sample-08.jpg'),
  require('@/assets/samples/sample-09.jpg'),
  require('@/assets/samples/sample-10.jpg'),
  require('@/assets/samples/sample-11.jpg'),
  require('@/assets/samples/sample-12.jpg'),
  require('@/assets/samples/sample-13.jpg'),
  require('@/assets/samples/sample-14.jpg'),
  require('@/assets/samples/sample-15.jpg'),
  require('@/assets/samples/sample-16.jpg'),
  require('@/assets/samples/sample-17.jpg'),
  require('@/assets/samples/sample-18.jpg'),
];

export async function loadSamplePhotos(): Promise<Omit<PhotoAsset, 'id' | 'projectId'>[]> {
  const assets = await Promise.all(SAMPLES.map((m) => Asset.fromModule(m).downloadAsync()));
  return assets.map((a, i) => ({
    localUri: a.localUri ?? a.uri,
    assetId: null,
    width: a.width ?? 0,
    height: a.height ?? 0,
    fileSizeBytes: null,
    mimeType: 'image/jpeg',
    createdAt: null,
    orientation: orientationOf(a.width ?? 0, a.height ?? 0),
    thumbnailUri: null,
    perceptualHash: null,
    qualityMetrics: null,
    sceneTags: [],
    duplicateGroupId: null,
    analysisStatus: 'pending',
    importIndex: i,
  }));
}

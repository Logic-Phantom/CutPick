import { Asset } from 'expo-asset';

import { orientationOf } from './asset-normalizer';
import type { PhotoAsset } from '@/domain/models';
import { persistSampleFile } from '@/infrastructure/file-storage/app-files';

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

/**
 * Android release builds embed images as drawable resources, and expo-asset reports the bare
 * resource name (e.g. "assets_samples_sample01") as an already-downloaded localUri. Image
 * manipulator cannot open that, so analysis failed with decode-failed for every sample.
 */
export function isEmbeddedResourceName(uri: string): boolean {
  return process.env.EXPO_OS === 'android' && !uri.includes(':');
}

/** Turns an embedded resource name into a persistent file URI the image pipeline can read. */
export async function materializeEmbeddedImage(resourceName: string): Promise<string> {
  const copy = new Asset({ name: resourceName, type: 'jpg', hash: null, uri: resourceName });
  await copy.downloadAsync();
  if (!copy.localUri) throw new Error('embedded asset copy failed');
  return persistSampleFile(copy.localUri, `${resourceName}.jpg`);
}

export async function loadSamplePhotos(): Promise<Omit<PhotoAsset, 'id' | 'projectId'>[]> {
  const assets = await Promise.all(SAMPLES.map((m) => Asset.fromModule(m).downloadAsync()));
  const uris = await Promise.all(
    assets.map((a) => {
      const uri = a.localUri ?? a.uri;
      return isEmbeddedResourceName(uri) ? materializeEmbeddedImage(uri) : uri;
    }),
  );
  return assets.map((a, i) => ({
    localUri: uris[i],
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

import { base64ToBytes } from '@/utils/base64';

/**
 * Web development-preview implementation. expo-file-system has no web support,
 * so thumbnails are kept as small data URIs in the local database instead.
 * The web target exists only for UI QA; it is not a supported release platform.
 */
export async function persistThumbnail(tempUri: string, _projectId: string, _photoId: string, base64?: string): Promise<string> {
  if (base64) return `data:image/jpeg;base64,${base64}`;
  return tempUri;
}

export async function persistSampleFile(cacheUri: string, _fileName: string): Promise<string> {
  return cacheUri;
}

export function exportsDirectory(_projectId: string): null {
  return null;
}

export async function persistExport(tempUri: string, _projectId: string, _fileName: string): Promise<string> {
  return tempUri;
}

export function clearExports(_projectId: string): void {}

export function deleteProjectFiles(_projectId: string): void {}

export function deleteAllAppFiles(): void {}

export function isFileReachable(_uri: string): boolean {
  return true;
}

export async function readFileHead(uri: string, maxBytes = 256 * 1024): Promise<Uint8Array | null> {
  if (!uri.startsWith('data:')) return null;
  const bytes = base64ToBytes(uri);
  return bytes.subarray(0, Math.min(bytes.length, maxBytes));
}

export function deleteFile(_uri: string): void {}

export function derivedStorageBytes(): number {
  return 0;
}

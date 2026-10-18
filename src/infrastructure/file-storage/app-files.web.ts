/**
 * Web development-preview implementation. expo-file-system has no web support,
 * so thumbnails are kept as small data URIs in the local database instead.
 * The web target exists only for UI QA; it is not a supported release platform.
 */
export async function persistThumbnail(tempUri: string, _projectId: string, _photoId: string, base64?: string): Promise<string> {
  if (base64) return `data:image/jpeg;base64,${base64}`;
  return tempUri;
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

export function derivedStorageBytes(): number {
  return 0;
}

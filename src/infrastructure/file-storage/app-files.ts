import { Directory, File, Paths } from 'expo-file-system';

/**
 * App-private file storage (native). Only derived files live here:
 * thumbnails and export copies. Original photos are never written or deleted.
 */
const ROOT = 'cutpick';

function dir(...parts: string[]): Directory {
  const d = new Directory(Paths.document, ROOT, ...parts);
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  return d;
}

/** Moves a temporary manipulator output into persistent app storage. */
export async function persistThumbnail(tempUri: string, projectId: string, photoId: string, _base64?: string): Promise<string> {
  const target = new File(dir('thumbs', projectId), `${photoId}.jpg`);
  if (target.exists) target.delete();
  await new File(tempUri).move(target);
  return target.uri;
}

export function exportsDirectory(projectId: string): Directory {
  return dir('exports', projectId);
}

/** Copies a temporary file into the export folder under a stable, ordered name. */
export async function persistExport(tempUri: string, projectId: string, fileName: string): Promise<string> {
  const target = new File(exportsDirectory(projectId), fileName);
  if (target.exists) target.delete();
  await new File(tempUri).move(target);
  return target.uri;
}

export function clearExports(projectId: string): void {
  const d = new Directory(Paths.document, ROOT, 'exports', projectId);
  if (d.exists) d.delete();
}

/** Deletes every derived file of a project (thumbnails + exports). */
export function deleteProjectFiles(projectId: string): void {
  for (const sub of ['thumbs', 'exports']) {
    const d = new Directory(Paths.document, ROOT, sub, projectId);
    if (d.exists) d.delete();
  }
}

export function deleteAllAppFiles(): void {
  const d = new Directory(Paths.document, ROOT);
  if (d.exists) d.delete();
}

/** Whether the original picked file is still reachable (picker URIs can expire). */
export function isFileReachable(uri: string): boolean {
  try {
    if (!uri.startsWith('file:')) return true; // content:// / ph:// cannot be checked cheaply; assume reachable
    return new File(uri).exists;
  } catch {
    return false;
  }
}

/** Approximate size of app-private derived files in bytes. */
export function derivedStorageBytes(): number {
  const root = new Directory(Paths.document, ROOT);
  if (!root.exists) return 0;
  return root.size ?? 0;
}

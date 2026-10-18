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

/**
 * Copies a bundled sample image into persistent app storage and returns its file URI.
 * The expo-asset cache copy can be purged by the OS, but sample photos must stay readable
 * for re-analysis and export.
 */
export async function persistSampleFile(cacheUri: string, fileName: string): Promise<string> {
  const target = new File(dir('samples'), fileName);
  if (!target.exists) await new File(cacheUri).copy(target);
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

/** Reads up to `maxBytes` of a local file (metadata checks only need the header). */
export async function readFileHead(uri: string, maxBytes = 256 * 1024): Promise<Uint8Array | null> {
  try {
    const bytes = await new File(uri).bytes();
    return bytes.subarray(0, Math.min(bytes.length, maxBytes));
  } catch {
    return null;
  }
}

/** Deletes a single derived file (used when a privacy check fails). */
export function deleteFile(uri: string): void {
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // best effort
  }
}

/** Approximate size of app-private derived files in bytes. */
export function derivedStorageBytes(): number {
  const root = new Directory(Paths.document, ROOT);
  if (!root.exists) return 0;
  return root.size ?? 0;
}

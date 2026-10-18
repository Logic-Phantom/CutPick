import type { AnalysisStatus, CutpickProject, PhotoAsset, PhotoQualityMetrics, PlatformId, RecommendationSet, SceneTag, SourceContext } from '@/domain/models';
import { getDb } from '@/infrastructure/database/db';
import { deleteProjectFiles } from '@/infrastructure/file-storage/app-files';
import { newId } from '@/utils/id';

interface ProjectRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  source_context: string;
  platforms_json: string;
  target_count: number;
  preset_id: string;
  is_sample: number;
  photo_count?: number;
  cover_uri?: string | null;
}

interface PhotoRow {
  id: string;
  project_id: string;
  local_uri: string;
  asset_id: string | null;
  width: number;
  height: number;
  file_size: number | null;
  mime_type: string | null;
  created_at: string | null;
  orientation: string;
  thumbnail_uri: string | null;
  phash: string | null;
  metrics_json: string | null;
  scene_tags_json: string;
  dup_group_id: string | null;
  status: string;
  error: string | null;
  import_index: number;
}

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function toProject(r: ProjectRow): CutpickProject {
  return {
    id: r.id,
    title: r.title,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    sourceContext: r.source_context as SourceContext,
    selectedPlatforms: parseJson<PlatformId[]>(r.platforms_json, []),
    targetPhotoCount: r.target_count,
    stylePresetId: r.preset_id,
    isSample: !!r.is_sample,
    photoCount: r.photo_count,
    coverUri: r.cover_uri ?? null,
  };
}

function toPhoto(r: PhotoRow): PhotoAsset {
  return {
    id: r.id,
    projectId: r.project_id,
    localUri: r.local_uri,
    assetId: r.asset_id,
    width: r.width,
    height: r.height,
    fileSizeBytes: r.file_size,
    mimeType: r.mime_type,
    createdAt: r.created_at,
    orientation: r.orientation as PhotoAsset['orientation'],
    thumbnailUri: r.thumbnail_uri,
    perceptualHash: r.phash,
    qualityMetrics: parseJson<PhotoQualityMetrics | null>(r.metrics_json, null),
    sceneTags: parseJson<SceneTag[]>(r.scene_tags_json, []),
    duplicateGroupId: r.dup_group_id,
    analysisStatus: r.status as AnalysisStatus,
    analysisError: r.error,
    importIndex: r.import_index,
  };
}

export interface NewProjectInput {
  title: string;
  sourceContext: SourceContext;
  selectedPlatforms: PlatformId[];
  targetPhotoCount: number;
  stylePresetId: string;
  isSample?: boolean;
}

export async function createProject(input: NewProjectInput, photos: Omit<PhotoAsset, 'id' | 'projectId'>[]): Promise<CutpickProject> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = newId('p_');
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'INSERT INTO projects (id, title, created_at, updated_at, source_context, platforms_json, target_count, preset_id, is_sample) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, input.title, now, now, input.sourceContext, JSON.stringify(input.selectedPlatforms), input.targetPhotoCount, input.stylePresetId, input.isSample ? 1 : 0,
    );
    for (const p of photos) {
      await db.runAsync(
        `INSERT INTO photos (id, project_id, local_uri, asset_id, width, height, file_size, mime_type, created_at, orientation, scene_tags_json, status, import_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        newId('ph_'), id, p.localUri, p.assetId ?? null, p.width, p.height, p.fileSizeBytes ?? null, p.mimeType ?? null, p.createdAt ?? null, p.orientation, JSON.stringify(p.sceneTags), 'pending', p.importIndex,
      );
    }
  });
  return (await getProject(id))!;
}

export async function listProjects(): Promise<CutpickProject[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ProjectRow>(
    `SELECT p.*, (SELECT COUNT(*) FROM photos ph WHERE ph.project_id = p.id) AS photo_count,
       (SELECT thumbnail_uri FROM photos ph WHERE ph.project_id = p.id AND thumbnail_uri IS NOT NULL ORDER BY import_index LIMIT 1) AS cover_uri
     FROM projects p ORDER BY p.updated_at DESC`,
  );
  return rows.map(toProject);
}

export async function getProject(id: string): Promise<CutpickProject | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ProjectRow>(
    `SELECT p.*, (SELECT COUNT(*) FROM photos ph WHERE ph.project_id = p.id) AS photo_count FROM projects p WHERE p.id = ?`,
    id,
  );
  return row ? toProject(row) : null;
}

export async function updateProject(id: string, patch: Partial<Pick<CutpickProject, 'title' | 'targetPhotoCount' | 'stylePresetId' | 'selectedPlatforms' | 'sourceContext'>>): Promise<void> {
  const db = await getDb();
  const cur = await getProject(id);
  if (!cur) return;
  const next = { ...cur, ...patch };
  await db.runAsync(
    'UPDATE projects SET title = ?, target_count = ?, preset_id = ?, platforms_json = ?, source_context = ?, updated_at = ? WHERE id = ?',
    next.title, next.targetPhotoCount, next.stylePresetId, JSON.stringify(next.selectedPlatforms), next.sourceContext, new Date().toISOString(), id,
  );
}

/** Deletes project metadata and derived files. Never touches the user's original photos. */
export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM recommendation_sets WHERE project_id = ?', id);
    await db.runAsync('DELETE FROM photos WHERE project_id = ?', id);
    await db.runAsync('DELETE FROM projects WHERE id = ?', id);
  });
  try {
    deleteProjectFiles(id);
  } catch {
    // derived files are best-effort; metadata is already gone
  }
}

export async function listPhotos(projectId: string): Promise<PhotoAsset[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<PhotoRow>('SELECT * FROM photos WHERE project_id = ? ORDER BY import_index', projectId);
  return rows.map(toPhoto);
}

export async function getPhoto(photoId: string): Promise<PhotoAsset | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PhotoRow>('SELECT * FROM photos WHERE id = ?', photoId);
  return row ? toPhoto(row) : null;
}

export async function saveAnalysisResult(photoId: string, r: { thumbnailUri?: string; perceptualHash?: string; metrics?: PhotoQualityMetrics; status: AnalysisStatus; error?: string | null }): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE photos SET thumbnail_uri = COALESCE(?, thumbnail_uri), phash = COALESCE(?, phash), metrics_json = COALESCE(?, metrics_json), status = ?, error = ? WHERE id = ?',
    r.thumbnailUri ?? null, r.perceptualHash ?? null, r.metrics ? JSON.stringify(r.metrics) : null, r.status, r.error ?? null, photoId,
  );
}

export async function setPhotoLocalUri(photoId: string, localUri: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE photos SET local_uri = ? WHERE id = ?', localUri, photoId);
}

export async function setPhotoStatus(projectId: string, from: AnalysisStatus[], to: AnalysisStatus): Promise<void> {
  const db = await getDb();
  const placeholders = from.map(() => '?').join(',');
  await db.runAsync(`UPDATE photos SET status = ?, error = NULL WHERE project_id = ? AND status IN (${placeholders})`, to, projectId, ...from);
}

export async function saveDuplicateGroups(projectId: string, groups: { id: string; memberIds: string[] }[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE photos SET dup_group_id = NULL WHERE project_id = ?', projectId);
    for (const g of groups) {
      for (const pid of g.memberIds) await db.runAsync('UPDATE photos SET dup_group_id = ? WHERE id = ?', g.id, pid);
    }
  });
}

export async function setSceneTags(photoId: string, tags: SceneTag[]): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE photos SET scene_tags_json = ? WHERE id = ?', JSON.stringify(tags), photoId);
}

/** Removes a photo from the project only (the original file is untouched). */
export async function removePhotoFromProject(photoId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM photos WHERE id = ?', photoId);
}

export async function touchProject(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE projects SET updated_at = ? WHERE id = ?', new Date().toISOString(), id);
}

// ---- recommendation sets

export async function getRecommendationSet(projectId: string, purposeId: string): Promise<RecommendationSet | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data_json: string }>('SELECT data_json FROM recommendation_sets WHERE project_id = ? AND purpose_id = ?', projectId, purposeId);
  return row ? parseJson<RecommendationSet | null>(row.data_json, null) : null;
}

export async function latestRecommendationSet(projectId: string): Promise<RecommendationSet | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data_json: string }>('SELECT data_json FROM recommendation_sets WHERE project_id = ? ORDER BY updated_at DESC LIMIT 1', projectId);
  return row ? parseJson<RecommendationSet | null>(row.data_json, null) : null;
}

export async function saveRecommendationSet(set: RecommendationSet): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO recommendation_sets (id, project_id, purpose_id, data_json, updated_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(project_id, purpose_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`,
    set.id, set.projectId, set.purposeId, JSON.stringify(set), set.updatedAt,
  );
  await touchProject(set.projectId);
}

export async function deleteAllProjects(): Promise<void> {
  const projects = await listProjects();
  for (const p of projects) await deleteProject(p.id);
}

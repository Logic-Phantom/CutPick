import { AppError, logError } from '@/domain/errors';
import type { PhotoAsset } from '@/domain/models';
import { ANALYSIS_CONFIG, ANALYSIS_VERSION } from '@/domain/recommendation-policy';
import { isEmbeddedResourceName, materializeEmbeddedImage } from '@/features/photo-import/sample-photos';
import { listPhotos, saveAnalysisResult, saveDuplicateGroups, setPhotoLocalUri, setPhotoStatus, touchProject } from '@/features/project-library/project-repository';
import { technicalQuality } from '@/features/recommendations/scoring';

import { CancelToken, runQueue } from './analysis-queue';
import type { AnalysisStage, PhotoAnalysisProvider } from './contracts';
import { groupDuplicates } from './duplicate-analyzer';
import { HeuristicAnalysisProvider } from './heuristic-provider';

export interface JobState {
  projectId: string;
  stage: AnalysisStage | 'cancelled' | 'idle';
  processed: number;
  failed: number;
  total: number;
  startedAt: number;
  finishedAt?: number;
  /** Measured wall time per photo (ms), only when at least one photo finished. */
  msPerPhoto?: number;
}

type Listener = (s: JobState) => void;

const provider: PhotoAnalysisProvider = new HeuristicAnalysisProvider();
const jobs = new Map<string, { state: JobState; token: CancelToken }>();
const listeners = new Map<string, Set<Listener>>();

function emit(projectId: string, state: JobState) {
  listeners.get(projectId)?.forEach((l) => l(state));
}

export function subscribeJob(projectId: string, l: Listener): () => void {
  const set = listeners.get(projectId) ?? new Set();
  set.add(l);
  listeners.set(projectId, set);
  const cur = jobs.get(projectId);
  if (cur) l(cur.state);
  return () => set.delete(l);
}

/** Pending photos, plus photos analyzed by an older algorithm version (re-queued). */
export function needsAnalysis(p: PhotoAsset): boolean {
  if (p.analysisStatus === 'pending' || p.analysisStatus === 'processing') return true;
  return p.analysisStatus === 'done' && p.qualityMetrics?.analysisVersion !== ANALYSIS_VERSION;
}

export function getJob(projectId: string): JobState | null {
  return jobs.get(projectId)?.state ?? null;
}

export function isRunning(projectId: string): boolean {
  const s = jobs.get(projectId)?.state.stage;
  return s === 'checking' || s === 'thumbnail' || s === 'quality' || s === 'grouping';
}

export function cancelAnalysis(projectId: string): void {
  jobs.get(projectId)?.token.cancel();
}

export async function regroupDuplicates(projectId: string, photos?: PhotoAsset[]): Promise<void> {
  const list = photos ?? (await listPhotos(projectId));
  const groups = groupDuplicates(
    list
      .filter((p) => p.analysisStatus === 'done')
      .map((p) => ({ id: p.id, hash: p.perceptualHash, meanRgb: p.qualityMetrics?.meanRgb ?? null, createdAt: p.createdAt, quality: p.qualityMetrics ? technicalQuality(p.qualityMetrics) : 0 })),
  );
  await saveDuplicateGroups(projectId, groups);
}

/**
 * Analyzes all pending (and optionally failed) photos of a project.
 * Status is persisted per photo, so an interrupted job resumes where it stopped.
 */
export async function startAnalysis(projectId: string, opts: { retryFailed?: boolean } = {}): Promise<JobState> {
  if (isRunning(projectId)) return jobs.get(projectId)!.state;
  const token = new CancelToken();
  const state: JobState = { projectId, stage: 'checking', processed: 0, failed: 0, total: 0, startedAt: Date.now() };
  jobs.set(projectId, { state, token });
  const update = (patch: Partial<JobState>) => {
    Object.assign(state, patch);
    emit(projectId, { ...state });
  };
  update({});

  // Sample photos imported by older Android release builds stored a drawable resource name
  // instead of a file URI; repair them and retry the ones that failed because of it.
  const broken = (await listPhotos(projectId)).filter((p) => isEmbeddedResourceName(p.localUri));
  for (const p of broken) {
    try {
      await setPhotoLocalUri(p.id, await materializeEmbeddedImage(p.localUri));
      if (p.analysisStatus === 'failed') await saveAnalysisResult(p.id, { status: 'pending' });
    } catch (e) {
      logError('analysis', e);
    }
  }

  // Photos left in 'processing' by a killed app are retried.
  await setPhotoStatus(projectId, opts.retryFailed ? ['processing', 'failed'] : ['processing'], 'pending');
  const todo = (await listPhotos(projectId)).filter(needsAnalysis);
  update({ stage: 'quality', total: todo.length });

  const t0 = Date.now();
  const result = await runQueue(
    {
      items: todo,
      concurrency: ANALYSIS_CONFIG.concurrency,
      worker: async (photo) => {
        await saveAnalysisResult(photo.id, { status: 'processing' });
        return provider.analyzeOne(photo);
      },
      onResult: async (photo, r) => {
        await saveAnalysisResult(photo.id, { thumbnailUri: r.thumbnailUri, perceptualHash: r.perceptualHash, metrics: r.metrics, status: 'done' });
      },
      onError: async (photo, err) => {
        logError('analysis', err);
        const code = err instanceof AppError ? err.code : 'unknown';
        await saveAnalysisResult(photo.id, { status: 'failed', error: code });
      },
      onProgress: (p) => update({ processed: p.processed, failed: p.failed }),
    },
    token,
  );

  if (result.cancelled) {
    // Unfinished photos go back to pending so the user can resume later.
    await setPhotoStatus(projectId, ['processing'], 'pending');
    update({ stage: 'cancelled', finishedAt: Date.now() });
    return { ...state };
  }

  update({ stage: 'grouping' });
  await regroupDuplicates(projectId);
  await touchProject(projectId);
  const done = result.processed - result.failed;
  update({ stage: 'done', finishedAt: Date.now(), msPerPhoto: done > 0 ? Math.round((Date.now() - t0) / done) : undefined });
  return { ...state };
}

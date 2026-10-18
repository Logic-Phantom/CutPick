import { ANALYSIS_CONFIG } from '@/domain/recommendation-policy';
import { signatureVector, vectorDistance } from './perceptual-hash';

export interface DuplicateCandidate {
  id: string;
  hash: string | null | undefined;
  meanRgb?: [number, number, number] | null;
  createdAt?: string | null;
  /** Technical quality used to pick the default representative. */
  quality: number;
}

export interface DuplicateConfig {
  signatureThreshold: number;
  maxColorDistance: number;
  maxSecondsApart: number | null;
}

export interface DuplicateGroup {
  id: string;
  memberIds: string[];
  representativeId: string;
}

const DEFAULT_CONFIG: DuplicateConfig = {
  signatureThreshold: ANALYSIS_CONFIG.duplicateSignatureThreshold,
  maxColorDistance: ANALYSIS_CONFIG.duplicateMaxColorDistance,
  maxSecondsApart: ANALYSIS_CONFIG.duplicateMaxSecondsApart,
};

function colorDistance(a?: [number, number, number] | null, b?: [number, number, number] | null): number {
  if (!a || !b) return 0;
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function withinTime(a: DuplicateCandidate, b: DuplicateCandidate, cfg: DuplicateConfig): boolean {
  if (cfg.maxSecondsApart == null || !a.createdAt || !b.createdAt) return true;
  const dt = Math.abs(Date.parse(a.createdAt) - Date.parse(b.createdAt)) / 1000;
  return !Number.isFinite(dt) || dt <= cfg.maxSecondsApart;
}

function near(a: DuplicateCandidate, b: DuplicateCandidate, va: Float32Array | null, vb: Float32Array | null, cfg: DuplicateConfig): boolean {
  if (!va || !vb) return false;
  // Cheap checks first; the signature distance is the expensive part.
  if (colorDistance(a.meanRgb, b.meanRgb) > cfg.maxColorDistance) return false;
  if (!withinTime(a, b, cfg)) return false;
  return vectorDistance(va, vb, cfg.signatureThreshold) <= cfg.signatureThreshold;
}

/** Two photos are near-duplicates only if structure, color AND (when known) time all agree. */
export function areNearDuplicates(a: DuplicateCandidate, b: DuplicateCandidate, cfg: DuplicateConfig = DEFAULT_CONFIG): boolean {
  return near(a, b, signatureVector(a.hash), signatureVector(b.hash), cfg);
}

/**
 * Groups near-duplicate photos with union-find. Singletons are not returned as groups.
 * Original files are never compared byte-wise or deleted.
 */
export function groupDuplicates(items: DuplicateCandidate[], cfg: DuplicateConfig = DEFAULT_CONFIG): DuplicateGroup[] {
  const parent = items.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const vectors = items.map((it) => signatureVector(it.hash));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (near(items[i], items[j], vectors[i], vectors[j], cfg)) {
        const ri = find(i);
        const rj = find(j);
        if (ri !== rj) parent[rj] = ri;
      }
    }
  }
  const buckets = new Map<number, number[]>();
  items.forEach((_, i) => {
    const r = find(i);
    const list = buckets.get(r) ?? [];
    list.push(i);
    buckets.set(r, list);
  });
  const groups: DuplicateGroup[] = [];
  for (const members of buckets.values()) {
    if (members.length < 2) continue;
    const ids = members.map((i) => items[i].id);
    const best = members.reduce((b, i) => (items[i].quality > items[b].quality ? i : b), members[0]);
    groups.push({ id: `g_${items[members[0]].id}`, memberIds: ids, representativeId: items[best].id });
  }
  return groups;
}

import { STYLE_PRESETS, type StylePreset } from './presets';

export const DEFAULT_PRESET_ID = 'natural-daily';

/** Presets not reviewed within this many days are flagged as stale in the UI. */
export const PRESET_REVIEW_INTERVAL_DAYS = 120;

export function activePresets(): StylePreset[] {
  return STYLE_PRESETS.filter((p) => p.status !== 'retired');
}

export function getPreset(id: string | null | undefined): StylePreset {
  return STYLE_PRESETS.find((p) => p.id === id && p.status !== 'retired') ?? STYLE_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID)!;
}

export function isPresetStale(p: StylePreset, now = new Date()): boolean {
  const reviewed = Date.parse(p.lastReviewedAt);
  if (!Number.isFinite(reviewed)) return true;
  return (now.getTime() - reviewed) / 86_400_000 > PRESET_REVIEW_INTERVAL_DAYS;
}

/** Mood preset suggested to people who picked "감성 프리셋" for contexts without a mood preset of their own. */
export const MOOD_PRESET_ID = 'calm-film';

/**
 * Default preset for a new project. The retouch pick from onboarding steers it:
 * 무보정 → the natural preset, 감성 프리셋 → a mood preset where the context would be natural anyway.
 */
export function suggestPresetForContext(context: string, retouch?: 'none' | 'light' | 'preset' | null): string {
  if (retouch === 'none') return DEFAULT_PRESET_ID;
  const byContext = activePresets().find((p) => p.relatedContexts.includes(context))?.id ?? DEFAULT_PRESET_ID;
  if (retouch === 'preset' && byContext === DEFAULT_PRESET_ID && getPreset(MOOD_PRESET_ID).id === MOOD_PRESET_ID) return MOOD_PRESET_ID;
  return byContext;
}

export interface PresetValidationIssue {
  presetId: string;
  issue: string;
}

/** Structural validation used by tests (and runnable as a script via jest). */
export function validatePresets(presets: StylePreset[] = STYLE_PRESETS): PresetValidationIssue[] {
  const issues: PresetValidationIssue[] = [];
  const ids = new Set<string>();
  for (const p of presets) {
    if (ids.has(p.id)) issues.push({ presetId: p.id, issue: 'duplicate id' });
    ids.add(p.id);
    if (!p.name || !p.description) issues.push({ presetId: p.id, issue: 'missing name/description' });
    if (!Number.isFinite(Date.parse(p.lastReviewedAt))) issues.push({ presetId: p.id, issue: 'invalid lastReviewedAt' });
    const a = p.adjust;
    if (a.qualityWeight < 0.5 || a.qualityWeight > 1.5) issues.push({ presetId: p.id, issue: 'qualityWeight out of range' });
    if (a.exposureWeight < 0 || a.exposureWeight > 1.5) issues.push({ presetId: p.id, issue: 'exposureWeight out of range' });
    if (a.targetLuma != null && (a.targetLuma < 0 || a.targetLuma > 255)) issues.push({ presetId: p.id, issue: 'targetLuma out of range' });
    if (a.targetWarmth != null && Math.abs(a.targetWarmth) > 1) issues.push({ presetId: p.id, issue: 'targetWarmth out of range' });
    if (p.status === 'curated' && p.sources.length === 0) issues.push({ presetId: p.id, issue: 'curated preset requires sources' });
    for (const s of p.sources) {
      if (!/^https:\/\//.test(s.url) || !Number.isFinite(Date.parse(s.checkedAt))) issues.push({ presetId: p.id, issue: 'invalid source' });
    }
    if (p.sources.length === 0 && p.confidence !== 'hypothesis') issues.push({ presetId: p.id, issue: 'unsourced preset must be marked hypothesis' });
  }
  return issues;
}

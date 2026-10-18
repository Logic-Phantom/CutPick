import type { PhotoAsset, RecommendationReason } from '@/domain/models';
import type { AspectOption } from '@/features/platforms/platform-profiles';
import { SCENE_LABELS } from '@/features/project-library/contexts';
import { EMPTY_TASTE, STYLE_TAG_META, colorMatch, matchedColorTags, type TasteProfile } from '@/features/preferences/taste-profile';
import type { StylePreset } from '@/features/style-presets/presets';

import type { SelectionInfo } from './diversity-selector';
import type { ScoreBreakdown } from './scoring';

/** Most distinctive reason for a compact tile label (generic quality reasons come last). */
const LABEL_PRIORITY = ['crop-loss', 'dup-fallback', 'group-rep', 'taste-match', 'taste-scene', 'taste-orientation', 'learned', 'diverse', 'crop-fit', 'preset-match', 'scene-mix', 'orientation-mix', 'soft', 'highlight-clip', 'shadow-clip', 'sharp-exposed', 'sharp', 'preset-tolerant', 'not-analyzed'];

const MATCH_THRESHOLD = 0.75;

export function primaryReason(reasons: RecommendationReason[]): RecommendationReason | undefined {
  for (const code of LABEL_PRIORITY) {
    const r = reasons.find((x) => x.code === code);
    if (r) return r;
  }
  return reasons.find((r) => r.code !== 'pinned' && r.code !== 'cover') ?? reasons[0];
}

/**
 * Builds human-readable reasons ONLY from signals that were actually computed.
 * Never mentions faces, eyes, expression or aesthetics (not analyzed).
 */
export function explain(
  photo: PhotoAsset,
  score: ScoreBreakdown,
  sel: SelectionInfo | null,
  aspect: AspectOption,
  preset: StylePreset,
  isCover: boolean,
  taste: TasteProfile = EMPTY_TASTE,
): RecommendationReason[] {
  const r: RecommendationReason[] = [];
  const m = photo.qualityMetrics;

  if (sel?.pinned) r.push({ code: 'pinned', text: '직접 고정한 사진이에요', tone: 'info' });
  if (isCover) r.push({ code: 'cover', text: '점수가 가장 높아 첫 장(대표)으로 배치했어요', tone: 'positive' });

  if (!m) {
    r.push({ code: 'not-analyzed', text: '아직 분석되지 않은 사진이에요', tone: 'caution' });
    return r;
  }

  if (m.sharpnessScore >= 0.6 && m.exposureScore >= 0.6) r.push({ code: 'sharp-exposed', text: '선명하고 노출이 안정적이에요', tone: 'positive' });
  else if (m.sharpnessScore >= 0.6) r.push({ code: 'sharp', text: '흔들림이 적고 선명해요', tone: 'positive' });
  else if (m.sharpnessScore < 0.25) r.push({ code: 'soft', text: '축소본 기준으로 흐리거나 흔들려 보여요', tone: 'caution' });

  if (m.highlightClipRatio > 0.08 && preset.adjust.exposureWeight >= 0.8) r.push({ code: 'highlight-clip', text: '밝은 영역이 일부 하얗게 날아갔어요', tone: 'caution' });
  if (m.shadowClipRatio > 0.15 && preset.adjust.exposureWeight >= 0.8) r.push({ code: 'shadow-clip', text: '어두운 영역이 많아요', tone: 'caution' });
  if ((m.highlightClipRatio > 0.08 || m.shadowClipRatio > 0.15) && preset.adjust.exposureWeight < 0.8) {
    r.push({ code: 'preset-tolerant', text: `'${preset.name}' 프리셋이라 노출 편차를 크게 감점하지 않았어요`, tone: 'info' });
  }

  // Name the user's taste only when the photo matches the user's own targets (not just the preset),
  // and only the specific picked styles it individually matches.
  const userMatch = colorMatch(m, taste.colorTargets);
  const named = userMatch != null && userMatch >= MATCH_THRESHOLD ? matchedColorTags(m, taste).slice(0, 2) : [];
  if (named.length) {
    r.push({ code: 'taste-match', text: `고른 ${named.map((t) => STYLE_TAG_META[t].label).join('·')} 스타일과 밝기·색감이 가까워요`, tone: 'positive' });
  } else if (userMatch != null && userMatch >= MATCH_THRESHOLD) {
    r.push({ code: 'taste-match', text: '밝기·색감이 고른 색감 취향에 가까워요', tone: 'positive' });
  } else if (userMatch == null && score.preferenceMatch != null && score.preferenceMatch >= MATCH_THRESHOLD) {
    r.push({ code: 'preset-match', text: `밝기·색감이 '${preset.name}' 프리셋 기준에 가까워요`, tone: 'positive' });
  }
  if (score.tasteScene && taste.sceneSource[score.tasteScene]) {
    const tag = taste.sceneSource[score.tasteScene]!;
    r.push({ code: 'taste-scene', text: `직접 붙인 '${SCENE_LABELS[score.tasteScene]}' 태그가 고른 '${STYLE_TAG_META[tag].label}' 취향과 맞아요`, tone: 'positive' });
  }
  if (score.tasteOrientation && taste.orientationSource) {
    const kind = taste.orientation === 'landscape' ? '가로' : '세로';
    r.push({ code: 'taste-orientation', text: `고른 '${STYLE_TAG_META[taste.orientationSource].label}' 취향에 맞는 ${kind} 사진이에요`, tone: 'info' });
  }
  if (score.learned > 0.05) r.push({ code: 'learned', text: '이전에 유지한 사진들과 색·밝기 경향이 비슷해요', tone: 'positive' });

  if (aspect.ratio != null) {
    if (score.cropRetention >= 0.9) r.push({ code: 'crop-fit', text: `${aspect.label} 크롭에 거의 손실 없이 맞아요`, tone: 'positive' });
    else if (score.cropRetention < 0.6) r.push({ code: 'crop-loss', text: `${aspect.label}로 자르면 화면의 ${Math.round((1 - score.cropRetention) * 100)}%가 잘려요`, tone: 'caution' });
  }

  if (score.isGroupRepresentative) r.push({ code: 'group-rep', text: '비슷한 연속 사진 중 대표 후보예요', tone: 'positive' });
  if (sel?.duplicateFallback) r.push({ code: 'dup-fallback', text: '다른 후보가 부족해 비슷한 사진 그룹에서 추가했어요', tone: 'caution' });
  if (sel && !sel.pinned && sel.similarityToPrevious < 0.2 && !isCover) r.push({ code: 'diverse', text: '앞선 사진과 구도·색이 달라 묶음의 다양성을 높여요', tone: 'positive' });
  if (sel?.addedNewOrientation) r.push({ code: 'orientation-mix', text: '가로·세로 구성을 섞어 줘요', tone: 'info' });
  if (sel?.addedNewScene) r.push({ code: 'scene-mix', text: '직접 붙인 장면 태그가 새로 추가돼요', tone: 'info' });

  return r;
}

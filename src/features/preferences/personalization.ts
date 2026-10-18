import type { LearnedWeights, PhotoAsset, PreferenceEvent, PreferenceEventType } from '@/domain/models';
import { PERSONALIZATION } from '@/domain/recommendation-policy';
import { personalFeatures } from '@/features/recommendations/scoring';

export function emptyLearnedWeights(now = new Date()): LearnedWeights {
  return { brightness: 0, colorfulness: 0, warmth: 0, contrast: 0, portraitOrientation: 0, eventCount: 0, updatedAt: now.toISOString() };
}

/** Strength of each explicit action. Reorders are weak; a single tap is never treated as certain. */
const EVENT_SIGN: Record<PreferenceEventType, number> = {
  keep: 1,
  pin: 1,
  exclude: -1,
  reorder: 0.3,
  'preset-like': 0,
};

export function featureSnapshot(photo: PhotoAsset): PreferenceEvent['features'] {
  const m = photo.qualityMetrics;
  if (!m) return null;
  return { meanLuma: m.meanLuma, colorfulness: m.colorfulness, warmth: m.warmth, contrast: m.contrastScore, orientation: photo.orientation };
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

/**
 * Online update: move each weight toward the feature direction of kept photos and away
 * from excluded ones. Bounded learning rate keeps single actions from dominating.
 */
export function applyEvent(w: LearnedWeights, event: PreferenceEvent): LearnedWeights {
  const sign = EVENT_SIGN[event.type];
  if (!event.features || sign === 0) return w;
  const f = personalFeatures(
    {
      meanLuma: event.features.meanLuma,
      colorfulness: event.features.colorfulness,
      warmth: event.features.warmth,
      contrastScore: event.features.contrast,
    },
    event.features.orientation,
  );
  const lr = PERSONALIZATION.learningRate * sign;
  return {
    brightness: clamp(w.brightness + lr * f.brightness),
    colorfulness: clamp(w.colorfulness + lr * f.colorfulness),
    warmth: clamp(w.warmth + lr * f.warmth),
    contrast: clamp(w.contrast + lr * f.contrast),
    portraitOrientation: clamp(w.portraitOrientation + lr * f.portraitOrientation),
    eventCount: w.eventCount + 1,
    updatedAt: event.createdAt,
  };
}

export function recomputeWeights(events: PreferenceEvent[]): LearnedWeights {
  return events.reduce(applyEvent, emptyLearnedWeights());
}

/** Human-readable summary of what has been learned (shown in Settings). */
export function describeLearned(w: LearnedWeights): string[] {
  if (w.eventCount === 0) return ['아직 학습된 취향이 없어요. 추천 결과에서 유지·제외·고정하면 조금씩 반영돼요.'];
  const out: string[] = [];
  const say = (v: number, pos: string, neg: string) => {
    if (v > 0.08) out.push(pos);
    else if (v < -0.08) out.push(neg);
  };
  say(w.brightness, '밝은 사진을 더 자주 유지했어요', '어두운 톤의 사진을 더 자주 유지했어요');
  say(w.colorfulness, '색이 선명한 사진을 선호하는 경향', '채도가 낮은 사진을 선호하는 경향');
  say(w.warmth, '따뜻한 색감 선호 경향', '차가운 색감 선호 경향');
  say(w.contrast, '대비가 강한 사진 선호 경향', '대비가 부드러운 사진 선호 경향');
  say(w.portraitOrientation, '세로 사진 선호 경향', '가로 사진 선호 경향');
  if (!out.length) out.push('아직 뚜렷한 경향은 없어요.');
  out.push(`반영된 행동 ${w.eventCount}건 (최대 ${PERSONALIZATION.maxEvents}건 보관)`);
  return out;
}

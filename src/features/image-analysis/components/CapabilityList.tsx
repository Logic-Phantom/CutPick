import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { AppText, spacing, useColors } from '@/design-system';

import type { AnalysisCapabilities, CapabilityStatus } from '../contracts';

const LABELS: { key: keyof Omit<AnalysisCapabilities, 'providerId'>; label: string }[] = [
  { key: 'sharpness', label: '흐림·흔들림' },
  { key: 'exposure', label: '노출' },
  { key: 'contrast', label: '대비' },
  { key: 'resolution', label: '해상도·비율' },
  { key: 'color', label: '밝기·채도·색온도 통계' },
  { key: 'duplicates', label: '비슷한 사진 묶기' },
  { key: 'sceneClassification', label: '장면 분류' },
  { key: 'faceDetection', label: '얼굴 감지' },
  { key: 'eyesClosed', label: '눈 감김' },
  { key: 'expression', label: '표정' },
  { key: 'aesthetics', label: '미적 점수' },
];

const STATUS_TEXT: Record<CapabilityStatus, string> = {
  supported: '분석함',
  manual: '직접 태그',
  unsupported: '미지원',
};

/** Transparent list of what is and is not analyzed. */
export function CapabilityList({ caps }: { caps: AnalysisCapabilities }) {
  const c = useColors();
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="bodyStrong">분석 범위</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xxs }}>
        {LABELS.map(({ key, label }) => {
          const s = caps[key];
          const icon = s === 'supported' ? 'checkmark-circle' : s === 'manual' ? 'pricetag-outline' : 'remove-circle-outline';
          const color = s === 'supported' ? c.success : c.textTertiary;
          return (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: '45%' }} accessible accessibilityLabel={`${label}: ${STATUS_TEXT[s]}`}>
              <Ionicons name={icon} size={16} color={color} />
              <AppText variant="secondary" tone={s === 'supported' ? 'primary' : 'tertiary'}>
                {label} · {STATUS_TEXT[s]}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

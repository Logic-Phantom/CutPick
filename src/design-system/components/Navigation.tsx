import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '../theme';
import { spacing, touchTarget } from '../tokens';
import { AppText } from './AppText';
import { GhostButton, IconButton, type IconName } from './Buttons';

/**
 * Wizard header: back (only when there is a previous step), title + "n / total", optional skip
 * link, and a thin progress bar. The progress bar reports real step counts only.
 */
export function StepHeader({ title, step, total, onBack, onSkip, skipLabel = '건너뛰기', skipTestID }: {
  title: string;
  step: number;
  total: number;
  onBack?: () => void;
  onSkip?: () => void;
  skipLabel?: string;
  skipTestID?: string;
}) {
  const c = useColors();
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={styles.headRow}>
        <View style={styles.side}>{onBack ? <IconButton icon="chevron-back" label="이전 단계" onPress={onBack} testID="step-back" /> : null}</View>
        <View style={styles.center} accessible accessibilityLabel={`${title}, ${total}단계 중 ${step}단계`}>
          <AppText variant="label" numberOfLines={1}>{title}</AppText>
          <AppText variant="caption" tone="tertiary">{step} / {total}</AppText>
        </View>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          {onSkip ? <GhostButton compact label={skipLabel} onPress={onSkip} testID={skipTestID} style={{ paddingHorizontal: spacing.xs }} /> : null}
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: c.surfaceSunken }]} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }}>
        <View style={{ width: `${(step / total) * 100}%`, height: '100%', borderRadius: 2, backgroundColor: c.point }} />
      </View>
    </View>
  );
}

/** Tappable settings/list row with a leading icon, optional trailing value, and chevron. */
export function ListRow({ icon, label, value, onPress, role = 'link', tone = 'default', testID }: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  role?: 'link' | 'button';
  tone?: 'default' | 'danger';
  testID?: string;
}) {
  const c = useColors();
  const fg = tone === 'danger' ? c.error : c.textPrimary;
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole={role} accessibilityLabel={value ? `${label}, ${value}` : label} style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surfaceSunken }]}>
      <Ionicons name={icon} size={20} color={tone === 'danger' ? c.error : c.textPrimary} />
      <AppText variant="body" style={{ flex: 1, color: fg }}>{label}</AppText>
      {value ? <AppText variant="secondary" tone="tertiary" numberOfLines={1}>{value}</AppText> : null}
      <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
    </Pressable>
  );
}

/** "1 2 3" flow indicator for the recommendation flow (사진 고르기 → 분석 → 추천 결과). */
export function StepDots({ step, total = 3, labels }: { step: number; total?: number; labels?: string[] }) {
  const c = useColors();
  return (
    <View style={styles.dots} accessible accessibilityRole="text" accessibilityLabel={`${total}단계 중 ${step}단계${labels?.[step - 1] ? `, ${labels[step - 1]}` : ''}`}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const active = n === step;
        return (
          <View key={n} style={styles.dotWrap}>
            {i > 0 ? <View style={[styles.dotLine, { backgroundColor: n <= step ? c.point : c.border }]} /> : null}
            <View style={[styles.dot, { backgroundColor: active ? c.point : n < step ? c.pointSoft : c.surfaceSunken }]}>
              <AppText variant="caption" style={{ color: active ? c.onPoint : n < step ? c.pointText : c.textTertiary, fontWeight: '700' }}>{n}</AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Underlined text tabs (profile sections). Selection = bold text + coral underline + state. */
export function SegmentTabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  const c = useColors();
  return (
    <View style={[styles.segments, { borderBottomColor: c.border }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.id === value;
        return (
          <Pressable key={t.id} onPress={() => onChange(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={styles.segment}>
            <AppText variant="label" style={{ color: on ? c.textPrimary : c.textTertiary, fontWeight: on ? '700' : '500' }}>{t.label}</AppText>
            <View style={[styles.segmentBar, { backgroundColor: on ? c.point : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Hairline divider between rows inside a Card. */
export function Divider({ inset = 0 }: { inset?: number }) {
  const c = useColors();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: inset }} />;
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', minHeight: touchTarget },
  side: { width: 88, justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  track: { height: 3, borderRadius: 2, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget + 8, paddingHorizontal: spacing.md },
  dots: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xxs },
  dotWrap: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dotLine: { width: 10, height: 2, borderRadius: 1, marginHorizontal: 3 },
  segments: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  segment: { flex: 1, alignItems: 'center', paddingTop: spacing.sm, gap: spacing.xs, minHeight: touchTarget },
  segmentBar: { height: 2, alignSelf: 'stretch', marginHorizontal: spacing.xs, borderRadius: 1 },
});

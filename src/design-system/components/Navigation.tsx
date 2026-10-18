import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient colors={c.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${(step / total) * 100}%`, height: '100%', borderRadius: 2 }} />
      </View>
    </View>
  );
}

/** Tappable settings/list row with a leading icon, optional trailing value, and chevron. */
export function ListRow({ icon, label, value, onPress, role = 'link', testID }: {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  role?: 'link' | 'button';
  testID?: string;
}) {
  const c = useColors();
  return (
    <Pressable testID={testID} onPress={onPress} accessibilityRole={role} accessibilityLabel={value ? `${label}, ${value}` : label} style={({ pressed }) => [styles.row, pressed && { backgroundColor: c.surfaceSunken }]}>
      <Ionicons name={icon} size={20} color={c.textSecondary} />
      <AppText variant="body" style={{ flex: 1 }}>{label}</AppText>
      {value ? <AppText variant="secondary" tone="tertiary" numberOfLines={1}>{value}</AppText> : null}
      <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
    </Pressable>
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
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: touchTarget + 8, paddingHorizontal: spacing.md },
});

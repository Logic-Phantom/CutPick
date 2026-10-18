import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';

import { AppText, radius, spacing, tapFeedback, touchTarget, useColors } from '@/design-system';

/** Heart = empathy with the photo/style. Count only; never a score of a person. */
export function HeartButton({ liked, count, onPress, disabled }: { liked: boolean; count: number; onPress: () => void; disabled?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={liked ? `공감 취소, 공감 ${count}개` : `공감하기, 공감 ${count}개`}
      accessibilityState={{ selected: liked, disabled: !!disabled }}
      style={({ pressed }) => [styles.btn, { borderColor: liked ? c.heart : c.borderStrong, backgroundColor: pressed ? c.surfaceSunken : c.surface, opacity: disabled ? 0.5 : 1 }]}>
      <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? c.heart : c.textPrimary} />
      <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>{count}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: touchTarget, minWidth: touchTarget, paddingHorizontal: spacing.sm, borderRadius: radius.chip, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
});

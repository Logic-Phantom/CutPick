import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useColors } from '../theme';
import { fonts, spacing } from '../tokens';
import { AppText } from './AppText';

export const BRAND_NAME = 'CutPick';

const LOGO = require('@/assets/images/logo.png');

export const BRAND_TAGLINE = '좋은 사진은, 함께 볼 때 더 빛나니까';

/** "CutPick" wordmark in a single ink color — the photos bring the color, not the logo. */
export function BrandWordmark({ size = 28, color, style }: { size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return (
    <Text
      accessibilityLabel={BRAND_NAME}
      accessibilityRole="header"
      maxFontSizeMultiplier={1.4}
      style={[{ fontFamily: fonts.brand, fontSize: size, lineHeight: Math.round(size * 1.2), letterSpacing: -size * 0.03, color: color ?? c.textPrimary }, style]}>
      {BRAND_NAME}
    </Text>
  );
}

/** The app icon (launch screen only; in-app headers use the wordmark alone). */
export function BrandMark({ size = 36 }: { size?: number }) {
  return <Image source={LOGO} style={{ width: size, height: size }} contentFit="contain" accessibilityIgnoresInvertColors accessible={false} />;
}

/** Header brand: the wordmark. Kept as a component so headers stay consistent. */
export function BrandLockup({ size = 28, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <BrandWordmark size={size} style={style as StyleProp<TextStyle>} />;
}

/** Tab-screen brand header: coral sparkle + wordmark, with the tagline underneath. */
export function BrandHeader({ size = 26, tagline = BRAND_TAGLINE, style }: { size?: number; tagline?: string | null; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }, style]}>
      <Ionicons name="sparkles" size={Math.round(size * 0.95)} color={c.point} accessible={false} />
      <View style={{ flexShrink: 1 }}>
        <BrandWordmark size={size} />
        {tagline ? <AppText variant="caption" tone="tertiary" numberOfLines={1}>{tagline}</AppText> : null}
      </View>
    </View>
  );
}

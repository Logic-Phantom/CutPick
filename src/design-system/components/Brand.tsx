import { Image } from 'expo-image';
import { Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { useColors } from '../theme';
import { fonts } from '../tokens';

export const BRAND_NAME = 'CutPick';

const LOGO = require('@/assets/images/logo.png');

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

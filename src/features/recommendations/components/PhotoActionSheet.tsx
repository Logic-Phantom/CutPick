import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import type { PhotoAsset, RecommendationReason } from '@/domain/models';
import { AppText, BottomSheet, PhotoThumbnail, Row, SecondaryButton, PrimaryButton, DangerButton, radius, spacing, useColors } from '@/design-system';

export interface PhotoActionSheetProps {
  photo: PhotoAsset | null;
  /** Position in the selection (0-based) or -1 if not selected. */
  position: number;
  selectedTotal: number;
  single: boolean;
  pinned: boolean;
  excluded: boolean;
  reasons: RecommendationReason[];
  groupMembers: PhotoAsset[];
  groupRepresentativeId: string | null;
  onClose: () => void;
  onTogglePin: () => void;
  onExclude: () => void;
  onRestore: () => void;
  onAdd: () => void;
  onMove: (delta: number) => void;
  onMakeCover: () => void;
  onChooseSingle: () => void;
  onSetRepresentative: (photoId: string) => void;
  onOpenDetail: () => void;
}

const TONE_ICON = { positive: 'add-circle', info: 'information-circle', caution: 'alert-circle' } as const;

export function PhotoActionSheet(p: PhotoActionSheetProps) {
  const c = useColors();
  if (!p.photo) return null;
  const inSet = p.position >= 0;
  const toneColor = { positive: c.success, info: c.accent, caution: c.warning };
  return (
    <BottomSheet visible={!!p.photo} title={inSet ? (p.single ? '선택한 사진' : `${p.position + 1}번째 사진`) : p.excluded ? '제외한 사진' : '후보 사진'} onClose={p.onClose}>
      <View style={[styles.preview, { backgroundColor: c.photoPlaceholder }]}>
        {p.photo.thumbnailUri ? <Image source={{ uri: p.photo.thumbnailUri }} style={StyleSheet.absoluteFill} contentFit="contain" /> : null}
      </View>

      {p.reasons.length ? (
        <View style={{ gap: spacing.xxs }} accessible accessibilityLabel={`추천 이유: ${p.reasons.map((r) => r.text).join(', ')}`}>
          <AppText variant="bodyStrong">추천 이유</AppText>
          {p.reasons.map((r) => (
            <Row key={r.code} gap={spacing.xxs}>
              <Ionicons name={TONE_ICON[r.tone]} size={16} color={toneColor[r.tone]} />
              <AppText variant="secondary" style={{ flex: 1 }}>{r.text}</AppText>
            </Row>
          ))}
          <AppText variant="caption" tone="tertiary">점수는 기술적 신호와 선택한 취향을 조합한 참고값이에요. 객관적인 미적 평가가 아니에요.</AppText>
        </View>
      ) : null}

      {p.excluded ? (
        <PrimaryButton label="추천 후보로 되돌리기" icon="arrow-undo" onPress={p.onRestore} />
      ) : p.single ? (
        <View style={{ gap: spacing.xs }}>
          {p.position !== 0 ? <PrimaryButton label="이 사진으로 선택" icon="checkmark" onPress={p.onChooseSingle} /> : null}
          <SecondaryButton label="추천에서 제외" icon="eye-off-outline" onPress={p.onExclude} />
        </View>
      ) : inSet ? (
        <View style={{ gap: spacing.xs }}>
          <Row gap={spacing.xs}>
            <SecondaryButton label="앞으로" icon="arrow-back" onPress={() => p.onMove(-1)} disabled={p.position === 0} compact style={{ flex: 1 }} />
            <SecondaryButton label="뒤로" icon="arrow-forward" onPress={() => p.onMove(1)} disabled={p.position >= p.selectedTotal - 1} compact style={{ flex: 1 }} />
          </Row>
          <Row gap={spacing.xs}>
            <SecondaryButton label="첫 장으로" icon="star-outline" onPress={p.onMakeCover} disabled={p.position === 0} compact style={{ flex: 1 }} />
            <SecondaryButton label={p.pinned ? '고정 해제' : '고정'} icon={p.pinned ? 'pin' : 'pin-outline'} onPress={p.onTogglePin} compact style={{ flex: 1 }} />
          </Row>
          <DangerButton label="이 묶음에서 빼기 (원본은 그대로)" icon="remove-circle-outline" onPress={p.onExclude} compact />
        </View>
      ) : (
        <View style={{ gap: spacing.xs }}>
          <PrimaryButton label="묶음에 추가" icon="add" onPress={p.onAdd} />
          <SecondaryButton label="추천에서 제외" icon="eye-off-outline" onPress={p.onExclude} compact />
        </View>
      )}

      {p.groupMembers.length > 1 ? (
        <View style={{ gap: spacing.xs }}>
          <AppText variant="bodyStrong">비슷한 사진 {p.groupMembers.length}장</AppText>
          <AppText variant="secondary" tone="secondary">이 그룹에서 대표로 쓸 사진을 고를 수 있어요.</AppText>
          <Row wrap gap={spacing.xs}>
            {p.groupMembers.map((m, i) => (
              <PhotoThumbnail
                key={m.id}
                uri={m.thumbnailUri}
                size={72}
                selected={m.id === p.groupRepresentativeId}
                topLeft={m.id === p.groupRepresentativeId ? { kind: 'check' } : null}
                accessibilityLabel={`비슷한 사진 ${i + 1}${m.id === p.groupRepresentativeId ? ', 현재 대표' : ''}. 대표로 지정`}
                onPress={() => p.onSetRepresentative(m.id)}
              />
            ))}
          </Row>
        </View>
      ) : null}

      <SecondaryButton label="크게 보기·상세 정보" icon="expand-outline" onPress={p.onOpenDetail} compact />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', aspectRatio: 1.2, borderRadius: radius.photo, overflow: 'hidden' },
});

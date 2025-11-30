import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STEPS = [
  {
    id: '1',
    stepNumber: 1,
    title: '준비 — 부드러운 칫솔 & 불소 치약',
    img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762177575/Screenshot_2025-11-03_at_10.44.47_PM_u4wfrn.png',
    desc: '칫솔은 연필 잡듯 가볍게 쥐고, 부드러운모(Soft)를 사용하세요. 불소 치약은 콩알만큼만!',
    tip: '힘으로 닦지 말고, 부드럽게 밀착시키는 게 포인트입니다.',
  },
  {
    id: '2',
    stepNumber: 2,
    title: '각도 — 잇몸과 치아 경계에 45°',
    img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762177606/45%EB%8F%84_lbhunb.jpg',
    desc: '칫솔모를 잇몸선에 살짝 파묻히듯 기울이고, 미세하게 진동을 주세요.',
    tip: '잇몸선(경계부)은 플라그가 가장 잘 쌓이는 부위예요.',
  },
  {
    id: '3',
    stepNumber: 3,
    title: '동작 — 짧은 진동 + 쓸어올리기',
    img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762180466/%EB%8F%99%EC%9E%91_jtkwoz.jpg',
    desc: '치아 하나당 10회 이상, 미세진동을 주면서 잇몸 쪽으로 쓸어 올리세요.',
  },
  {
    id: '4',
    stepNumber: 4,
    title: '안쪽 — 앞니는 세로로',
    img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762177598/%EC%95%9E%EB%8B%88_api3hv.webp',
    desc: '앞니 안쪽은 칫솔 끝부분을 세워서 세로로 닦아야 합니다.',
  },
  {
    id: '5',
    stepNumber: 5,
    title: '마무리 — 혀, 잇몸, 씹는면',
    img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762177588/Screenshot_2025-11-03_at_10.45.53_PM_zswpuc.png',
    desc: '혀 표면과 씹는 면까지 부드럽게 닦고, 물로 살짝만 헹구세요.',
    tip: '불소 효과를 위해 강한 가글은 피하세요.',
  },
];

export default function BrushingGuideScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {STEPS.map(s => (
        <View key={s.id} style={styles.card}>
          <Image source={{ uri: s.img }} style={styles.img} />
          <View style={styles.titleRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{s.stepNumber}</Text>
            </View>
            <Text style={styles.title}>{s.title}</Text>
          </View>
          <Text style={styles.desc}>{s.desc}</Text>
          {s.tip && (
            <View style={styles.tipBox}>
              <Icon name="info" size={16} color="#1E40AF" />
              <Text style={styles.tip}>{s.tip}</Text>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#EFF6FF' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  img: { width: '100%', height: 180, borderRadius: 12, marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumber: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
  desc: { color: '#374151', fontSize: 14, lineHeight: 22 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  tip: { fontSize: 13, color: '#1E40AF', fontWeight: '600' },
});

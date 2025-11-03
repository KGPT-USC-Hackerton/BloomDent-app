import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HygieneProductsScreen() {
  const DATA = [
    {
      title: '🧵 치실',
      desc: '치아 사이의 플라그 제거에 필수. C자 형태로 감싸 문지르세요.',
      tip: '하루 1회, 취침 전 권장.',
    },
    {
      title: '🪥 치간칫솔',
      desc: '칫솔이 닿지 않는 틈새를 청소합니다.',
      tip: '틈 크기에 맞는 굵기 선택!',
    },
    {
      title: '🧴 가글',
      desc: '입안을 살균하고 구취를 완화하지만, 칫솔질 대체용은 아닙니다.',
      tip: '불소 성분 함유 제품 사용 시 효과적.',
    },
    {
      title: '⚡ 전동칫솔 / 워터픽',
      desc: '손기술 부족 보완, 교정 중에도 유용.',
      tip: '과한 압력은 피하고 “민감 모드” 사용.',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {DATA.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
          <Text style={styles.tip}>💡 {item.tip}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F8FAFC' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  desc: { fontSize: 14, color: '#374151', lineHeight: 22 },
  tip: { fontSize: 13, color: '#1E3A8A', marginTop: 6, fontWeight: '600' },
});

// src/screens/learn/HygieneProductsScreen.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 1) 마스터 목록 데이터: 각 용품 요약 + 상세 steps
const PRODUCTS = [
  {
    id: 'floss',
    title: '치실',
    icon: 'fiber-manual-record',
    // img 없음 (이미지 없이 카드/단계 모두 정상 표시)
    desc: '치아 사이 플라그 제거에 필수.',
    steps: [
      {
        id: '1',
        title: '1️⃣ 준비 — 길이와 감기',
        // img 없음
        desc: '약 30~40cm를 잘라 양손 가운데손가락에 감고, 3~5cm만 남기세요.',
        tip: '팽팽하게 유지하면 조작이 쉬워요.',
      },
      {
        id: '2',
        title: '2️⃣ 진입 — 치아 사이로 부드럽게',
        // img 없음
        desc: '치아 사이로 수직에 가깝게 천천히 넣고, 잇몸을 세게 찌르지 않도록 주의합니다.',
        tip: '“삐걱” 넣지 말고 톱질하듯 살짝 흔들며 진입.',
      },
      {
        id: '3',
        title: '3️⃣ 동작 — C자 문지르기',
        // img 없음
        desc: '치아 측면을 C자 형태로 감싸 위아래로 5~10회 문지릅니다. 양쪽 치아면 모두 진행.',
        tip: '잇몸 아래 살짝 들어가도록, 통증 없을 정도만.',
      },
      {
        id: '4',
        title: '4️⃣ 마무리 — 다음 칸으로 이동',
        // img 없음
        desc: '다음 치간으로 이동하며 깨끗한 부분을 사용하세요.',
        tip: '출혈이 잦다면 압력을 줄이고, 1주 이상 지속 시 치과 상담.',
      },
    ],
  },
  {
    id: 'interdental',
    title: '치간칫솔',
    icon: 'cleaning-services',
    img: 'https://images.unsplash.com/photo-1600423115367-5c7b3d5d7d3c?q=80&w=1080&auto=format&fit=crop',
    desc: '칫솔이 닿지 않는 넓은 치간에 유용.',
    steps: [
      {
        id: '1',
        title: '1️⃣ 준비 — 사이즈 선택',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762182549/Screenshot_2025-11-04_at_12.08.50_AM_puhhjv.png',
        desc: '틈새에 무리 없이 들어가는 굵기를 선택합니다.',
        tip: '너무 굵으면 잇몸 손상, 너무 얇으면 효과 ↓',
      },
      {
        id: '2',
        title: '2️⃣ 진입 — 잇몸과 평행',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762182425/Screenshot_2025-11-04_at_12.06.08_AM_uxk2pj.png',
        desc: '치아 사이를 잇몸과 평행하게 천천히 삽입합니다.',
        tip: '강제로 밀어넣지 않기.',
      },
      {
        id: '3',
        title: '3️⃣ 동작 — 앞뒤 왕복',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762182420/Screenshot_2025-11-04_at_12.06.45_AM_r2zujs.png',
        desc: '앞뒤로 3~5회 부드럽게 왕복해 플라그를 제거합니다.',
        tip: '한 칸에서 과도한 반복은 금물.',
      },
      {
        id: '4',
        title: '4️⃣ 세척 — 칫솔 살균/교체',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762182480/Screenshot_2025-11-04_at_12.07.43_AM_khohsd.png',
        desc: '사용 후 물로 세척하고 마른 장소에 보관합니다.',
        tip: '브러시가 휘면 교체.',
      },
    ],
  },
  {
    id: 'mouthwash',
    title: '가글(구강양치용액)',
    icon: 'local-drink',
    img: 'https://images.unsplash.com/photo-1623855244082-8b4d5b38f3a1?q=80&w=1080&auto=format&fit=crop',
    desc: '세균 억제·구취 완화에 도움.',
    steps: [
      {
        id: '1',
        title: '1️⃣ 준비 — 희석/용량 확인',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762184705/Screenshot_2025-11-04_at_12.43.05_AM_vos5u1.png',
        desc: '10~15ml의 가글을 준비합니다.',
        tip: '무알코올 제품을 선호 시 성분표 확인.',
      },
      {
        id: '2',
        title: '2️⃣ 가글 — 30초~1분',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762184696/Screenshot_2025-11-04_at_12.44.01_AM_v8rzjf.png',
        desc: '입 안 구석구석 돌리며 30초~1분 가글합니다.',
        tip: '삼키지 않도록 주의.',
      },
      {
        id: '3',
        title: '3️⃣ 뱉기 — 물로 과도한 헹굼 X',
        desc: '뱉은 뒤 물로 살짝만 헹구거나 생략합니다.',
        tip: '불소 잔류 효과를 위해 즉시 물가글은 최소화.',
      },
    ],
  },
  {
    id: 'electric-irrigator',
    title: '전동칫솔 / 워터픽',
    icon: 'battery-charging-full',
    img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=1080&auto=format&fit=crop',
    desc: '일관된 진동/분사로 플라그 제거 보조. 교정 중에도 유용.',
    steps: [
      {
        id: '1',
        title: '1️⃣ 전동칫솔 — 민감 모드',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762187260/Screenshot_2025-11-04_at_1.27.02_AM_e8qyoz.png',
        desc: '민감/소프트 모드로 잇몸선에 45° 기울여 각 치면 2~3초씩 머무르기.',
        tip: '힘주지 말고 헤드가 일하게.',
      },
      {
        id: '2',
        title: '2️⃣ 워터픽 — 수압 설정',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762185146/Gemini_Generated_Image_2bhpu82bhpu82bhp_svvgnq.png',
        desc: '낮은 수압에서 시작해 필요한 범위까지만 올립니다.',
        tip: '출혈 시 수압 낮추고 각도 조정.',
      },
      {
        id: '3',
        title: '3️⃣ 라인 따라 이동',
        img: 'https://res.cloudinary.com/dqutwk5xo/image/upload/v1762187305/Screenshot_2025-11-04_at_12.49.45_AM_lk6pid.png',
        desc: '잇몸선/교정 브라켓/브릿지 주변을 따라 천천히 이동합니다.',
        tip: '틈새는 각도를 바꿔 두 번 접근.',
      },
    ],
  },
  {
    id: 'tongue',
    title: '혀 클리너',
    icon: 'content-cut',
    img: 'https://images.unsplash.com/photo-1609840170477-7b9f7b7f6f6a?q=80&w=1080&auto=format&fit=crop',
    desc: '혀 표면 설태 제거로 구취 완화.',
    steps: [
      {
        id: '1',
        title: '1️⃣ 준비 — 위치 잡기',
        img: 'https://images.unsplash.com/photo-1609840170477-7b9f7b7f6f6a?q=80&w=1080&auto=format&fit=crop',
        desc: '혀를 내밀고 클리너를 뒤쪽에 가볍게 놓습니다.',
        tip: '구역감 있으면 살짝 덜 뒤쪽부터.',
      },
      {
        id: '2',
        title: '2️⃣ 긁기 — 뒤에서 앞으로',
        img: 'https://images.unsplash.com/photo-1609840170477-7b9f7b7f6f6a?q=80&w=1080&auto=format&fit=crop',
        desc: '부드럽게 2~3회 긁어 설태를 제거합니다.',
        tip: '세게 누르지 않기.',
      },
      {
        id: '3',
        title: '3️⃣ 세척 — 기구/입가심',
        img: 'https://images.unsplash.com/photo-1609840170477-7b9f7b7f6f6a?q=80&w=1080&auto=format&fit=crop',
        desc: '미온수로 씻고, 물로 가볍게 입가심합니다.',
        tip: '상처가 있으면 사용 간격 늘리기.',
      },
    ],
  },
];

// 2) 공통 카드 뷰
function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// 3) 디테일 헤더 (뒤로가기)
function DetailHeader({ title, icon, onBack }) {
  return (
    <View style={styles.detailHeader}>
      <Pressable onPress={onBack} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="뒤로가기">
        <Icon name="arrow-back" size={20} color="#0F172A" />
      </Pressable>
      <View style={styles.detailTitleContainer}>
        {icon && <Icon name={icon} size={20} color="#0F172A" style={styles.detailTitleIcon} />}
        <Text style={styles.detailTitle}>{title}</Text>
      </View>
      <View style={{ width: 24 }} />
    </View>
  );
}

// 4) 메인 컴포넌트: 목록 ↔ 디테일 전환
export default function HygieneProductsScreen() {
  const [selected, setSelected] = useState(null);
  const selectedProduct = useMemo(
    () => PRODUCTS.find(p => p.id === selected) || null,
    [selected]
  );

  // 목록 화면
  if (!selectedProduct) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {PRODUCTS.map(item => (
          <Pressable
            key={item.id}
            onPress={() => setSelected(item.id)}
            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <Card>
              {/* 첫 페이지(목록)에서는 이미지 표시하지 않음 */}
              <View style={styles.titleRow}>
                <Icon name={item.icon} size={20} color="#1E3A8A" style={styles.titleIcon} />
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.desc}>{item.desc}</Text>

              {item.tip && (
                <View style={styles.tipBox}>
                  <Icon name="info" size={16} color="#1E40AF" />
                  <Text style={styles.tip}>{item.tip}</Text>
                </View>
              )}

              <View style={styles.ctaRow}>
                <Text style={styles.ctaText}>사용 프로세스 보기</Text>
                <Icon name="chevron-right" size={20} color="#1E3A8A" />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  // 상세(단계) 화면
  return (
    <View style={{ flex: 1, backgroundColor: '#EFF6FF' }}>
      <DetailHeader title={selectedProduct.title} icon={selectedProduct.icon} onBack={() => setSelected(null)} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8 }}>
        {selectedProduct.steps.map(s => {
          const stepNumber = parseInt(s.id);
          const titleWithoutEmoji = s.title.replace(/^[0-9]️⃣\s*/, '');
          return (
            <Card key={s.id} style={{ marginBottom: 14 }}>
              {!!s.img && <Image source={{ uri: s.img }} style={styles.img} />}
              <View style={styles.titleRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{stepNumber}</Text>
                </View>
                <Text style={styles.title}>{titleWithoutEmoji}</Text>
              </View>
              <Text style={styles.desc}>{s.desc}</Text>
            {s.tip && (
              <View style={styles.tipBox}>
                <Icon name="info" size={16} color="#1E40AF" />
                <Text style={styles.tip}>{s.tip}</Text>
              </View>
            )}
          </Card>
          );
        })}
      </ScrollView>
    </View>
  );
} // ← ✅ 빠졌던 함수 닫는 중괄호 추가

// 5) 스타일
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
  titleIcon: { marginRight: 8 },
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

  ctaRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: { fontSize: 13, color: '#1E3A8A', fontWeight: '700' },

  detailHeader: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  detailTitleIcon: { marginRight: 8 },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
});

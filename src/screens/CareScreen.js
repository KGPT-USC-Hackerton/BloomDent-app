import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import SurveyComponent from '../components/SurveyComponent';
import PhotoAnalysisComponent from '../components/PhotoAnalysisComponent';
import OralCareRecordComponent from '../components/OralCareRecordComponent';

const tabs = [
  { id: 'survey', label: '설문조사' },
  { id: 'photo', label: '구강 사진 분석' },
  { id: 'records', label: '구강 관리 기록' },
];

export default function CareScreen() {
  const [activeTab, setActiveTab] = useState('survey');
  const openProductLink = useCallback((url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('링크 오류', '앱에서 해당 페이지를 열 수 없습니다.');
    });
  }, []);

  const handleSurveySubmit = (result) => {
    if (!result) {
      return;
    }
    const score = Math.max(0, Math.min(100, result.normalizedScore ?? 0));
    Alert.alert(
      '설문 결과',
      `오늘 당신의 구강 점수는 💯 중 ${score}점이에요.\n작은 습관 하나로 내일의 치아 건강을 바꿀 수 있어요.\n\n아래 구강용품을 추천드려요!`,
      [
        {
          text: '괜찮아요',
          style: 'destructive',
        },
        {
          text: '전동칫솔',
          onPress: () => openProductLink('https://www.coupang.com/vp/products/8486378493?itemId=24560295659'),
        },
        {
          text: '치실',
          onPress: () => openProductLink('https://www.coupang.com/vp/products/8645037348?itemId=25558036482&vendorItemId=84656604794&sourceType=srp_product_ads&clickEventId=06feba20-b8d4-11f0-8202-39e0024c8ace&korePlacement=15&koreSubPlacement=1&clickEventId=06feba20-b8d4-11f0-8202-39e0024c8ace&korePlacement=15&koreSubPlacement=1&traceId=mhjdca63'),
        },
        {
          text: '칫솔',
          onPress: () => openProductLink('https://hetras.co.kr/product/premium-scaling-toothbrush-21ea/219'),
        },
      ],
    );
  };

  const mockTimelineData = [
    {
      date: '2025-09-23',
      score: 82,
      status: 'good',
      note: '구강 상태 양호, 치석 약간 관찰'
    },
    {
      date: '2025-09-20',
      score: 78,
      status: 'warning',
      note: '잇몸 염증 초기 증상'
    },
    {
      date: '2025-09-17',
      score: 85,
      status: 'good',
      note: '전반적으로 건강한 상태'
    },
    {
      date: '2025-09-14',
      score: 80,
      status: 'good',
      note: '정기 관리 지속 필요'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <View key={tab.id} style={styles.tabItem}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id && styles.tabButtonTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {activeTab === 'survey' && (
          <View style={styles.section}>
            <SurveyComponent onSubmit={handleSurveySubmit} />
          </View>
        )}

        {activeTab === 'photo' && (
          <View style={styles.section}>
            <PhotoAnalysisComponent />
          </View>
        )}

        {activeTab === 'records' && (
          <View style={styles.section}>
            <OralCareRecordComponent records={mockTimelineData} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabItem: {
    flex: 1,
  },
  tabButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingTop: 20,
  },
});

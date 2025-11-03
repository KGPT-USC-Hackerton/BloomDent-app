import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
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
  const handleSurveySubmit = (result) => {
    if (!result) {
      return;
    }
    const score = Math.max(0, Math.min(100, result.normalizedScore ?? 0));
    Alert.alert(
      '설문 완료',
      `오늘 당신의 구강 점수는 💯 중 ${score}점이에요.\n작은 습관 하나로 내일의 치아 건강을 바꿀 수 있어요.`,
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

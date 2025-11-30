import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function HelpScreen({ navigation }) {
  const [expandedItems, setExpandedItems] = useState({});

  const faqItems = [
    {
      id: 1,
      question: 'AI 분석은 어떻게 사용하나요?',
      answer: '홈 화면에서 사진을 촬영하거나 갤러리에서 선택하면 자동으로 AI 분석이 시작됩니다. 분석 결과는 즉시 확인할 수 있습니다.',
    },
    {
      id: 2,
      question: '예약은 어떻게 하나요?',
      answer: '예약 화면에서 원하는 치과를 선택하고 날짜와 시간을 선택하면 예약이 완료됩니다. 예약 전 사전 자가진단 설문을 작성하시면 더 정확한 진단에 도움이 됩니다.',
    },
    {
      id: 3,
      question: '프리미엄 플랜의 혜택은 무엇인가요?',
      answer: '프리미엄 플랜을 이용하시면 AI 분석을 무제한으로 사용할 수 있고, 전문가 상담 서비스와 상세한 통계 리포트를 받으실 수 있습니다.',
    },
    {
      id: 4,
      question: '데이터는 안전하게 보관되나요?',
      answer: '네, 모든 개인정보와 건강 데이터는 암호화되어 안전하게 보관됩니다. 개인정보처리방침에서 자세한 내용을 확인하실 수 있습니다.',
    },
    {
      id: 5,
      question: '앱을 삭제하면 데이터도 삭제되나요?',
      answer: '앱을 삭제하시면 로컬 데이터는 삭제되지만, 서버에 저장된 데이터는 유지됩니다. 계정 삭제를 원하시면 설정에서 계정 삭제를 진행해주세요.',
    },
  ];

  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>도움말</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>자주 묻는 질문</Text>
          <View style={styles.faqCard}>
            {faqItems.map((item) => (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.faqItem}
                  onPress={() => toggleItem(item.id)}
                >
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.expandIcon}>
                    {expandedItems[item.id] ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>
                {expandedItems[item.id] && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
                {item.id < faqItems.length && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의하기</Text>
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>이메일</Text>
                <Text style={styles.contactValue}>support@bloomdent.com</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>전화</Text>
                <Text style={styles.contactValue}>1588-0000</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>🕐</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>운영 시간</Text>
                <Text style={styles.contactValue}>평일 09:00 - 18:00</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 사용 가이드</Text>
          <View style={styles.guideCard}>
            <View style={styles.guideItem}>
              <View style={[styles.guideIcon, styles.blueBackground]}>
                <Text style={styles.guideIconText}>📸</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>사진 촬영</Text>
                <Text style={styles.guideDescription}>
                  구강 내부를 명확하게 촬영하면 더 정확한 분석 결과를 얻을 수 있습니다.
                </Text>
              </View>
            </View>
            <View style={styles.guideItem}>
              <View style={[styles.guideIcon, styles.greenBackground]}>
                <Text style={styles.guideIconText}>📊</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>통계 확인</Text>
                <Text style={styles.guideDescription}>
                  마이페이지에서 관리 일수, 평균 점수 등 통계를 확인할 수 있습니다.
                </Text>
              </View>
            </View>
            <View style={styles.guideItem}>
              <View style={[styles.guideIcon, styles.purpleBackground]}>
                <Text style={styles.guideIconText}>📅</Text>
              </View>
              <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>예약 관리</Text>
                <Text style={styles.guideDescription}>
                  예약 화면에서 예약 내역을 확인하고 새로운 예약을 할 수 있습니다.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    minWidth: 40,
  },
  backButtonText: {
    fontSize: 24,
    color: '#f59e0b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 12,
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#f9fafb',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  guideCard: {
    gap: 12,
  },
  guideItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  blueBackground: {
    backgroundColor: '#dbeafe',
  },
  greenBackground: {
    backgroundColor: '#dcfce7',
  },
  purpleBackground: {
    backgroundColor: '#ede9fe',
  },
  guideIconText: {
    fontSize: 24,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 16,
  },
});


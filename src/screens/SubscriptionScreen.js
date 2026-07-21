import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getCurrentUser } from '../services/authService';
import { get } from '../services/api';

export default function SubscriptionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user || !user.id) {
        return;
      }

      // 실제 API 호출처럼 보이게 약간의 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 600));

      // 실제로는 API 호출: const response = await get(`/users/${user.id}/subscription`);
      const mockData = {
        plan: 'premium',
        planName: '프리미엄 플랜',
        description: 'AI 분석 무제한 + 전문가 상담',
        startDate: '2024-01-01',
        expiryDate: '2025-12-23',
        autoRenew: true,
        price: 9900,
        billingCycle: 'monthly',
      };

      setSubscription(mockData);
    } catch (error) {
      console.error('구독 정보 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      '구독 관리',
      '구독 관리 기능은 준비 중입니다.',
      [{ text: '확인' }]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      '구독 취소',
      '정말 구독을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: () => {
            Alert.alert('알림', '구독 취소 기능은 준비 중입니다.');
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>구독 관리</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      </SafeAreaView>
    );
  }

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>구독 관리</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>구독 정보가 없습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>구독 관리</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.subscriptionCard}>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>{subscription.planName}</Text>
          </View>
          <Text style={styles.planDescription}>{subscription.description}</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>시작일</Text>
              <Text style={styles.infoValue}>{formatDate(subscription.startDate)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>만료일</Text>
              <Text style={styles.infoValue}>{formatDate(subscription.expiryDate)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>결제 금액</Text>
              <Text style={styles.infoValue}>
                {subscription.price.toLocaleString()}원 / {subscription.billingCycle === 'monthly' ? '월' : '년'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>자동 갱신</Text>
              <Text style={styles.infoValue}>
                {subscription.autoRenew ? '활성화' : '비활성화'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>구독 혜택</Text>
          <View style={styles.benefitsCard}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✨</Text>
              <Text style={styles.benefitText}>AI 분석 무제한 이용</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>👨‍⚕️</Text>
              <Text style={styles.benefitText}>전문가 상담 서비스</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={styles.benefitText}>상세 통계 및 리포트</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🔔</Text>
              <Text style={styles.benefitText}>우선 알림 서비스</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={handleManageSubscription}
          >
            <Text style={styles.manageButtonText}>구독 변경</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>구독 취소</Text>
          </TouchableOpacity>
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
    color: '#7c3aed',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    minWidth: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  subscriptionCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  benefitsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
  },
  manageButton: {
    backgroundColor: '#7c3aed',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});


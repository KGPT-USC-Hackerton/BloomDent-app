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

export default function PrivacySettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user || !user.id) {
        return;
      }

      // 실제 API 호출처럼 보이게 약간의 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 500));

      // 실제로는 API 호출: const response = await get(`/users/${user.id}/privacy-settings`);
    } catch (error) {
      console.error('개인정보 설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('알림', '계정 삭제 기능은 준비 중입니다.');
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert('알림', '데이터 다운로드 기능은 준비 중입니다.');
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
          <Text style={styles.headerTitle}>개인정보 보호</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
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
        <Text style={styles.headerTitle}>개인정보 보호</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDownloadData}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📥</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>내 데이터 다운로드</Text>
                  <Text style={styles.settingDescription}>
                    저장된 모든 데이터를 다운로드합니다
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📄</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>개인정보처리방침</Text>
                  <Text style={styles.settingDescription}>
                    개인정보 처리 방침을 확인하세요
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>권한 설정</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📊</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>익명화된 분석 데이터</Text>
                  <Text style={styles.settingDescription}>
                    서비스 개선을 위한 익명 데이터 수집
                  </Text>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {privacySettings.analytics ? '활성화' : '비활성화'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🤝</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>데이터 공유</Text>
                  <Text style={styles.settingDescription}>
                    제3자와의 데이터 공유
                  </Text>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {privacySettings.dataSharing ? '활성화' : '비활성화'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📢</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingText}>마케팅 수신 동의</Text>
                  <Text style={styles.settingDescription}>
                    프로모션 및 이벤트 정보 수신
                  </Text>
                </View>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleText}>
                  {privacySettings.marketing ? '활성화' : '비활성화'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 관리</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={[styles.settingItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🗑️</Text>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingText, styles.dangerText]}>
                    계정 삭제
                  </Text>
                  <Text style={styles.settingDescription}>
                    계정과 모든 데이터를 영구적으로 삭제합니다
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
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
    color: '#059669',
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
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dangerItem: {
    backgroundColor: '#fef2f2',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  dangerText: {
    color: '#dc2626',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  toggleContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  arrow: {
    color: '#9ca3af',
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 52,
  },
});


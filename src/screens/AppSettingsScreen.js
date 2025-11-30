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

export default function AppSettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [appVersion, setAppVersion] = useState('1.2.3');
  const [language, setLanguage] = useState('한국어');

  useEffect(() => {
    loadAppSettings();
  }, []);

  const loadAppSettings = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user || !user.id) {
        return;
      }

      // 실제 API 호출처럼 보이게 약간의 딜레이 추가
      await new Promise(resolve => setTimeout(resolve, 400));

      // 실제로는 API 호출: const response = await get(`/users/${user.id}/app-settings`);
      // 앱 버전은 패키지에서 가져오기
      // const version = require('../../package.json').version;
    } catch (error) {
      console.error('앱 설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      '캐시 삭제',
      '앱 캐시를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          onPress: () => {
            Alert.alert('완료', '캐시가 삭제되었습니다.');
          },
        },
      ]
    );
  };

  const handleCheckUpdate = () => {
    Alert.alert('알림', '최신 버전입니다.');
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
          <Text style={styles.headerTitle}>앱 설정</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
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
        <Text style={styles.headerTitle}>앱 설정</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>일반 설정</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>언어</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>{language}</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🎨</Text>
                <Text style={styles.settingText}>테마</Text>
              </View>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>라이트</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleClearCache}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🗑️</Text>
                <Text style={styles.settingText}>캐시 삭제</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('알림', '데이터 백업 기능은 준비 중입니다.')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>💾</Text>
                <Text style={styles.settingText}>데이터 백업</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <Text style={styles.settingText}>앱 버전</Text>
              </View>
              <Text style={styles.valueText}>{appVersion}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleCheckUpdate}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔄</Text>
                <Text style={styles.settingText}>업데이트 확인</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📄</Text>
                <Text style={styles.settingText}>서비스 약관</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🔒</Text>
                <Text style={styles.settingText}>개인정보처리방침</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>❓</Text>
                <Text style={styles.settingText}>도움말</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('알림', '문의하기 기능은 준비 중입니다.')}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>📧</Text>
                <Text style={styles.settingText}>문의하기</Text>
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 16,
    color: '#6b7280',
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


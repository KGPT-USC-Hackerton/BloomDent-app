import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { logout } from '../services/authService';
import { getCurrentUser } from '../services/authService';

export default function MyPageScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserInfo();
  }, []);

  // 화면 포커스 시 사용자 정보 다시 로드 (프로필 수정 후 돌아올 때)
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadUserInfo();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserInfo = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
    }
  };

  const handleEditProfile = () => {
    if (navigation) {
      navigation.navigate('EditProfile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };
  return (
    <ScrollView style={styles.container}>
      {/* 프로필 섹션 */}
      <View style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || '사용자'}</Text>
            <Text style={styles.profileEmail}>{user?.email || user?.username || ''}</Text>
            <Text style={styles.profileMembership}>일반 회원</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 통계 섹션 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>127</Text>
          <Text style={styles.statLabel}>관리 일수</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.greenText]}>85</Text>
          <Text style={styles.statLabel}>평균 점수</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.purpleText]}>12</Text>
          <Text style={styles.statLabel}>예약 완료</Text>
        </View>
      </View>

      {/* 설정 메뉴 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>설정</Text>
        <View style={styles.settingsCard}>
          {/* 알림 설정 */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.blueBackground]}>
                <Text style={styles.settingIconText}>🔔</Text>
              </View>
              <Text style={styles.settingText}>알림 설정</Text>
            </View>
            <Switch />
          </View>

          <View style={styles.divider} />

          {/* 개인정보 보호 */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.greenBackground]}>
                <Text style={styles.settingIconText}>🛡️</Text>
              </View>
              <Text style={styles.settingText}>개인정보 보호</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 앱 설정 */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.purpleBackground]}>
                <Text style={styles.settingIconText}>⚙️</Text>
              </View>
              <Text style={styles.settingText}>앱 설정</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* 도움말 */}
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.yellowBackground]}>
                <Text style={styles.settingIconText}>❓</Text>
              </View>
              <Text style={styles.settingText}>도움말</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 구독 정보 */}
      <View style={styles.section}>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionContent}>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>프리미엄 플랜</Text>
              <Text style={styles.subscriptionDescription}>AI 분석 무제한 + 전문가 상담</Text>
              <Text style={styles.subscriptionExpiry}>2025.12.23까지</Text>
            </View>
            <TouchableOpacity style={styles.manageButton}>
              <Text style={styles.manageButtonText}>관리</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 앱 정보 */}
      <View style={styles.section}>
        <View style={styles.appInfoCard}>
          <View style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>앱 버전</Text>
            <Text style={styles.appInfoValue}>1.2.3</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>서비스 약관</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.appInfoItem}>
            <Text style={styles.appInfoLabel}>개인정보처리방침</Text>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 로그아웃 */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileCard: {
    margin: 16,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  profileMembership: {
    fontSize: 14,
    color: '#2563eb',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  greenText: {
    color: '#059669',
  },
  purpleText: {
    color: '#7c3aed',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  yellowBackground: {
    backgroundColor: '#fef3c7',
  },
  settingIconText: {
    fontSize: 16,
  },
  settingText: {
    color: '#374151',
    fontSize: 16,
  },
  arrow: {
    color: '#9ca3af',
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  subscriptionCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  subscriptionExpiry: {
    fontSize: 14,
    color: '#7c3aed',
  },
  manageButton: {
    borderWidth: 1,
    borderColor: '#c4b5fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  manageButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '600',
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  appInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  appInfoLabel: {
    color: '#6b7280',
    fontSize: 14,
  },
  appInfoValue: {
    color: '#374151',
    fontSize: 14,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
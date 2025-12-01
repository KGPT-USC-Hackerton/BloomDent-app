// screens/CareScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SurveyComponent from '../components/SurveyComponent';
import PhotoAnalysisComponent from '../components/PhotoAnalysisComponent';
import OralCareRecordComponent from '../components/OralCareRecordComponent';
import PhotoAnalysisHistoryList from '../components/PhotoAnalysisHistoryList';

const tabs = [
  { id: 'survey', label: '설문조사' },
  { id: 'photo', label: '구강 사진 분석' },
];

const FALLBACK_BACKEND_BASE_URL = 'http://210.119.33.3:3000';

export default function CareScreen({ route }) {
  const [activeTab, setActiveTab] = useState('survey');
  const [userId, setUserId] = useState(null);
  const [isSurveyStarted, setIsSurveyStarted] = useState(false);
  const [isPhotoSession, setIsPhotoSession] = useState(false);

  // score_history 기반 기록
  const [records, setRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState(null);

  // 설문 완료 후 AI 분석/추천 진행 상태
  const [isProcessingSurvey, setIsProcessingSurvey] = useState(false);

  // 설문 완료 후 기록 다시 불러오도록 트리거
  const [reloadKey, setReloadKey] = useState(0);

  const BACKEND_BASE_URL =
    route?.params?.BACKEND_BASE_URL || FALLBACK_BACKEND_BASE_URL;

  // user_id 로드
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        console.log('📌 CareScreen user_id =', storedUserId);

        if (storedUserId) {
          setUserId(Number(storedUserId));
        }
      } catch (e) {
        console.log('Failed to load user_id:', e);
      }
    })();
  }, []);

  // 탭 변경 시 설문 / 사진 촬영 세션 모두 초기화
  useEffect(() => {
    if (activeTab !== 'survey') {
      setIsSurveyStarted(false);
    }
    if (activeTab !== 'photo') {
      setIsPhotoSession(false); // 🔥 다른 탭 갔다 오면 촬영 세션 종료 상태로
    }
  }, [activeTab]);

  // ✅ score_history 불러오기 (userId, reloadKey가 바뀔 때마다)
  useEffect(() => {
    if (!userId) return;

    const fetchRecords = async () => {
      try {
        setRecordsLoading(true);
        setRecordsError(null);

        const res = await fetch(
          `${BACKEND_BASE_URL}/api/survey-detail/history/${userId}`,
        );
        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message || 'score_history 조회 실패');
        }

        // 1️⃣ 원본 리스트
        const list = json.data || [];

        // 2️⃣ created_at / createdAt 기준으로 "가장 최근"이 위로 오게 정렬
        const sorted = [...list].sort((a, b) => {
          const aDate = new Date(a.created_at || a.createdAt || 0);
          const bDate = new Date(b.created_at || b.createdAt || 0);
          return bDate - aDate; // b가 더 최신이면 앞으로
        });

        // 3️⃣ 화면에서 쓸 형태로 매핑
        const mapped = sorted.map(item => {
          const rawDate = item.created_at || item.createdAt;

          let dateStr = '';
          if (rawDate) {
            const d = new Date(rawDate); // 기기 시간대 기준
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dateStr = `${year}-${month}-${day}`; // 2025-11-30
          }

          return {
            id: item.id,
            date: dateStr,
            score: item.total_score,
            survey_session_id:
              item.survey_session_id || item.session_id || null,
            note: item.analysis_summary || item.note || null,
          };
        });

        setRecords(mapped);
      } catch (err) {
        console.log('score_history fetch error:', err);
        setRecordsError(err.message);
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchRecords();
  }, [userId, BACKEND_BASE_URL, reloadKey]);

  /**
   * 설문 완료 시 호출되는 콜백
   * - result 안에는 설문 점수 + 세션 ID 가 들어있다고 가정
   *   (SurveyComponent 쪽에서 session_id 또는 sessionId를 넘겨줘야 함)
   * - 1) 기본 점수 Alert
   * - 2) 백엔드에 분석/추천 요청 (Gemini)
   */
  const handleSurveySubmit = async result => {
    if (!result || !userId) return;
    setIsProcessingSurvey(true);

    try {
      const overallScoreRaw =
        result?.overall?.normalizedScore ??
        result?.normalizedScore ??
        result?.scores?.total_score ??
        0;
      const score = Math.max(0, Math.min(100, overallScoreRaw));

      const surveySessionId =
        result?.session_id ||
        result?.sessionId ||
        result?.scores?.survey_session_id ||
        result?.scores?.session_id ||
        null;

      console.log('🔍 survey result from SurveyComponent:', result);
      console.log(
        '🔍 userId:',
        userId,
        'surveySessionId:',
        surveySessionId,
        'score:',
        score,
      );

      // 2) 설문 분석 요청
      const analysisRes = await fetch(
        `${BACKEND_BASE_URL}/api/ai/survey-analysis`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            survey_session_id: surveySessionId,
            score,
            raw_result: result, // 백엔드에서 필요하면 쓰도록 전체를 같이 보냄
          }),
        },
      );

      const analysisJson = await analysisRes.json();
      console.log('🔍 analysisJson:', analysisJson);

      if (!analysisRes.ok || !analysisJson.success) {
        throw new Error(
          analysisJson.message ||
            `분석 API 에러 (status ${analysisRes.status})`,
        );
      }

      // 3) 추천 요청
      const recRes = await fetch(`${BACKEND_BASE_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          survey_session_id: surveySessionId,
          score,
          raw_result: result,
        }),
      });

      const recJson = await recRes.json();
      console.log('🔍 recJson:', recJson);

      if (!recRes.ok || !recJson.success) {
        throw new Error(
          recJson.message || `추천 API 에러 (status ${recRes.status})`,
        );
      }
      setReloadKey(prev => prev + 1); // 기록 다시 불러오기 트리거
      Alert.alert(
        // 완료 안내
        '설문 완료',
        '설문 결과 분석과 맞춤형 구강 용품 추천이 완료되었습니다.',
      );
    } catch (error) {
      console.error('설문 분석/추천 처리 오류:', error);
      Alert.alert(
        '분석 오류',
        error.message ||
          '설문 분석 또는 추천을 생성하는 중 문제가 발생했습니다.',
      );
    } finally {
      setIsProcessingSurvey(false);
      setIsSurveyStarted(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <View key={tab.id} style={styles.tabItem}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.tabButtonActive,
              ]}
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
        {/* 설문 탭 */}
        {activeTab === 'survey' && (
          <View style={styles.section}>
            {/* 1) 설문 시작 카드 or 설문 컴포넌트 */}
            {!isSurveyStarted ? (
              <View style={styles.card}>
                <View style={styles.cardIconCircle}>
                  <Text style={styles.cardIconText}>📝</Text>
                </View>
                <Text style={styles.cardTitle}>
                  구강 건강 설문을 시작해보세요
                </Text>
                <Text style={styles.cardSubtitle}>
                  5~10분 정도 소요되며, 설문 결과를 바탕으로 맞춤형 구강 관리
                  팁과 추천 구강 용품을 제공해드려요.
                </Text>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setIsSurveyStarted(true)}
                  disabled={isProcessingSurvey}
                >
                  <Text style={styles.primaryButtonText}>설문 시작하기</Text>
                </TouchableOpacity>

                {isProcessingSurvey && (
                  <View style={styles.processingBox}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text style={styles.processingText}>
                      설문 결과를 분석 중입니다...
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <SurveyComponent
                backendBaseUrl={BACKEND_BASE_URL}
                userId={userId}
                onSubmit={handleSurveySubmit}
                isProcessing={isProcessingSurvey}
              />
            )}

            {/* ✅ 설문을 시작하지 않았을 때만 기록 섹션 보이기 */}
            {!isSurveyStarted && (
              <View className="historySection" style={styles.historySection}>
                {recordsLoading && (
                  <View style={styles.historyLoading}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text style={styles.historyLoadingText}>
                      불러오는 중...
                    </Text>
                  </View>
                )}

                {!recordsLoading && recordsError && (
                  <Text style={styles.historyErrorText}>
                    기록을 불러오는 중 오류가 발생했습니다.
                  </Text>
                )}

                {!recordsLoading && !recordsError && records.length === 0 && (
                  <Text style={styles.historyEmptyText}>
                    아직 설문 기반 기록이 없어요. 설문을 완료하면 이곳에 기록이
                    쌓여요.
                  </Text>
                )}

                {!recordsLoading && !recordsError && records.length > 0 && (
                  <OralCareRecordComponent
                    records={records}
                    backendBaseUrl={BACKEND_BASE_URL}
                  />
                )}
              </View>
            )}
          </View>
        )}

        {/* 구강 사진 분석 탭 */}
        {activeTab === 'photo' && (
          <View style={styles.section}>
            {/* 📷 1) 사진 촬영 + 분석 UI */}
            <PhotoAnalysisComponent
              backendBaseUrl={BACKEND_BASE_URL}
              onSessionStateChange={setIsPhotoSession}
            />

            {/* 📘 2) 최근 구강 사진 분석 기록 리스트 (촬영 중일 땐 숨김) */}
            {!isPhotoSession && (
              <View style={styles.photoHistorySection}>
                <PhotoAnalysisHistoryList />
              </View>
            )}
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

  // 설문 시작 카드
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e0ecff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardIconText: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // 설문 기록 섹션
  historySection: {
    marginTop: 28,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  historyLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280',
  },
  historyErrorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#dc2626',
  },
  historyEmptyText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b7280',
  },

  processingBox: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#6b7280',
  },

  // 📷 구강 사진 분석 기록 섹션 여백
  photoHistorySection: {
    marginTop: 28,
  },
});

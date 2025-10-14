import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function CareScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentMode, setCurrentMode] = useState('main');
  const [careInputStep, setCareInputStep] = useState(0);
  const [careInputData, setCareInputData] = useState({});

  const handleFileUpload = () => {
    // 모의 AI 분석 결과
    setTimeout(() => {
      setAnalysisResult({
        score: 82,
        issues: [
          { type: 'warning', text: '치석이 약간 보입니다' },
          { type: 'good', text: '잇몸 상태가 양호합니다' },
          { type: 'info', text: '정기 검진을 권장합니다' }
        ],
        recommendations: [
          '하루 2회 이상 양치질',
          '치실 사용 권장',
          '정기 스케일링 (6개월마다)'
        ]
      });
    }, 2000);
    setSelectedFile(true);
  };

  const careInputQuestions = [
    {
      id: 'brushing',
      title: '양치질',
      question: '오늘 몇 번 양치질을 하셨나요?',
      type: 'select',
      options: ['1회', '2회', '3회', '4회 이상']
    },
    {
      id: 'flossing',
      title: '치실 사용',
      question: '치실을 사용하셨나요?',
      type: 'select',
      options: ['사용함', '사용하지 않음']
    },
    {
      id: 'fluoride',
      title: '불소 도포',
      question: '불소 도포를 받으셨나요?',
      type: 'select',
      options: ['오늘 받음', '1주일 이내', '1개월 이내', '받지 않음']
    },
    {
      id: 'scaling',
      title: '스케일링',
      question: '최근 스케일링을 받으신 적이 있나요?',
      type: 'select',
      options: ['1개월 이내', '3개월 이내', '6개월 이내', '1년 이상']
    },
    {
      id: 'treatment',
      title: '충치 치료',
      question: '현재 충치 치료 중이신가요?',
      type: 'select',
      options: ['치료 중', '치료 완료', '치료 필요', '해당 없음']
    }
  ];

  const handleCareInputAnswer = (questionId, answer) => {
    const updatedData = { ...careInputData, [questionId]: answer };
    setCareInputData(updatedData);
    
    if (careInputStep < careInputQuestions.length - 1) {
      setCareInputStep(careInputStep + 1);
    } else {
      setCurrentMode('main');
      setCareInputStep(0);
      Alert.alert('완료', '치아 관리 기록이 저장되었습니다.');
    }
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

  // 치아 관리 정보 입력 모드 렌더링
  if (currentMode === 'care-input') {
    const currentQuestion = careInputQuestions[careInputStep];
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setCurrentMode('main');
              setCareInputStep(0);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>치아 관리 정보 입력</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((careInputStep + 1) / careInputQuestions.length) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {careInputStep + 1} / {careInputQuestions.length}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.questionIcon}>
              <Text style={styles.questionIconText}>📝</Text>
            </View>
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleCareInputAnswer(currentQuestion.id, option)}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // 구강 사진 분석 모드 렌더링
  if (currentMode === 'photo-analysis') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setCurrentMode('main');
              setSelectedFile(null);
              setAnalysisResult(null);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>구강 사진 분석</Text>
        </View>

        <View style={styles.photoAnalysisCard}>
          {!selectedFile ? (
            <View style={styles.photoUploadSection}>
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
              <Text style={styles.photoTitle}>구강 사진을 촬영해주세요</Text>
              <Text style={styles.photoSubtext}>
                AI가 사진을 분석하여 구강 건강 상태를 알려드립니다
              </Text>
              <TouchableOpacity
                onPress={handleFileUpload}
                style={styles.uploadButton}
              >
                <Text style={styles.uploadButtonText}>📤 사진 촬영하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.analysisSection}>
              <View style={styles.photoPreview}>
                <Text style={styles.photoPreviewText}>촬영된 사진</Text>
              </View>
              {!analysisResult ? (
                <View style={styles.loadingSection}>
                  <Text style={styles.loadingText}>AI 분석 중...</Text>
                </View>
              ) : (
                <View style={styles.resultSection}>
                  <View style={styles.scoreSection}>
                    <Text style={styles.scoreNumber}>{analysisResult.score}</Text>
                    <Text style={styles.scoreLabel}>구강 건강 점수</Text>
                  </View>
                  
                  <View style={styles.issuesSection}>
                    {analysisResult.issues.map((issue, index) => (
                      <View key={index} style={styles.issueItem}>
                        <Text style={styles.issueIcon}>
                          {issue.type === 'good' ? '✅' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </Text>
                        <Text style={styles.issueText}>{issue.text}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.recommendationsSection}>
                    <Text style={styles.recommendationsTitle}>추천 사항</Text>
                    {analysisResult.recommendations.map((rec, index) => (
                      <View key={index} style={styles.recommendationItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 구강 관리 선택 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>구강 관리</Text>
        
        <View style={styles.managementCard}>
          <TouchableOpacity
            onPress={() => setCurrentMode('care-input')}
            style={styles.managementOption}
          >
            <View style={styles.managementIcon}>
              <Text style={styles.managementIconText}>📝</Text>
            </View>
            <View style={styles.managementInfo}>
              <Text style={styles.managementTitle}>치아 관리 기록</Text>
              <Text style={styles.managementSubtext}>오늘의 관리 내용을 기록하세요</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentMode('photo-analysis')}
            style={styles.photoAnalysisButton}
          >
            <Text style={styles.photoAnalysisButtonText}>📷 구강 사진 분석하기</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 기록 타임라인 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>구강 관리 기록</Text>
        
        <View style={styles.timelineContainer}>
          {mockTimelineData.map((record, index) => (
            <View key={index} style={styles.timelineCard}>
              <View style={styles.timelineContent}>
                <View style={styles.timelineIndicator}>
                  <View style={[
                    styles.timelineDot,
                    {
                      backgroundColor: record.status === 'good' ? '#10b981' : 
                        record.status === 'warning' ? '#f59e0b' : '#6b7280'
                    }
                  ]} />
                  {index < mockTimelineData.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineInfo}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineDate}>{record.date}</Text>
                    <View style={[
                      styles.scoreTag,
                      {
                        backgroundColor: record.status === 'good' ? '#dcfce7' :
                          record.status === 'warning' ? '#fef3c7' : '#f3f4f6'
                      }
                    ]}>
                      <Text style={[
                        styles.scoreTagText,
                        {
                          color: record.status === 'good' ? '#166534' :
                            record.status === 'warning' ? '#92400e' : '#374151'
                        }
                      ]}>
                        점수: {record.score}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.timelineNote}>{record.note}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#6b7280',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  progressSection: {
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  questionCard: {
    margin: 16,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  questionIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  questionIconText: {
    fontSize: 32,
  },
  questionTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  optionButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  photoAnalysisCard: {
    margin: 16,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  photoUploadSection: {
    alignItems: 'center',
  },
  cameraIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#dbeafe',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraIconText: {
    fontSize: 40,
  },
  photoTitle: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisSection: {
    gap: 16,
  },
  photoPreview: {
    width: '100%',
    height: 192,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photoPreviewText: {
    color: '#6b7280',
  },
  loadingSection: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    color: '#6b7280',
  },
  resultSection: {
    gap: 16,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scoreLabel: {
    color: '#6b7280',
  },
  issuesSection: {
    gap: 8,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  issueIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  recommendationsSection: {
    marginTop: 16,
  },
  recommendationsTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bullet: {
    color: '#3b82f6',
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 16,
  },
  managementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  managementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  managementIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  managementIconText: {
    fontSize: 20,
  },
  managementInfo: {
    flex: 1,
  },
  managementTitle: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  managementSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  photoAnalysisButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoAnalysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineContainer: {
    gap: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
    marginTop: 8,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  timelineDate: {
    color: '#374151',
    fontSize: 16,
  },
  scoreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineNote: {
    fontSize: 14,
    color: '#6b7280',
  },
});
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

const SurveyScreen = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [answers, setAnswers] = useState({
    // 기본정보
    visitedDentist: null,
    brushTwiceDaily: null,
    // 위생습관
    useOralCareProducts: null,
    replaceToothbrush: null,
    // 식습관
    limitSweets: null,
    brushAfterMeal: null,
    // 건강관리
    scalingFluoride: null,
    noGumBleeding: null,
    // 생활습관
    noSmoking: null,
  });

  const questions = [
    {
      category: '기본정보',
      key: 'visitedDentist',
      text: '최근 6개월 이내에 치과에 방문한 적이 있나요?',
    },
    {
      category: '기본정보',
      key: 'brushTwiceDaily',
      text: '하루 2회 이상 양치하나요?',
    },
    {
      category: '위생습관',
      key: 'useOralCareProducts',
      text: '구강관리용품(치실, 치간칫솔, 가글 등)을 꾸준히 사용하나요?',
    },
    {
      category: '위생습관',
      key: 'replaceToothbrush',
      text: '칫솔모를 3개월마다 교체하나요?',
    },
    {
      category: '식습관',
      key: 'limitSweets',
      text: '단 음료나 간식을 자주 섭취하지 않나요?',
    },
    {
      category: '식습관',
      key: 'brushAfterMeal',
      text: '식사 후 30분 이내에 양치하나요?',
    },
    {
      category: '건강관리',
      key: 'scalingFluoride',
      text: '최근 1년 내 스케일링 또는 불소도포를 받은 적이 있나요?',
    },
    {
      category: '건강관리',
      key: 'noGumBleeding',
      text: '양치할 때 잇몸 출혈이 거의 없나요?',
    },
    {
      category: '생활습관',
      key: 'noSmoking',
      text: '흡연 또는 전자담배를 사용하지 않나요?',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion.key]: value });
  };

  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    // 컴포넌트 언마운트 시 interval 정리
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleNext = () => {
    if (answers[currentQuestion.key] === null) {
      Alert.alert('알림', '답변을 선택해주세요.');
      return;
    }

    if (isLastQuestion) {
      // 마지막 문항이면 제출 메시지 표시 후 카운트다운 시작
      setIsSubmitting(true);
      setCountdown(3);
      
      // 1초마다 카운트다운
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            onComplete(answers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // 다음 문항으로 이동
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const getCategoryTitle = (category) => {
    const categoryMap = {
      '기본정보': '기본정보',
      '위생습관': '위생습관',
      '식습관': '식습관',
      '건강관리': '건강관리',
      '생활습관': '생활습관',
    };
    return categoryMap[category] || category;
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // 제출 중일 때 완료 메시지 및 카운트다운 표시
  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.submitMessageContainer}>
          <View style={styles.submitMessageBox}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.submitMessageText}>제출되었습니다</Text>
          </View>
          {countdown > 0 && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownLabel}>홈화면으로 가는중</Text>
              <Text style={styles.countdownNumber}>{countdown}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>초기 설문</Text>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.categoryTitle}>
          {getCategoryTitle(currentQuestion.category)}
        </Text>
        
        <View style={styles.surveyContainer}>
          {/* 진행도 게이지바 */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>
          </View>
          
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {currentQuestionIndex + 1}. {currentQuestion.text}
            </Text>
          </View>
          
          <View style={styles.answerButtons}>
            <TouchableOpacity
              style={[
                styles.answerButton,
                answers[currentQuestion.key] === true && styles.answerButtonSelected,
              ]}
              onPress={() => handleAnswer(true)}
            >
              <Text
                style={[
                  styles.answerButtonText,
                  answers[currentQuestion.key] === true && styles.answerButtonTextSelected,
                ]}
              >
                ✅ 예
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.answerButton,
                answers[currentQuestion.key] === false && styles.answerButtonSelectedNo,
              ]}
              onPress={() => handleAnswer(false)}
            >
              <Text
                style={[
                  styles.answerButtonText,
                  answers[currentQuestion.key] === false && styles.answerButtonTextSelectedNo,
                ]}
              >
                ❌ 아니오
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.navigationButtons}>
          {!isFirstQuestion && (
            <TouchableOpacity
              style={styles.previousButton}
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>이전</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              answers[currentQuestion.key] === null && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={answers[currentQuestion.key] === null}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? '제출하기' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    paddingVertical: 12,
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  surveyContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: 600,
    width: '100%',
  },
  questionContainer: {
    borderRadius: 8,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    color: '#374151',
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '700',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  answerButtonSelected: {
    backgroundColor: '#7dd3fc',
    borderColor: '#38bdf8',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  answerButtonSelectedNo: {
    backgroundColor: '#fca5a5',
    borderColor: '#f87171',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  answerButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  answerButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  answerButtonTextSelectedNo: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previousButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  submitMessageBox: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0284c7',
    borderRadius: 12,
    padding: 24,
    marginBottom: 30,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  checkIcon: {
    fontSize: 48,
    color: '#0284c7',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  submitMessageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0284c7',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countdownLabel: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: '600',
  },
  countdownNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0284c7',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default SurveyScreen;

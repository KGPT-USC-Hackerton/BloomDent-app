// 웹 전용 설문 화면 - 순수 React로 구현 (순차 진행)
import React, { useState, useEffect, useRef } from 'react';

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

  const countdownIntervalRef = React.useRef(null);

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
      alert('답변을 선택해주세요.');
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
      <div style={styles.container}>
        <div style={styles.submitMessageContainer}>
          <div style={styles.submitMessageBox}>
            <p style={styles.checkIcon}>✓</p>
            <p style={styles.submitMessageText}>제출되었습니다</p>
          </div>
          {countdown > 0 && (
            <div style={styles.countdownContainer}>
              <p style={styles.countdownLabel}>홈화면으로 가는중</p>
              <p style={styles.countdownNumber}>{countdown}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>초기 설문</h1>
        <span style={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </div>
      
      <div style={styles.content}>
        <h2 style={styles.categoryTitle}>
          {getCategoryTitle(currentQuestion.category)}
        </h2>
        
        <div style={styles.surveyContainer}>
          {/* 진행도 게이지바 */}
          <div style={styles.progressBarContainer}>
            <div style={styles.progressBarBackground}>
              <div style={{...styles.progressBarFill, width: `${progress}%`}}></div>
            </div>
          </div>
          
          <div style={styles.questionContainer}>
            <p style={styles.questionText}>
              {currentQuestionIndex + 1}. {currentQuestion.text}
            </p>
          </div>
          
          <div style={styles.answerButtons}>
            <button
              style={{
                ...styles.answerButton,
                ...(answers[currentQuestion.key] === true ? styles.answerButtonSelected : {}),
              }}
              onClick={() => handleAnswer(true)}
            >
              ✅ 예
            </button>
            
            <button
              style={{
                ...styles.answerButton,
                ...(answers[currentQuestion.key] === false ? styles.answerButtonSelectedNo : {}),
              }}
              onClick={() => handleAnswer(false)}
            >
              ❌ 아니오
            </button>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <div style={styles.navigationButtons}>
          {!isFirstQuestion && (
            <button
              style={styles.previousButton}
              onClick={handlePrevious}
            >
              이전
            </button>
          )}
          
          <button
            style={{
              ...styles.nextButton,
              ...(answers[currentQuestion.key] === null ? styles.nextButtonDisabled : {}),
            }}
            onClick={handleNext}
            disabled={answers[currentQuestion.key] === null}
          >
            {isLastQuestion ? '제출하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  progressText: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    padding: '12px 0',
    marginBottom: '20px',
  },
  progressBarBackground: {
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  content: {
    flex: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surveyContainer: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  categoryTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#000000',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    textAlign: 'center',
    maxWidth: '600px',
    width: '100%',
  },
  questionContainer: {
    borderRadius: '8px',
    padding: '20px',
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '120px',
  },
  questionText: {
    fontSize: '18px',
    color: '#374151',
    lineHeight: '28px',
    margin: 0,
    textAlign: 'center',
    fontWeight: '700',
  },
  answerButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    marginTop: '20px',
  },
  answerButton: {
    flex: 1,
    padding: '16px',
    borderRadius: '8px',
    backgroundColor: '#e5e7eb',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
  },
  answerButtonSelected: {
    backgroundColor: '#7dd3fc',
    borderColor: '#38bdf8',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },
  answerButtonSelectedNo: {
    backgroundColor: '#fca5a5',
    borderColor: '#f87171',
    color: '#ffffff',
    fontWeight: '600',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },
  footer: {
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
  },
  navigationButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: '12px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    color: '#374151',
    fontSize: '18px',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: '8px',
    padding: '16px',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
  submitMessageContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    height: '100vh',
    padding: '20px',
  },
  submitMessageBox: {
    backgroundColor: '#fff',
    border: '2px solid #0284c7',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  checkIcon: {
    fontSize: '48px',
    color: '#0284c7',
    margin: '0 0 12px 0',
    fontWeight: 'bold',
    lineHeight: '1',
  },
  submitMessageText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#0284c7',
    margin: 0,
  },
  countdownContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12px',
  },
  countdownLabel: {
    fontSize: '20px',
    color: '#64748b',
    fontWeight: '600',
    margin: 0,
  },
  countdownNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#0284c7',
    minWidth: '40px',
    textAlign: 'center',
    margin: 0,
  },
};

export default SurveyScreen;

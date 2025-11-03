import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const surveySections = [
  {
    id: 'awareness',
    title: '① 자기 인식 & 관찰 유도 (25점)',
    questions: [
      {
        id: 'awareness_1',
        prompt: '1. 오늘 양치할 때 잇몸색이나 입냄새 변화를 의식해본 적이 있나요?',
        insight: '자기 인식 강화',
        options: [
          { label: '자주', score: 10 },
          { label: '가끔', score: 5 },
          { label: '없음', score: 0 },
        ],
      },
      {
        id: 'awareness_2',
        prompt: '2. 혀의 색이나 표면 상태를 확인해본 적이 있나요?',
        insight: '시각적 자기점검 습관',
        options: [
          { label: '매일', score: 10 },
          { label: '가끔', score: 5 },
          { label: '안 함', score: 0 },
        ],
      },
      {
        id: 'awareness_3',
        prompt: '3. 양치 후 입안이 상쾌한지 스스로 느껴봤나요?',
        insight: '감각 인식 훈련',
        options: [
          { label: '항상', score: 10 },
          { label: '가끔', score: 5 },
          { label: '아니오', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'habit',
    title: '② 행동 습관 확인 & 인지 교정 (45점)',
    questions: [
      {
        id: 'habit_1',
        prompt: '4. 하루 2회 이상 양치를 실천했나요?',
        insight: '빈도 중심 습관',
        options: [
          { label: '항상', score: 10 },
          { label: '가끔', score: 5 },
          { label: '거의 안 함', score: 0 },
        ],
      },
      {
        id: 'habit_2',
        prompt: '5. 양치 시간은 평균 3분 이상이었나요?',
        insight: '시간 인식 개선',
        options: [
          { label: '3분 이상', score: 10 },
          { label: '1분 내외', score: 5 },
          { label: '1분 미만', score: 0 },
        ],
      },
      {
        id: 'habit_3',
        prompt: '6. 양치 시 치실, 치간칫솔, 워터픽 중 하나라도 사용했나요?',
        insight: '보조도구 활용 인식',
        options: [
          { label: '매일', score: 10 },
          { label: '주 2~3회', score: 5 },
          { label: '안 함', score: 0 },
        ],
      },
      {
        id: 'habit_4',
        prompt: '7. 간식이나 음료 섭취 후 입안을 물로 헹구거나 양치했나요?',
        insight: '행동 직후 반응 습관',
        options: [
          { label: '항상', score: 10 },
          { label: '가끔', score: 5 },
          { label: '거의 안 함', score: 0 },
        ],
      },
      {
        id: 'habit_5',
        prompt: '8. 칫솔은 최근 3개월 내 교체했나요?',
        insight: '위생 인식 유지',
        options: [
          { label: '예', score: 5 },
          { label: '아니오', score: 0 },
        ],
      },
    ],
  },
  {
    id: 'prevention',
    title: '③ 디지털 연결 + 예방적 행동 강조 (30점)',
    questions: [
      {
        id: 'prevention_1',
        prompt: '9. 오늘 BloomDent 설문을 완료했거나 구강관리 점수를 확인했나요?',
        insight: '디지털 습관 유도',
        options: [
          { label: '예', score: 10 },
          { label: '기억 안 남', score: 5 },
          { label: '아니오', score: 0 },
        ],
      },
      {
        id: 'prevention_2',
        prompt: '10. 최근 구강관리 관련 콘텐츠(영상·가이드)를 확인했나요?',
        insight: '정보 접근 강화',
        options: [
          { label: '예', score: 10 },
          { label: '가끔', score: 5 },
          { label: '아니오', score: 0 },
        ],
      },
      {
        id: 'prevention_3',
        prompt: '11. 구강건강을 위해 물 섭취를 의식적으로 늘렸나요?',
        insight: '생활 습관 개선',
        options: [
          { label: '충분히 함', score: 10 },
          { label: '노력 중', score: 5 },
          { label: '신경 안 씀', score: 0 },
        ],
      },
    ],
  },
];

export default function SurveyComponent({ onSubmit }) {
  const flatQuestions = useMemo(
    () =>
      surveySections.flatMap((section) =>
        section.questions.map((question) => ({
          ...question,
          sectionId: section.id,
          sectionTitle: section.title,
        })),
      ),
    [],
  );
  const summarySections = useMemo(
    () =>
      surveySections.map((section) => ({
        id: section.id,
        title: section.title,
        insights: Array.from(
          new Set(section.questions.map((question) => question.insight)),
        ),
      })),
    [],
  );
  const maxScore = useMemo(
    () =>
      flatQuestions.reduce(
        (total, question) =>
          total +
          Math.max(
            ...question.options.map((option) => option.score),
          ),
        0,
      ),
    [flatQuestions],
  );

  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});

  const currentQuestion = flatQuestions[step];
  const progressText = `${step + 1} / ${flatQuestions.length}`;
  const progressRatio = ((step + 1) / flatQuestions.length) * 100;

  const handleSelectOption = (option) => {
    const nextResponses = {
      ...responses,
      [currentQuestion.id]: {
        answer: option.label,
        score: option.score,
        sectionId: currentQuestion.sectionId,
        sectionTitle: currentQuestion.sectionTitle,
      },
    };
    const isLastStep = step === flatQuestions.length - 1;

    if (isLastStep) {
      const rawScore = Object.values(nextResponses).reduce(
        (sum, response) => sum + response.score,
        0,
      );
      const categoryScores = Object.values(nextResponses).reduce(
        (acc, response) => {
          if (!acc[response.sectionId]) {
            acc[response.sectionId] = {
              title: response.sectionTitle,
              score: 0,
            };
          }
          acc[response.sectionId].score += response.score;
          return acc;
        },
        {},
      );
      const normalizedScore = Math.round((rawScore / maxScore) * 100);

      onSubmit?.({
        responses: nextResponses,
        rawScore,
        normalizedScore,
        categoryScores,
        maxScore,
      });

      setStep(0);
      setResponses({});
      return;
    }

    setResponses(nextResponses);
    setStep((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressRatio}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressText}</Text>
        </View>

        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.sectionTag}>{currentQuestion.sectionTitle}</Text>
            <View style={styles.questionIcon}>
              <Text style={styles.questionIconText}>📝</Text>
            </View>
            <Text style={styles.questionTitle}>{currentQuestion.prompt}</Text>
            <Text style={styles.questionText}>{currentQuestion.insight}</Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.label}
                onPress={() => handleSelectOption(option)}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>영역 요약</Text>
          {summarySections.map((section) => (
            <View key={section.id} style={styles.summaryItem}>
              <Text style={styles.summarySection}>{section.title}</Text>
              <Text style={styles.summaryInsight}>{section.insights.join(' · ')}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d4ed8',
    marginBottom: 12,
      
  },
  summaryItem: {
    marginBottom: 12,
  },
  summarySection: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  summaryInsight: {
    fontSize: 15,
    color: '#1f2937',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  progressSection: {
    marginBottom: 20,
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
    flex: 1,
    marginBottom: 20,
    
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
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
    textAlign: 'center',
  },
});

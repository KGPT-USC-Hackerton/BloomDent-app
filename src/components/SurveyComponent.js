import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * 1) 문항 메타데이터 (문항내용/카테고리/문항당배점/옵션라벨)
 *    - 문항당배점(weight)은 "해당 문항의 최고점"으로 사용
 *    - 응답점수(1~5)는 weight에 비례해 환산
 */
const QUESTIONS = {
  1: { category: '구강관리/양치습관', weight: 3.75, text: '양치질만으로는 구강관리가 부족하다는 것을 알고 계십니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  2: { category: '구강관리/양치습관', weight: 3.75, text: '본인에게 알맞은 구강관리용품이 무엇인지 알고 계십니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  3: { category: '구강관리/양치습관', weight: 3.75, text: '치실·치간칫솔·가글 등 구강관리용품을 주기적으로 사용하십니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  4: { category: '구강관리/양치습관', weight: 3.75, text: '구강관리용품 사용 후 구강건강이 향상되었다고 느끼십니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  5: { category: '구강관리/양치습관', weight: 3.75, text: '양치질을 하루 2회 이상 실천하십니까?', options: ['항상 그렇다','대체로 그렇다','보통이다','가끔 그렇다','전혀 그렇지 않다'] },
  6: { category: '구강관리/양치습관', weight: 3.75, text: '취침 전 양치가 가장 중요하다는 것을 알고 실천 중이십니까?', options: ['항상 그렇다','대체로 그렇다','보통이다','가끔 그렇다','전혀 아니다'] },
  7: { category: '구강관리/양치습관', weight: 3.75, text: '칫솔을 주기적으로 교체하십니까?', options: ['매우 자주 교체한다','자주 교체한다','보통이다','가끔 교체한다','거의 교체하지 않는다'] },
  8: { category: '구강관리/양치습관', weight: 3.75, text: '다양한 양치법이 존재한다는 것을 알고 있으십니까?', options: ['매우 잘 알고 있다','어느 정도 알고 있다','보통이다','잘 모른다','전혀 모른다'] },

  9:  { category: '구취/구강건조', weight: 2, text: '대화할 때 입 냄새가 걱정되는 경우가 자주 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  10: { category: '구취/구강건조', weight: 2, text: '칫솔질 후에도 입안이 텁텁한 느낌이 자주 듭니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  11: { category: '구취/구강건조', weight: 2, text: '혀 표면에 설태(하얀 코팅)가 자주 보이십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  12: { category: '구취/구강건조', weight: 2, text: '스트레스·긴장 상황에서 입 냄새가 심해지는 편이십니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  13: { category: '구취/구강건조', weight: 2, text: '소화불량·역류성 식도질환을 진단받은 적이 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  14: { category: '구취/구강건조', weight: 2, text: '입안이 자주 마르고 말할 때 불편함이 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  15: { category: '구취/구강건조', weight: 2, text: '물을 자주 찾고, 수분 없이는 삼키기 어렵습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  16: { category: '구취/구강건조', weight: 2, text: '침이 끈적거리거나 점도가 증가한 느낌이 드십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  17: { category: '구취/구강건조', weight: 2, text: '입술이 자주 갈라질 정도로 건조하십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  18: { category: '구취/구강건조', weight: 2, text: '밤에 입이 말라서 깨는 경우가 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },

  19: { category: '흡연/음주', weight: 0, text: '현재 흡연을 하고 계십니까? (분기용)', options: ['예','아니오'] },
  20: { category: '흡연/음주', weight: 1.666666667, text: '아침에 일어나자마자 첫 담배를 피우는 편이십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  21: { category: '흡연/음주', weight: 1.666666667, text: '흡연하지 않으면 스트레스가 증가하는 편이십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  22: { category: '흡연/음주', weight: 1.666666667, text: '치과에서 흡연 관련 문제(착색, 염증 등)를 지적받은 적이 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },

  23: { category: '흡연/음주', weight: 0, text: '현재 음주를 하고 계십니까? (분기용)', options: ['예','아니오'] },
  24: { category: '흡연/음주', weight: 1.666666667, text: '주 1회 이상 꾸준히 음주를 즐기십니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  25: { category: '흡연/음주', weight: 1.666666667, text: '음주 후 양치하지 않고 잠든 적이 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  26: { category: '흡연/음주', weight: 1.666666667, text: '단 술(과일소주·칵테일 등)을 즐겨 마시는 편입니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  27: { category: '흡연/음주', weight: 1.666666667, text: '음주 다음날 잇몸 붓기·통증이 나타나는 경우가 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },

  28: { category: '우식성 식품 섭취', weight: 3, text: '탄산음료·주스 등 단 음료를 얼마나 자주 마십니까?', options: ['매일','주 3~4회','주 1~2회','거의 없음','전혀 없음'] },
  29: { category: '우식성 식품 섭취', weight: 3, text: '초콜릿·사탕·젤리 등 단 간식을 얼마나 자주 먹습니까?', options: ['매일','주 3~4회','주 1~2회','거의 없음','전혀 없음'] },
  30: { category: '우식성 식품 섭취', weight: 3, text: '빵·과자·시리얼 등 정제 탄수화물을 식사 외에 자주 섭취하십니까?', options: ['매일','주 3~4회','주 1~2회','거의 없음','전혀 없음'] },
  31: { category: '우식성 식품 섭취', weight: 3, text: '식사 중간(간식)으로 단 음식·끈적한 음식을 먹는 편입니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  32: { category: '우식성 식품 섭취', weight: 3, text: '간식 섭취 후 양치질을 하시는 편입니까?', options: ['항상 한다','자주 한다','가끔 한다','거의 하지 않는다','전혀 하지 않는다'] },

  33: { category: '지각과민/불소', weight: 1.111111111, text: '찬 음식·찬 공기·뜨거운 음식에서 치아가 시린 느낌이 자주 듭니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  34: { category: '지각과민/불소', weight: 1.111111111, text: '음식을 씹을 때 치아가 시리거나 통증을 느낀 적이 있습니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  35: { category: '지각과민/불소', weight: 1.111111111, text: '양치질을 할 때 특정 치아에서 시린 통증이 느껴집니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  36: { category: '지각과민/불소', weight: 1.111111111, text: '단 음식·신 음식을 먹으면 치아가 일시적으로 시린 통증이 나타납니까?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  37: { category: '지각과민/불소', weight: 1.111111111, text: '치아 시림 증상이 일상생활에 불편을 줄 정도로 발생합니까?', options: ['매우 그렇다','그렇다','보통이다','아니다','전혀 아니다'] },
  38: { category: '지각과민/불소', weight: 1.111111111, text: '불소가 충치 예방에 매우 도움이 된다는 사실을 알고 있습니까?', options: ['매우 잘 알고 있다','어느 정도 알고 있다','보통이다','잘 모른다','전혀 모른다'] },
  39: { category: '지각과민/불소', weight: 1.111111111, text: '현재 사용하는 치약에 불소 성분이 있는지 알고 계십니까?', options: ['정확히 알고 있다','어느 정도 알고 있다','보통이다','잘 모른다','전혀 모른다'] },
  40: { category: '지각과민/불소', weight: 1.111111111, text: '치과 방문 시 정기적으로 불소 도포 등 예방치료를 받으십니까?', options: ['항상 받는다','가끔 받는다','받은 적 있다','거의 받지 않는다','전혀 없다'] },
  41: { category: '지각과민/불소', weight: 1.111111111, text: '불소가 포함된 가글액을 거의 매일 사용하십니까?', options: ['항상 사용한다','자주 사용한다','가끔 사용한다','거의 사용하지 않는다','전혀 사용하지 않는다'] },

  42: { category: '구강악습관', weight: 1.666666667, text: '최근까지 손가락을 빠는 습관이 있었거나 현재도 있나요?', options: ['현재 있다','예전에 있었다','없다','전혀 없다'] },
  43: { category: '구강악습관', weight: 1.666666667, text: '평소 입을 벌리고 있거나 입으로 숨 쉬는 경우가 얼마나 있나요?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  44: { category: '구강악습관', weight: 1.666666667, text: '수면 중 이를 심하게 가는 편인가요?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  45: { category: '구강악습관', weight: 1.666666667, text: '평소 식사할 때 한쪽으로만 씹는 편인가요?', options: ['항상 한쪽으로','자주 한쪽으로','가끔 한쪽으로','거의 아니다','전혀 아니다'] },
  46: { category: '구강악습관', weight: 1.666666667, text: '삼킬 때 또는 평소 혀가 앞니 쪽으로 밀리는 습관이 있나요?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
  47: { category: '구강악습관', weight: 1.666666667, text: '평소 턱을 괴는 습관이 얼마나 있나요?', options: ['매우 자주','자주','가끔','거의 없음','전혀 없음'] },
};

/**
 * 2) 라우팅 테이블 (문항번호 -> 응답번호 -> {next, point})
 *    point는 0~5 "원점수(1~5)"이며,
 *    최종 반영점수 = (point/5) * weight
 */
const ROUTING = {
  1: {1:{next:2,point:5},2:{next:2,point:4},3:{next:2,point:3},4:{next:2,point:2},5:{next:2,point:1}},
  2: {1:{next:3,point:5},2:{next:3,point:4},3:{next:3,point:3},4:{next:3,point:2},5:{next:3,point:1}},
  3: {1:{next:4,point:5},2:{next:4,point:4},3:{next:4,point:3},4:{next:5,point:2},5:{next:5,point:1}},
  4: {1:{next:5,point:5},2:{next:5,point:4},3:{next:5,point:3},4:{next:5,point:2},5:{next:5,point:1}},
  5: {1:{next:6,point:5},2:{next:6,point:4},3:{next:6,point:3},4:{next:6,point:2},5:{next:6,point:1}},
  6: {1:{next:7,point:5},2:{next:7,point:4},3:{next:7,point:3},4:{next:7,point:2},5:{next:7,point:1}},
  7: {1:{next:8,point:5},2:{next:8,point:4},3:{next:8,point:3},4:{next:8,point:2},5:{next:8,point:1}},
  8: {1:{next:9,point:5},2:{next:9,point:4},3:{next:9,point:3},4:{next:9,point:2},5:{next:9,point:1}},

  9:  {1:{next:10,point:1},2:{next:10,point:2},3:{next:10,point:3},4:{next:19,point:4},5:{next:19,point:5}},
  10: {1:{next:11,point:1},2:{next:11,point:2},3:{next:11,point:3},4:{next:11,point:4},5:{next:11,point:5}},
  11: {1:{next:12,point:1},2:{next:12,point:2},3:{next:12,point:3},4:{next:12,point:4},5:{next:12,point:5}},
  12: {1:{next:13,point:1},2:{next:13,point:2},3:{next:13,point:3},4:{next:13,point:4},5:{next:13,point:5}},
  13: {1:{next:14,point:1},2:{next:14,point:2},3:{next:14,point:3},4:{next:14,point:4},5:{next:14,point:5}},
  14: {1:{next:15,point:1},2:{next:15,point:2},3:{next:15,point:3},4:{next:15,point:4},5:{next:15,point:5}},
  15: {1:{next:16,point:1},2:{next:16,point:2},3:{next:16,point:3},4:{next:16,point:4},5:{next:16,point:5}},
  16: {1:{next:17,point:1},2:{next:17,point:2},3:{next:17,point:3},4:{next:17,point:4},5:{next:17,point:5}},
  17: {1:{next:18,point:1},2:{next:18,point:2},3:{next:18,point:3},4:{next:18,point:4},5:{next:18,point:5}},
  18: {1:{next:19,point:1},2:{next:19,point:2},3:{next:19,point:3},4:{next:19,point:4},5:{next:19,point:5}},

  19: {1:{next:20,point:0},2:{next:23,point:0}},
  20: {1:{next:21,point:1},2:{next:21,point:2},3:{next:21,point:3},4:{next:21,point:4},5:{next:21,point:5}},
  21: {1:{next:22,point:1},2:{next:22,point:2},3:{next:22,point:3},4:{next:22,point:4},5:{next:22,point:5}},
  22: {1:{next:23,point:1},2:{next:23,point:2},3:{next:23,point:3},4:{next:23,point:4},5:{next:23,point:5}},

  23: {1:{next:24,point:0},2:{next:28,point:0}},
  24: {1:{next:25,point:1},2:{next:25,point:2},3:{next:25,point:3},4:{next:25,point:4},5:{next:25,point:5}},
  25: {1:{next:26,point:1},2:{next:26,point:2},3:{next:26,point:3},4:{next:26,point:4},5:{next:26,point:5}},
  26: {1:{next:27,point:1},2:{next:27,point:2},3:{next:27,point:3},4:{next:27,point:4},5:{next:27,point:5}},
  27: {1:{next:28,point:1},2:{next:28,point:2},3:{next:28,point:3},4:{next:28,point:4},5:{next:28,point:5}},

  28: {1:{next:29,point:1},2:{next:29,point:2},3:{next:29,point:3},4:{next:32,point:4},5:{next:32,point:5}},
  29: {1:{next:30,point:1},2:{next:30,point:2},3:{next:30,point:3},4:{next:32,point:4},5:{next:32,point:5}},
  30: {1:{next:31,point:1},2:{next:31,point:2},3:{next:31,point:3},4:{next:32,point:4},5:{next:32,point:5}},
  31: {1:{next:32,point:1},2:{next:32,point:2},3:{next:32,point:3},4:{next:32,point:4},5:{next:32,point:5}},
  32: {1:{next:33,point:5},2:{next:33,point:4},3:{next:33,point:3},4:{next:33,point:2},5:{next:33,point:1}},

  33: {1:{next:34,point:1},2:{next:34,point:2},3:{next:34,point:3},4:{next:38,point:4},5:{next:38,point:5}},
  34: {1:{next:35,point:1},2:{next:35,point:2},3:{next:35,point:3},4:{next:38,point:4},5:{next:38,point:5}},
  35: {1:{next:36,point:1},2:{next:36,point:2},3:{next:36,point:3},4:{next:38,point:4},5:{next:38,point:5}},
  36: {1:{next:37,point:1},2:{next:37,point:2},3:{next:37,point:3},4:{next:38,point:4},5:{next:38,point:5}},
  37: {1:{next:38,point:1},2:{next:38,point:2},3:{next:38,point:3},4:{next:38,point:4},5:{next:38,point:5}},
  38: {1:{next:39,point:5},2:{next:39,point:4},3:{next:39,point:3},4:{next:39,point:2},5:{next:39,point:1}},
  39: {1:{next:40,point:5},2:{next:40,point:4},3:{next:40,point:3},4:{next:40,point:2},5:{next:40,point:1}},
  40: {1:{next:41,point:5},2:{next:41,point:4},3:{next:41,point:3},4:{next:41,point:2},5:{next:41,point:1}},
  41: {1:{next:42,point:5},2:{next:42,point:4},3:{next:42,point:3},4:{next:42,point:2},5:{next:42,point:1}},

  42: {1:{next:43,point:0},2:{next:43,point:0},3:{next:43,point:5},4:{next:43,point:5}},
  43: {1:{next:44,point:1},2:{next:44,point:2},3:{next:44,point:3},4:{next:44,point:4},5:{next:44,point:5}},
  44: {1:{next:45,point:1},2:{next:45,point:2},3:{next:45,point:3},4:{next:45,point:4},5:{next:45,point:5}},
  45: {1:{next:46,point:1},2:{next:46,point:2},3:{next:46,point:3},4:{next:46,point:4},5:{next:46,point:5}},
  46: {1:{next:47,point:1},2:{next:47,point:2},3:{next:47,point:3},4:{next:47,point:4},5:{next:47,point:5}},
  47: {1:{next:null,point:1},2:{next:null,point:2},3:{next:null,point:3},4:{next:null,point:4},5:{next:null,point:5}},
};

/**
 * 3) "스킵되면 자동 5점" 처리 룰
 *    - current 문항 + 특정 응답번호에 의해 특정 문항들이 스킵되는 경우
 */
const SKIP_RULES = [
  { current: 3,  responses: [4,5], skip: [4] },
  { current: 9,  responses: [4,5], skip: [10,11,12,13,14,15,16,17,18] },
  { current: 19, responses: [2],   skip: [20,21,22] },
  { current: 23, responses: [2],   skip: [24,25,26,27] },
  { current: 28, responses: [4,5], skip: [29,30,31] },
  { current: 33, responses: [4,5], skip: [34,35,36,37] },
];

export default function SurveyComponent({ onSubmit }) {
  const totalQuestions = 47;

  const [currentQ, setCurrentQ] = useState(1);
  const [history, setHistory] = useState([]); // 이전 문항 스택
  const [responses, setResponses] = useState({}); // { [qNum]: responseObj }

  const currentQuestion = QUESTIONS[currentQ];

  const visitedCount = useMemo(() => Object.keys(responses).length, [responses]);
  const progressRatio = (visitedCount / totalQuestions) * 100;
  const progressText = `${visitedCount} / ${totalQuestions}`;

  const getWeightedScore = (qNum, point) => {
    const w = QUESTIONS[qNum].weight;
    if (w === 0) return 0;
    return (point / 5) * w;
  };

  const applyAutoSkipsIfNeeded = (qNum, responseNo, nextResponses) => {
    const rule = SKIP_RULES.find(r => r.current === qNum && r.responses.includes(responseNo));
    if (!rule) return nextResponses;

    rule.skip.forEach(skippedQ => {
      const meta = QUESTIONS[skippedQ];
      const autoPoint = 5;
      const autoWeighted = getWeightedScore(skippedQ, autoPoint);

      nextResponses[skippedQ] = {
        qNum: skippedQ,
        answer: '__SKIPPED__',
        responseNo: null,
        point: autoPoint,
        weightedScore: autoWeighted,
        category: meta.category,
        weight: meta.weight,
        skipped: true,
      };
    });

    return nextResponses;
  };

  const handleSelectOption = (responseNo) => {
    const route = ROUTING[currentQ]?.[responseNo];
    if (!route) return;

    const { next, point } = route;
    const meta = QUESTIONS[currentQ];
    const weightedScore = getWeightedScore(currentQ, point);

    let nextResponses = {
      ...responses,
      [currentQ]: {
        qNum: currentQ,
        answer: meta.options[responseNo - 1],
        responseNo,
        point,
        weightedScore,
        category: meta.category,
        weight: meta.weight,
        skipped: false,
      },
    };

    // 자동 스킵(+5점) 적용
    nextResponses = applyAutoSkipsIfNeeded(currentQ, responseNo, nextResponses);

    // 다음 문항 없으면 종료/제출
    if (next == null) {
      // 카테고리별 raw / max 계산
      const categoryAgg = {};
      Object.values(nextResponses).forEach(r => {
        if (!categoryAgg[r.category]) {
          categoryAgg[r.category] = { raw: 0, max: 0 };
        }
        categoryAgg[r.category].raw += r.weightedScore;
        categoryAgg[r.category].max += r.weight; // 최고 가능 점수는 문항 weight의 합
      });

      const categoryScores = {};
      Object.entries(categoryAgg).forEach(([cat, v]) => {
        const normalized = v.max > 0 ? (v.raw / v.max) * 100 : 0;
        categoryScores[cat] = {
          rawScore: v.raw,
          maxScore: v.max,
          normalizedScore: Math.round(normalized),
        };
      });

      const overallRaw = Object.values(categoryAgg).reduce((s, v) => s + v.raw, 0);
      const overallMax = Object.values(categoryAgg).reduce((s, v) => s + v.max, 0);
      const overallNormalized = overallMax > 0 ? Math.round((overallRaw / overallMax) * 100) : 0;

      onSubmit?.({
        responses: nextResponses,
        categoryScores,
        overall: {
          rawScore: overallRaw,
          maxScore: overallMax,
          normalizedScore: overallNormalized,
        },
      });

      // 리셋
      setCurrentQ(1);
      setHistory([]);
      setResponses({});
      return;
    }

    setResponses(nextResponses);
    setHistory(prev => [...prev, currentQ]);
    setCurrentQ(next);
  };

  const handlePrev = () => {
    if (history.length === 0) return;
    const prevQ = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setCurrentQ(prevQ);
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>설문 데이터가 올바르지 않습니다.</Text>
      </View>
    );
  }

  // 현재 문항의 옵션(응답번호 1..n)
  const optionButtons = currentQuestion.options.map((label, idx) => ({
    label,
    responseNo: idx + 1,
  }));

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
            <Text style={styles.sectionTag}>{currentQuestion.category}</Text>
            <View style={styles.questionIcon}>
              <Text style={styles.questionIconText}>🦷</Text>
            </View>
            <Text style={styles.questionTitle}>
              Q{currentQ}. {currentQuestion.text}
            </Text>

            <Text style={styles.questionSub}>
              (문항 최대 {currentQuestion.weight}점)
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {optionButtons.map((opt) => (
              <TouchableOpacity
                key={`${currentQ}_${opt.responseNo}`}
                onPress={() => handleSelectOption(opt.responseNo)}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={history.length === 0}
            style={[
              styles.navBtn,
              history.length === 0 && styles.navBtnDisabled,
            ]}
          >
            <Text style={styles.navBtnText}>이전</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  progressSection: { marginBottom: 20 },
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
  questionCard: { flex: 1, marginBottom: 20 },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTag: {
    fontSize: 18,
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
  questionIconText: { fontSize: 32 },
  questionTitle: {
    color: '#374151',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  questionSub: {
    color: '#9ca3af',
    fontSize: 13,
  },
  optionsContainer: { gap: 12 },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    color: '#111827',
    fontWeight: '600',
  },
});
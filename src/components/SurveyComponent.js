import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * =========================================
 * 1) 문항 메타데이터 정의 (QUESTIONS) Object 구조
 * =========================================
 * - key: 문항 번호 (1 ~ 47)
 * - value: {
 *     category: 카테고리 이름 (예: '구강관리/양치습관'),
 *     weight: 문항별 최대 반영 점수 (이 문항이 최대 몇 점까지 기여하는지),
 *     text: 실제 질문 문구,
 *     options: 화면에 보여줄 선택지 배열 (index 0 → 응답번호 1)
 *   }
 *
 * - 사용 예:
 *   QUESTIONS[1].text         → 1번 문항 질문 텍스트
 *   QUESTIONS[1].options[0]   → 1번 문항 1번 선택지 라벨
 *   QUESTIONS[1].weight       → 1번 문항이 기여할 수 있는 최대 점수 (3.75점)
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
 * ============================================
 * 2) 라우팅 테이블 (ROUTING) Object 구조
 * ============================================
 * - 각 문항 번호(qNum)와 응답 번호(responseNo)별로
 *   "다음 문항 번호(next)"와 "원점수(point)"를 정의.
 *
 * - 구조:
 *   ROUTING[문항번호][응답번호] = { next, point }
 *
 *   예시)
 *   ROUTING[1][1] = { next: 2, point: 5 }
 *   → 1번 문항에서 1번 응답을 선택하면,
 *      다음 문항은 2번, 이 문항의 원점수는 5점.
 *
 * - 점수 계산 로직:
 *   1) point: 1~5 사이의 원점수
 *   2) weight: QUESTIONS[qNum].weight
 *   3) 최종 반영 점수(weightedScore) = (point / 5) * weight
 *
 * - 설문 흐름(분기/스킵)은 전부 이 테이블로 제어됨.
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
 * ======================================================
 * 3) SKIP_RULES: "스킵 시 자동 5점 처리" 규칙 Object의 배열 형태
 * ======================================================
 * - 특정 문항에서 특정 응답을 했을 때
 *   "중간 문항들을 건너뛰고(next로 바로 점프)" + "스킵된 문항은 자동 5점 처리" 하는 룰.
 *
 * - 구조:
 *   {
 *     current: 현재 문항 번호,
 *     responses: [이 응답번호들 중 하나이면],
 *     skip: [자동으로 건너뛸 문항 번호들]
 *   }
 *
 * - 예시)
 *   { current: 9, responses: [4,5], skip: [10,11,...,18] }
 *   → 9번에서 4번 or 5번 응답을 하면,
 *      10~18번 문항은 실제로 안 물어보고,
 *      각 문항에 대해 "자동 5점"을 부여한 뒤 19번으로 이동.
 */
const SKIP_RULES = [
  { current: 3,  responses: [4,5], skip: [4] },
  { current: 9,  responses: [4,5], skip: [10,11,12,13,14,15,16,17,18] },
  { current: 19, responses: [2],   skip: [20,21,22] },
  { current: 23, responses: [2],   skip: [24,25,26,27] },
  { current: 28, responses: [4,5], skip: [29,30,31] },
  { current: 33, responses: [4,5], skip: [34,35,36,37] },
];

/**
 * ============================================
 * 메인 설문 컴포넌트
 * ============================================
 * - props:
 *   - onSubmit(result)
 *     → 마지막 문항까지 완료되었을 때
 *        전체 응답/카테고리별 점수/총점 등을 상위로 전달.
 */
export default function SurveyComponent({ onSubmit }) {
  const totalQuestions = 47; // 전체 문항 수 (진행도 표시용)

  /**
   * currentQ
   * - 현재 화면에 표시 중인 문항 번호 (1~47)
   */
  const [currentQ, setCurrentQ] = useState(1); // 기본값 1 (1로 시작)

  /**
   * history
   * - "이전 문항 번호"들을 쌓아두는 스택.
   * - '이전' 버튼을 눌렀을 때 이 배열의 마지막 값을 가져와서 되돌아감.
   */
  const [history, setHistory] = useState([]);

  /**
   * responses
   * - 이미 응답한 문항들의 정보를 저장하는 객체.
   * - 구조:
   *   {
   *     [qNum]: {
   *       qNum: 문항 번호,
   *       answer: 선택지 텍스트 (또는 '__SKIPPED__'),
   *       responseNo: 응답 번호 (1~5, 스킵 시 null),
   *       point: 원점수 (1~5 또는 스킵 시 5),
   *       weightedScore: 가중치 반영 점수,
   *       category: 카테고리 이름,
   *       weight: 문항 weight,
   *       skipped: 스킵 여부(boolean)
   *     },
   *     ...
   *   }
   */
  const [responses, setResponses] = useState({});

  // 현재 문항의 메타데이터 (문구 / 카테고리 / weight / 옵션 등)
  const currentQuestion = QUESTIONS[currentQ];

  /**
   * visitedCount
   * - 응답/자동스킵을 통해 responses에 저장된 문항 수.
   * - 설문이 끝난 뒤에도 responses에는 스킵 문항이 포함되어 있음.
   * useMemo를 통해 responses 객체가 바뀔 때마다 Object.keys(responses).length를 다시 계산한다.
   */
  const visitedCount = useMemo(() => Object.keys(responses).length, [responses]);

  /**
   * progressRatio
   * - 전체 문항 대비 현재까지 처리된 문항 비율(%) → 진행도 바에 사용.
   * - 모든 문항을 실제로 다 물어본 건 아니지만,
   *   "점수 계산 대상" 기준으로 진행도를 표시한다고 보면 됨.
   */
  const progressRatio = (visitedCount / totalQuestions) * 100;

  /**
   * progressText
   * - "현재 처리된 문항 수 / 전체 문항 수" 텍스트 표시.
   *   예: "12 / 47" 나누기 아니고 텍스트형태임.
   */
  const progressText = `${visitedCount} / ${totalQuestions}`;

  /**
   * getWeightedScore(qNum, point)
   * - 특정 문항(qNum)에 대해 원점수(point: 1~5)를 받아
   *   weight를 적용한 최종 점수를 계산.
   * - 분기 문항은 0점으로 처리
   * - weight가 0인 문항(예: 19, 23번)은 점수 계산에서 제외되며 항상 0점.
   */
  const getWeightedScore = (qNum, point) => {
    const w = QUESTIONS[qNum].weight;
    if (w === 0) return 0;
    return (point / 5) * w;
  };

  /**
   * applyAutoSkipsIfNeeded(qNum, responseNo, nextResponses)
   * -------------------------------------------------------
   * - 건너뛴다는 것은 해당 항목에서 이미 우수한 상태 
   * - 현재 문항(qNum)과 선택된 응답(responseNo)에 따라
   *   SKIP_RULES를 확인해서 "건너뛰어야 하는 문항들"에
   *   자동으로 5점을 부여하고 responses에 추가.
   *
   * - nextResponses는 기존 응답 + 이번 응답을 반영한 객체이며,
   *   이 함수는 스킵된 문항까지 채운 새로운 객체를 반환.
   */
  const applyAutoSkipsIfNeeded = (qNum, responseNo, nextResponses) => {
    // 현재 문항과 응답번호에 해당하는 스킵 룰 찾기
    const rule = SKIP_RULES.find(
      (r) => r.current === qNum && r.responses.includes(responseNo)
    );
    if (!rule) return nextResponses;

    // 스킵 대상 문항들에 대해 자동 5점 부여
    rule.skip.forEach((skippedQ) => {
      const meta = QUESTIONS[skippedQ];
      const autoPoint = 5; // 자동 스킵시 항상 5점 처리
      const autoWeighted = getWeightedScore(skippedQ, autoPoint);

      nextResponses[skippedQ] = {
        qNum: skippedQ,
        answer: '__SKIPPED__', // 실제로 질문하지 않았음을 표시
        responseNo: null,      // 사용자가 직접 선택한 응답이 아니므로 null
        point: autoPoint,
        weightedScore: autoWeighted,
        category: meta.category,
        weight: meta.weight,
        skipped: true,
      };
    });

    return nextResponses;
  };

  /**
   * handleSelectOption(responseNo)
   * ---------------------------------------
   * - 사용자가 현재 문항(currentQ)에서
   *   특정 응답(responseNo: 1~5)을 눌렀을 때 호출되는 핸들러.
   *
   *  처리 순서:
   *  1) ROUTING에서 (currentQ, responseNo)에 대응하는 { next, point } 조회
   *  2) 현재 문항에 대한 weightedScore 계산
   *  3) responses에 현재 문항 응답 저장
   *  4) SKIP_RULES에 따라 자동스킵 문항들에 5점 부여
   *  5) next가 null이면 설문 종료 → onSubmit 호출 + 상태 리셋
   *  6) next가 존재하면 history에 현재 문항 push 후, currentQ를 next로 변경
   */
  const handleSelectOption = (responseNo) => {
    // 현재 문항/응답에 해당하는 라우팅 데이터 조회
    const route = ROUTING[currentQ]?.[responseNo];
    if (!route) return; // 잘못된 응답번호일 경우 방어 코드

    const { next, point } = route;
    const meta = QUESTIONS[currentQ];

    // 현재 문항의 가중치 반영 점수 계산
    const weightedScore = getWeightedScore(currentQ, point);

    // 기존 응답(responses)에 현재 문항 응답을 합쳐서 새로운 응답 객체 생성
    let nextResponses = {
      ...responses, //스페레드 연산자로 기존의 모든 응답을 그대로 복사하고 현재 문항에 대한 응답을 덮어씌우거나 새로 추가함.
      [currentQ]: {
        qNum: currentQ,
        answer: meta.options[responseNo - 1], // 라벨 텍스트
        responseNo,                           // 응답 번호(1~5)
        point,                                // 원점수(1~5)
        weightedScore,                        // 가중치 적용 점수
        category: meta.category,
        weight: meta.weight,
        skipped: false,                       // 직접 응답했으므로 false
      },
    };

    // 자동 스킵(+5점) 규칙이 있다면 nextResponses에 반영
    nextResponses = applyAutoSkipsIfNeeded(currentQ, responseNo, nextResponses);

    /**
     * 다음 문항(next)이 null이면,
     * → 설문이 종료되었다는 뜻이므로
     *    카테고리별 점수 / 전체 점수를 계산한 뒤 onSubmit으로 전달하고,
     *    상태를 초기화.
     */
    if (next == null) {
      // 1) 카테고리별 raw / max 합산
      const categoryAgg = {};
      Object.values(nextResponses).forEach((r) => {
        if (!categoryAgg[r.category]) {
          categoryAgg[r.category] = { raw: 0, max: 0 };
        }
        categoryAgg[r.category].raw += r.weightedScore; // 실제 획득 점수 합
        categoryAgg[r.category].max += r.weight;        // 해당 카테고리 이론상 최대점 합
      });

      // 2) 카테고리별 정규화 점수(0~100) 계산
      const categoryScores = {};
      Object.entries(categoryAgg).forEach(([cat, v]) => {
        const normalized = v.max > 0 ? (v.raw / v.max) * 100 : 0;
        categoryScores[cat] = {
          rawScore: v.raw,
          maxScore: v.max,
          normalizedScore: Math.round(normalized),
        };
      });

      // 3) 전체 총점/최대점/정규화 점수 계산
      const overallRaw = Object.values(categoryAgg).reduce(
        (s, v) => s + v.raw,
        0
      );
      const overallMax = Object.values(categoryAgg).reduce(
        (s, v) => s + v.max,
        0
      );
      const overallNormalized =
        overallMax > 0 ? Math.round((overallRaw / overallMax) * 100) : 0;

      // 4) 상위 컴포넌트로 결과 전달
      onSubmit?.({
        responses: nextResponses,    // 문항별 상세 응답/점수
        categoryScores,              // 카테고리별 점수
        overall: {
          rawScore: overallRaw,
          maxScore: overallMax,
          normalizedScore: overallNormalized,
        },
      });

      // 5) 설문 상태 리셋 (다시 처음부터 시작할 수 있게)
      setCurrentQ(1);
      setHistory([]);
      setResponses({});
      return;
    }

    // 다음 문항(next)이 있는 경우:
    // - 응답 상태 업데이트
    setResponses(nextResponses);
    // - history에 현재 문항을 push (뒤로가기용)
    setHistory((prev) => [...prev, currentQ]);
    // - 현재 문항을 next로 변경
    setCurrentQ(next);
  };

  /**
   * handlePrev()
   * ---------------------------------------
   * - '이전' 버튼 눌렀을 때 호출.
   * - history 스택의 마지막 값을 꺼내서 currentQ로 설정.
   * - 현재 코드에서는 responses에서 해당 문항의 응답을 지우지는 않음.
   *   (필요하다면 '뒤로 갔을 때 응답 취소' 로직을 추가할 수 있음)
   */
  const handlePrev = () => {
    if (history.length === 0) return; // 더 이상 이전이 없으면 무시

    const prevQ = history[history.length - 1]; // 스택의 마지막 문항 번호
    // 마지막 하나를 제거한 새 history로 교체
    setHistory((h) => h.slice(0, -1));
    // 현재 문항을 이전 문항으로 설정
    setCurrentQ(prevQ);
  };

  /**
   * currentQuestion이 없으면 설문 정의가 잘못된 상태이므로
   * 간단한 에러 메시지를 표시.
   */
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text>설문 데이터가 올바르지 않습니다.</Text>
      </View>
    );
  }

  /**
   * 현재 문항에서 사용할 "옵션 버튼 리스트" 생성
   * - label: 버튼에 찍히는 텍스트
   * - responseNo: ROUTING에 전달할 응답 번호 (1~5)
   */
  const optionButtons = currentQuestion.options.map((label, idx) => ({
    label,
    responseNo: idx + 1,
  }));

  /**
   * ================================
   * 실제 렌더링 영역
   * ================================
   */
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 상단 진행도 영역 */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            {/* progressRatio% 만큼 채워지는 진행도 바 */}
            <View
              style={[styles.progressFill, { width: `${progressRatio}%` }]}
            />
          </View>
          {/* "처리된 문항 수 / 전체 문항 수" 텍스트 */}
          <Text style={styles.progressText}>{progressText}</Text>
        </View>

        {/* 질문 카드 영역 */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            {/* 카테고리 태그 */}
            <Text style={styles.sectionTag}>{currentQuestion.category}</Text>

            {/* 아이콘 (구강 관련 이모지) */}
            <View style={styles.questionIcon}>
              <Text style={styles.questionIconText}>🦷</Text>
            </View>

            {/* 실제 질문 텍스트 */}
            <Text style={styles.questionTitle}>
              Q{currentQ}. {currentQuestion.text}
            </Text>

            {/* 해당 문항의 최대 점수 안내 */}
            <Text style={styles.questionSub}>
              (문항 최대 {currentQuestion.weight}점)
            </Text>
          </View>

          {/* 선택지 버튼 리스트 */}
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

        {/* 하단 네비게이션 영역 (이전 버튼만 존재) */}
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

/**
 * ============================================
 * 스타일 정의
 * ============================================
 * - 전체적으로 카드 형태의 설문 화면 레이아웃
 * - Tailwind 느낌의 색상 팔레트 사용
 */
const styles = StyleSheet.create({
  // 전체 컨테이너: 화면 전체를 차지
  container: { flex: 1 },

  // 메인 카드 영역
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  // 진행도 영역 (위쪽 마진)
  progressSection: { marginBottom: 20 },

  // 진행도 바 배경
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },

  // 진행도 채워지는 부분 (width를 %로 제어)
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },

  // 진행도 텍스트 (예: "10 / 47")
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },

  // 질문 카드 전체 영역
  questionCard: { flex: 1, marginBottom: 20 },

  // 질문 상단 헤더 (카테고리, 아이콘, 질문 텍스트 등)
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  // 카테고리 태그 스타일
  sectionTag: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },

  // 아이콘 배경 (원형)
  questionIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#dcfce7',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  // 아이콘 텍스트 (이모지)
  questionIconText: { fontSize: 32 },

  // 질문 제목 텍스트
  questionTitle: {
    color: '#374151',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },

  // 보조 설명 (문항 최대 점수 안내)
  questionSub: {
    color: '#9ca3af',
    fontSize: 13,
  },

  // 선택지 컨테이너: 선택지 간 간격
  optionsContainer: { gap: 12 },

  // 개별 선택지 버튼 스타일
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

  // 선택지 텍스트 스타일
  optionButtonText: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
  },

  // 네비게이션 영역 (이전 버튼 한 줄)
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },

  // '이전' 버튼 스타일
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },

  // 비활성화된 버튼 스타일 (투명도만 낮춤)
  navBtnDisabled: {
    opacity: 0.5,
  },

  // '이전' 버튼 텍스트 스타일
  navBtnText: {
    color: '#111827',
    fontWeight: '600',
  },
});
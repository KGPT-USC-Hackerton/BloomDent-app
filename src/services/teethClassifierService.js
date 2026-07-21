// src/services/teethClassifierService.js
import { NativeModules } from 'react-native';

const { TeethClassifier } = NativeModules;

if (!TeethClassifier) {
  console.warn(
    '[TeethClassifier] Native module not found. iOS 브릿지 링크 확인 필요',
  );
}

/**
 * imageBase64: "data:image/jpeg;base64,...." 형태라면
 * 앞의 "data:..." 부분을 잘라낸 순수 base64 문자열을 넘기는 게 좋습니다.
 */
export async function classifyTeethRegion(imageBase64) {
  if (!TeethClassifier) {
    throw new Error('TeethClassifier native module is not linked');
  }

  // 필요시 prefix 제거
  const pureBase64 = imageBase64.includes(',')
    ? imageBase64.split(',')[1]
    : imageBase64;

  // Swift infer(...) 호출 → [Float32] 배열이 온다고 가정
  const rawResults = await TeethClassifier.infer(pureBase64);

  // 예: [p_lower, p_upper, p_front]
  const labels = ['upper', 'lower', 'front'];

  const predictions = rawResults.map((score, idx) => ({
    label: labels[idx],
    score,
  }));

  // score 내림차순 정렬 후 Top-1 반환
  predictions.sort((a, b) => b.score - a.score);

  const top1 = predictions[0];

  return {
    top1, // { label: 'upper', score: 0.xx }
    all: predictions, // 전체 확률
  };
}

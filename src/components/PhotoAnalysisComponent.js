import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const ANALYSIS_DELAY_MS = 2000;

const mockAnalysisResult = {
  score: 82,
  issues: [
    { type: 'warning', text: '치석이 약간 보입니다' },
    { type: 'good', text: '잇몸 상태가 양호합니다' },
    { type: 'info', text: '정기 검진을 권장합니다' },
  ],
  recommendations: [
    '하루 2회 이상 양치질',
    '치실 사용 권장',
    '정기 스케일링 (6개월마다)',
  ],
};

export default function PhotoAnalysisComponent({ onReset }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pickerError, setPickerError] = useState(null);
  const timeoutRef = useRef(null);

  const clearAnalysisTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearAnalysisTimeout();
    setSelectedAsset(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setPickerError(null);
    onReset?.();
  }, [clearAnalysisTimeout, onReset]);

  const runMockAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setIsAnalyzing(true);

    timeoutRef.current = setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
      setIsAnalyzing(false);
      timeoutRef.current = null;
    }, ANALYSIS_DELAY_MS);
  }, []);

  const handlePickerResult = useCallback(
    response => {
      if (!response || response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setPickerError(
          response.errorMessage || '사진을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.'
        );
        return;
      }

      const asset = response.assets?.[0];

      if (!asset?.uri) {
        setPickerError('선택한 사진의 경로를 확인할 수 없습니다.');
        return;
      }

      clearAnalysisTimeout();
      setPickerError(null);
      setSelectedAsset(asset);
      runMockAnalysis();
    },
    [clearAnalysisTimeout, runMockAnalysis]
  );

  const handleLaunch = useCallback(
    async type => {
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
        saveToPhotos: type === 'camera',
      };

      try {
        const response =
          type === 'camera'
            ? await launchCamera(options)
            : await launchImageLibrary(options);

        handlePickerResult(response);
      } catch (error) {
        setPickerError('사진을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    },
    [handlePickerResult]
  );

  const handleUploadPress = useCallback(() => {
    Alert.alert('사진 선택', '사진을 촬영하거나 앨범에서 선택해주세요.', [
      { text: '앨범에서 선택', onPress: () => handleLaunch('library') },
      { text: '카메라로 촬영', onPress: () => handleLaunch('camera') },
      { text: '취소', style: 'cancel' },
    ]);
  }, [handleLaunch]);

  useEffect(() => () => resetState(), [resetState]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {!selectedAsset ? (
          <View style={styles.photoUploadSection}>
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
            <Text style={styles.photoTitle}>구강 사진을 촬영해주세요</Text>
            <Text style={styles.photoSubtext}>
              AI가 사진을 분석하여 구강 건강 상태를 알려드립니다
            </Text>
            <TouchableOpacity onPress={handleUploadPress} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>📤 사진 촬영하기</Text>
            </TouchableOpacity>
            {pickerError ? <Text style={styles.errorText}>{pickerError}</Text> : null}
          </View>
        ) : (
          <View style={styles.analysisSection}>
            <View style={styles.photoPreview}>
              {selectedAsset?.uri ? (
                <Image source={{ uri: selectedAsset.uri }} style={styles.photoPreviewImage} />
              ) : (
                <Text style={styles.photoPreviewText}>촬영된 사진</Text>
              )}
            </View>
            {isAnalyzing ? (
              <View style={styles.loadingSection}>
                <Text style={styles.loadingText}>AI 분석 중...</Text>
              </View>
            ) : (
              analysisResult && (
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

                  <TouchableOpacity onPress={resetState} style={styles.resetButton}>
                    <Text style={styles.resetButtonText}>다시 분석하기</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
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
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 12,
    color: '#ef4444',
  },
  analysisSection: {
    gap: 16,
  },
  photoPreview: {
    height: 140,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreviewText: {
    color: '#6b7280',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  loadingSection: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#3b82f6',
  },
  resultSection: {
    gap: 16,
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2563eb',
  },
  scoreLabel: {
    color: '#6b7280',
    marginTop: 4,
  },
  issuesSection: {
    gap: 8,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
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
  resetButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});

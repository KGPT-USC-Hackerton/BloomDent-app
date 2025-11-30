import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage, pollAnalysisStatus, deleteImage, pollHistoryAnalysisStatus } from '../services/imageService';
import { getUser } from '../utils/storage';
import CameraGuideComponent from './CameraGuideComponent';

const TOTAL_IMAGES = 3;
const POSITION_LABELS = {
  upper: '윗니',
  lower: '아랫니',
  front: '앞니',
  null: '선택 안함',
};

export default function PhotoAnalysisComponent({ onReset }) {
  // 3장의 이미지 정보 배열
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pickerError, setPickerError] = useState(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [currentCameraPosition, setCurrentCameraPosition] = useState(null);
  const [isPhotoSessionStarted, setIsPhotoSessionStarted] = useState(false);
  const [lastCapturedImageId, setLastCapturedImageId] = useState(null); // 마지막으로 촬영한 이미지의 uploadedImageId
  const imagesRef = useRef([]); // 최신 images 상태 추적용
  
  // images 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const resetState = useCallback(() => {
    setImages([]);
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadProgress(0);
    setPickerError(null);
    setIsPhotoSessionStarted(false);
    onReset?.();
  }, [onReset]);

  /**
   * 분석 결과를 UI 형식으로 변환
   */
  const formatAnalysisResult = useCallback((analysisData) => {
    const analysis = analysisData.analysis;
    if (!analysis) return null;

    const issues = [];
    const recommendations = [];

    // 교합 상태
    if (analysis.occlusion?.status) {
      issues.push({
        type: analysis.occlusion.status === '정상' ? 'good' : 'warning',
        text: `교합 상태: ${analysis.occlusion.status}${analysis.occlusion.comment ? ` - ${analysis.occlusion.comment}` : ''}`,
      });
    }

    // 충치 감지
    if (analysis.cavity?.detected) {
      issues.push({
        type: 'warning',
        text: `충치 감지됨${analysis.cavity.locations?.length > 0 ? ` (위치: ${analysis.cavity.locations.join(', ')})` : ''}${analysis.cavity.comment ? ` - ${analysis.cavity.comment}` : ''}`,
      });
    } else if (analysis.cavity?.detected === false) {
      issues.push({
        type: 'good',
        text: '충치가 감지되지 않았습니다',
      });
    }

    // AI 신뢰도
    if (analysis.ai_confidence) {
      issues.push({
        type: 'info',
        text: `AI 분석 신뢰도: ${analysis.ai_confidence}%`,
      });
    }

    // 추천 사항
    if (analysis.recommendations) {
      const recs = analysis.recommendations.split('\n').filter(r => r.trim());
      recommendations.push(...recs);
    }

    return {
      score: analysis.overall_score ? Math.round(analysis.overall_score * 10) : null,
      issues,
      recommendations,
      rawAnalysis: analysis,
    };
  }, []);

  /**
   * 이미지 추가 (로컬에만 저장, 업로드는 나중에)
   */
  const addImage = useCallback(async (asset, position) => {
    const imageId = Date.now();
    
    // 이미지 추가 (대기 중 상태)
    setImages(prev => {
      const newImages = [...prev];
      newImages.push({
        id: imageId,
        asset,
        position,
        uploadedImageId: null,
        historyId: null, // history_id 저장
        analysisResult: null,
        status: 'pending', // 'pending' | 'uploading' | 'uploaded' | 'analyzing' | 'completed' | 'failed'
        error: null,
      });
      return newImages;
    });
    setPickerError(null);
  }, []);

  /**
   * 이미지 삭제 (로컬 상태, Cloudinary, DB 모두에서 삭제)
   */
  const removeImage = useCallback(async (imageId) => {
    // 현재 이미지 정보 찾기
    const imageToRemove = images.find(img => img.id === imageId);
    
    if (!imageToRemove) {
      return;
    }

    // 업로드 완료된 이미지인 경우 Cloudinary와 DB에서도 삭제
    if (imageToRemove.uploadedImageId) {
      try {
        await deleteImage(imageToRemove.uploadedImageId);
        console.log('✅ 이미지 삭제 완료 (Cloudinary & DB):', imageToRemove.uploadedImageId);
      } catch (error) {
        console.error('❌ 이미지 삭제 오류:', error);
        // 삭제 실패해도 로컬 상태에서는 제거 (사용자 경험을 위해)
      }
    }

    // 로컬 상태에서 제거
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, [images]);

  /**
   * 이미지 업로드 및 분석 시작
   */
  const startAnalysis = useCallback(async () => {
    // 이미지 개수 확인 (3개가 아니면 경고)
    if (images.length !== TOTAL_IMAGES) {
      Alert.alert(
        '사진 부족',
        `사진 ${TOTAL_IMAGES}장을 모두 촬영해주세요. (현재: ${images.length}장)`
      );
      return;
    }

    // 업로드 대기 중인 이미지만 필터링
    const pendingImages = images.filter(img => img.status === 'pending' || img.status === 'failed');
    
    if (pendingImages.length === 0) {
      // 이미 업로드된 이미지가 있는 경우 (재시도)
      const uploadedImages = images.filter(img => img.status === 'uploaded' && img.uploadedImageId);
      if (uploadedImages.length === TOTAL_IMAGES) {
        // history_id 확인
        const historyIds = uploadedImages.map(img => img.historyId).filter(Boolean);
        const uniqueHistoryIds = [...new Set(historyIds)];
        
        setIsAnalyzing(true);
        setUploadProgress(50);
        
        if (uniqueHistoryIds.length === 1 && uniqueHistoryIds[0]) {
          // 같은 history_id를 사용하는 경우 - 새로운 API 사용
          try {
            await startAnalysisWithHistoryId(uniqueHistoryIds[0], uploadedImages);
          } catch (error) {
            console.warn('History API 분석 실패, 개별 분석으로 fallback:', error);
            // History API 실패 시 기존 방식으로 fallback
            await startAnalysisForUploadedImages(uploadedImages);
          }
        } else {
          // 기존 방식으로 개별 분석 (fallback)
          await startAnalysisForUploadedImages(uploadedImages);
        }
        return;
      }
    }

    try {
      setIsUploading(true);
      setIsAnalyzing(false);
      setUploadProgress(0);
      setPickerError(null);

      const user = await getUser();
      const userId = user?.id || null;

      // 모든 이미지 업로드 시작
      const uploadPromises = images.map(async (img) => {
        // 이미 업로드된 이미지는 스킵
        if (img.uploadedImageId) {
          return { imageId: img.id, uploadedImageId: img.uploadedImageId };
        }

        // 업로드 중 상태로 변경
        setImages(prev => prev.map(i => 
          i.id === img.id ? { ...i, status: 'uploading' } : i
        ));

        try {
          const uploadResponse = await uploadImage(
            img.asset,
            {
              user_id: userId,
              image_type: 'oral_care',
              position: img.position,
            },
            (progress) => {
              // 전체 업로드 진행률 계산
              const uploadedCount = images.filter(i => 
                i.status === 'uploaded' || (i.id === img.id && progress === 100)
              ).length;
              const currentProgress = (uploadedCount / images.length) * 50; // 업로드는 0-50%
              setUploadProgress(currentProgress);
            }
          );

          console.log('업로드 응답:', JSON.stringify(uploadResponse, null, 2));

          if (!uploadResponse.success || !uploadResponse.data?.image_id) {
            throw new Error(uploadResponse.message || '이미지 업로드에 실패했습니다.');
          }

          const uploadedImageId = uploadResponse.data.image_id;
          const historyId = uploadResponse.data.history_id || null; // history_id 추출 (없을 수 있음)
          
          console.log(`이미지 ${img.id} 업로드 완료 - image_id: ${uploadedImageId}, history_id: ${historyId}`);

          // 업로드 완료 상태로 변경 (history_id도 함께 저장)
          setImages(prev => prev.map(i => 
            i.id === img.id 
              ? { ...i, uploadedImageId, historyId, status: 'uploaded' } 
              : i
          ));

          return { imageId: img.id, uploadedImageId, historyId };
        } catch (error) {
          console.error(`이미지 ${img.id} 업로드 오류:`, error);
          
          let errorMessage = '이미지 업로드 중 오류가 발생했습니다.';
          if (error.status === 0) {
            errorMessage = '네트워크 연결을 확인해주세요.';
          } else if (error.message) {
            errorMessage = error.message;
          }

          setImages(prev => prev.map(i => 
            i.id === img.id 
              ? { ...i, status: 'failed', error: errorMessage } 
              : i
          ));
          
          throw error;
        }
      });

      const uploadResults = await Promise.allSettled(uploadPromises);
      
      // 업로드 실패한 이미지 확인
      const failedUploads = uploadResults.filter(result => result.status === 'rejected');
      if (failedUploads.length > 0) {
        Alert.alert(
          '업로드 실패',
          `${failedUploads.length}장의 이미지 업로드에 실패했습니다. 다시 시도해주세요.`
        );
        setIsUploading(false);
        return;
      }

      // 업로드 완료 - history_id 추출 (분석은 하지 않음)
      const uploadedImages = images.map(img => {
        const result = uploadResults.find(r => 
          r.status === 'fulfilled' && r.value.imageId === img.id
        );
        if (result && result.status === 'fulfilled') {
          return { 
            ...img, 
            uploadedImageId: result.value.uploadedImageId, 
            historyId: result.value.historyId || null,
            status: 'uploaded' 
          };
        }
        return img;
      }).filter(img => img.uploadedImageId);

      // 업로드만 완료 (분석은 시작하지 않음)
      setIsUploading(false);
      setUploadProgress(100);
      
      if (uploadedImages.length === TOTAL_IMAGES) {
        Alert.alert('업로드 완료', '모든 이미지 업로드가 완료되었습니다. 분석하기 버튼을 눌러주세요.');
      }
    } catch (error) {
      console.error('업로드/분석 오류:', error);
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
      
      let errorMessage = '업로드 중 오류가 발생했습니다.';
      
      if (error.status === 0) {
        errorMessage = '네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 백엔드 서버 로그를 확인해주세요.';
      }
      
      setPickerError(errorMessage);
    }
  }, [images, startAnalysisForUploadedImages, startAnalysisWithHistoryId]);

  /**
   * History ID를 사용한 분석 시작 (3개 사진 세트)
   */
  const startAnalysisWithHistoryId = useCallback(async (historyId, uploadedImages) => {
    try {
      // 모든 이미지를 분석 중 상태로 변경
      setImages(prev => prev.map(i => 
        uploadedImages.some(u => u.id === i.id) 
          ? { ...i, status: 'analyzing' } 
          : i
      ));

      // History ID로 분석 결과 폴링
      const analysisResponse = await pollHistoryAnalysisStatus(historyId, {
        interval: 2500,
        maxAttempts: 60,
        onStatusChange: (status, attemptCount) => {
          console.log(`History ${historyId} 분석 상태: ${status} (시도 ${attemptCount}회)`);
          // 진행률 업데이트 (분석 단계: 50-100%)
          const progress = status === 'completed' ? 100 : 50 + (attemptCount / 60) * 50;
          setUploadProgress(Math.min(progress, 100));
        },
      });

      if (!analysisResponse.success || !analysisResponse.data) {
        throw new Error(analysisResponse.message || '분석 결과를 가져올 수 없습니다.');
      }

      const { upper, lower, front } = analysisResponse.data;

      // 각 위치별로 분석 결과 저장
      setImages(prev => {
        const updated = prev.map(img => {
          let analysisResult = null;
          
          if (img.position === 'upper' && upper?.analysis) {
            analysisResult = formatAnalysisResult({ analysis: upper.analysis });
          } else if (img.position === 'lower' && lower?.analysis) {
            analysisResult = formatAnalysisResult({ analysis: lower.analysis });
          } else if (img.position === 'front' && front?.analysis) {
            analysisResult = formatAnalysisResult({ analysis: front.analysis });
          }

          if (analysisResult) {
            return { ...img, analysisResult, status: 'completed' };
          }
          
          return img;
        });

        // 진행률 업데이트
        const completedCount = updated.filter(i => i.status === 'completed').length;
        const progress = 50 + (completedCount / TOTAL_IMAGES) * 50;
        setUploadProgress(Math.min(progress, 100));

        return updated;
      });

      // 전체 진행률 100%
      setUploadProgress(100);
      setIsAnalyzing(false);

      // 분석 완료 알림
      const allCompleted = uploadedImages.every(img => {
        const currentImg = imagesRef.current.find(i => i.id === img.id);
        return currentImg?.status === 'completed';
      });

      if (allCompleted) {
        Alert.alert('분석 완료', '모든 이미지의 분석이 완료되었습니다.');
      }
    } catch (error) {
      console.error('분석 오류:', error);
      setIsAnalyzing(false);
      setUploadProgress(0);
      
      // 실패한 이미지 표시
      const errorMessageText = error?.message || error?.toString() || '분석 실패';
      setImages(prev => prev.map(i => 
        uploadedImages.some(u => u.id === i.id) && i.status !== 'completed'
          ? { ...i, status: 'failed', error: errorMessageText }
          : i
      ));

      let errorMessage = '분석 중 오류가 발생했습니다.';
      
      if (error.status === 0) {
        errorMessage = '네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 백엔드 서버 로그를 확인해주세요.';
      }
      
      setPickerError(errorMessage);
    }
  }, [formatAnalysisResult]);

  /**
   * 업로드 완료된 이미지들의 분석 시작 (기존 방식 - fallback)
   */
  const startAnalysisForUploadedImages = useCallback(async (uploadedImages) => {
    try {
      // 모든 이미지의 분석 상태 폴링 시작
      const pollPromises = uploadedImages.map((img) => {
        // 분석 중 상태로 변경
        setImages(prev => prev.map(i => 
          i.id === img.id ? { ...i, status: 'analyzing' } : i
        ));

        return pollAnalysisStatus(img.uploadedImageId, {
          interval: 2500,
          maxAttempts: 60,
          onStatusChange: (status, attemptCount) => {
            console.log(`이미지 ${img.id} 분석 상태: ${status} (시도 ${attemptCount}회)`);
          },
        })
          .then((statusResponse) => {
            if (statusResponse.success && statusResponse.data?.analysis) {
              const formattedResult = formatAnalysisResult(statusResponse.data);
              setImages(prev => {
                const updated = prev.map(i => 
                  i.id === img.id 
                    ? { ...i, analysisResult: formattedResult, status: 'completed' } 
                    : i
                );
                // 진행률 업데이트 (분석 단계: 50-100%)
                const newCompletedCount = updated.filter(i => i.status === 'completed').length;
                const progress = 50 + (newCompletedCount / uploadedImages.length) * 50;
                setUploadProgress(Math.min(progress, 100));
                return updated;
              });
              
              return { imageId: img.id, result: formattedResult };
            } else {
              throw new Error(statusResponse.message || '분석 결과를 가져올 수 없습니다.');
            }
          })
          .catch((error) => {
            const errorMessageText = error?.message || error?.toString() || '분석 실패';
            setImages(prev => prev.map(i => 
              i.id === img.id 
                ? { ...i, status: 'failed', error: errorMessageText } 
                : i
            ));
            throw error;
          });
      });

      await Promise.allSettled(pollPromises);
      
      // 전체 진행률 100%
      setUploadProgress(100);
      setIsAnalyzing(false);

      // 모든 분석이 완료되었는지 확인
      const finalImages = imagesRef.current;
      const allCompleted = uploadedImages.every(img => {
        const currentImg = finalImages.find(i => i.id === img.id);
        return currentImg?.status === 'completed' || currentImg?.status === 'failed';
      });

      if (allCompleted) {
        const failedCount = uploadedImages.filter(img => {
          const currentImg = finalImages.find(i => i.id === img.id);
          return currentImg?.status === 'failed';
        }).length;
        
        if (failedCount > 0) {
          Alert.alert(
            '분석 완료',
            `${uploadedImages.length - failedCount}장의 분석이 완료되었습니다. ${failedCount}장의 분석에 실패했습니다.`
          );
        } else {
          Alert.alert('분석 완료', '모든 이미지의 분석이 완료되었습니다.');
        }
      }
    } catch (error) {
      console.error('분석 오류:', error);
      setIsAnalyzing(false);
      setUploadProgress(0);
      
      let errorMessage = '분석 중 오류가 발생했습니다.';
      
      if (error.status === 0) {
        errorMessage = '네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 백엔드 서버 로그를 확인해주세요.';
      }
      
      setPickerError(errorMessage);
    }
  }, [formatAnalysisResult]);

  const handlePickerResult = useCallback(
    async (response, position) => {
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

      addImage(asset, position);
    },
    [addImage]
  );

  const handleLaunch = useCallback(
    async (type, position) => {
      if (type === 'camera') {
        // 가이드라인 카메라 모달 열기
        setCurrentCameraPosition(position);
        setCameraModalVisible(true);
      } else {
        // 앨범에서 선택
        const options = {
          mediaType: 'photo',
          quality: 0.8,
        };

        try {
          const response = await launchImageLibrary(options);
          handlePickerResult(response, position);
        } catch (error) {
          setPickerError('사진을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
      }
    },
    [handlePickerResult]
  );

  const handleCameraCapture = useCallback(
    async (asset) => {
      setCameraModalVisible(false);
      if (asset && currentCameraPosition) {
        const imageId = Date.now();
        // 이미지 추가 전에 ID 저장
        setLastCapturedImageId(imageId);
        await addImage(asset, currentCameraPosition);
      }
      setCurrentCameraPosition(null);
    },
    [addImage, currentCameraPosition]
  );

  const handleCameraClose = useCallback(async () => {
    // 마지막으로 촬영한 이미지가 있으면 삭제 (업로드 전이므로 로컬에서만 제거)
    if (lastCapturedImageId) {
      const lastImage = imagesRef.current.find(img => img.id === lastCapturedImageId);
      
      // 업로드 완료된 이미지인 경우에만 서버에서 삭제
      if (lastImage && lastImage.uploadedImageId) {
        try {
          await deleteImage(lastImage.uploadedImageId);
          console.log('✅ 이미지 삭제 완료 (Cloudinary & DB):', lastImage.uploadedImageId);
        } catch (error) {
          console.error('❌ 이미지 삭제 오류:', error);
        }
      }
      
      // 로컬 상태에서 제거
      setImages(prev => prev.filter(img => img.id !== lastCapturedImageId));
      setLastCapturedImageId(null);
    }
    
    setCameraModalVisible(false);
    setCurrentCameraPosition(null);
  }, [lastCapturedImageId]);

  const handleAddPhoto = useCallback((position) => {
    // 이미 해당 위치의 사진이 있는지 확인
    const existingImage = images.find(img => img.position === position);
    if (existingImage) {
      Alert.alert(
        '알림', 
        `${POSITION_LABELS[position]} 사진은 이미 촬영되었습니다.\n기존 사진을 삭제하고 다시 촬영하시겠습니까?`,
        [
          { 
            text: '기존 사진 삭제 후 촬영', 
            onPress: async () => {
              await removeImage(existingImage.id);
              // 삭제 후 바로 촬영 옵션 표시
              Alert.alert(
                '사진 선택',
                `${POSITION_LABELS[position]} 사진을 촬영하거나 앨범에서 선택해주세요.`,
                [
                  { text: '카메라로 촬영', onPress: () => handleLaunch('camera', position) },
                  { text: '앨범에서 선택', onPress: () => handleLaunch('library', position) },
                  { text: '취소', style: 'cancel' },
                ],
                { cancelable: true }
              );
            }
          },
          { text: '취소', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }

    Alert.alert(
      '사진 선택',
      `${POSITION_LABELS[position]} 사진을 촬영하거나 앨범에서 선택해주세요.`,
      [
        { text: '카메라로 촬영', onPress: () => handleLaunch('camera', position) },
        { text: '앨범에서 선택', onPress: () => handleLaunch('library', position) },
        { text: '취소', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [images, handleLaunch, removeImage]);


  const allImagesReady = images.length === TOTAL_IMAGES;
  const hasResults = images.some(img => img.analysisResult);
  const allCompleted = images.length === TOTAL_IMAGES && images.every(img => 
    img.status === 'completed' || img.status === 'failed'
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* 진행 상황 표시 */}
          {isAnalyzing && (
            <View style={styles.progressSection}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                AI 분석 중... {uploadProgress.toFixed(0)}%
              </Text>
            </View>
          )}

          {/* 구강사진 촬영 시작 카드 */}
          {!allCompleted && !isPhotoSessionStarted && images.length === 0 && (
            <View style={styles.startCard}>
              <View style={styles.startCardContent}>
                <Text style={styles.startCardTitle}>구강 사진 촬영</Text>
                <Text style={styles.startCardSubtitle}>
                  윗니, 아랫니, 앞니 사진을 촬영하여{'\n'}AI 분석을 받아보세요
                </Text>
                <TouchableOpacity
                  onPress={() => setIsPhotoSessionStarted(true)}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>촬영 시작하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 이미지 촬영 섹션 */}
          {!allCompleted && (isPhotoSessionStarted || images.length > 0) && (
            <View style={styles.photoSection}>
              <View style={styles.sectionHeader}>
                {images.length === 0 && (
                  <TouchableOpacity
                    onPress={() => setIsPhotoSessionStarted(false)}
                    style={styles.backButton}
                  >
                    <Text style={styles.backButtonText}>← 뒤로</Text>
                  </TouchableOpacity>
                )}
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>구강 사진 촬영</Text>
                  <Text style={styles.sectionSubtitle}>
                    각 위치별로 사진을 촬영해주세요 ({images.length}/{TOTAL_IMAGES})
                  </Text>
                </View>
              </View>
              
              <View style={styles.positionButtons}>
                {['upper', 'lower', 'front'].map((position) => {
                  const image = images.find(img => img.position === position);
                  const isTaken = !!image;
                  
                  return (
                    <View key={position} style={styles.positionButtonContainer}>
                      {isTaken ? (
                        <View style={styles.photoCard}>
                          <Image 
                            source={{ uri: image.asset.uri }} 
                            style={styles.photoCardImage} 
                          />
                          <View style={styles.photoCardOverlay}>
                            <Text style={styles.photoCardLabel}>
                              {POSITION_LABELS[position]}
                            </Text>
                          {image.status === 'pending' && (
                            <Text style={styles.photoCardStatusText}>대기 중</Text>
                          )}
                          {image.status === 'uploading' && (
                            <>
                              <ActivityIndicator size="small" color="white" style={styles.photoCardStatus} />
                              <Text style={styles.photoCardStatusText}>업로드 중...</Text>
                            </>
                          )}
                          {image.status === 'uploaded' && (
                            <Text style={styles.photoCardCheck}>✓ 업로드 완료</Text>
                          )}
                          {image.status === 'analyzing' && (
                            <>
                              <ActivityIndicator size="small" color="#3b82f6" style={styles.photoCardStatus} />
                              <Text style={styles.photoCardStatusText}>분석 중...</Text>
                            </>
                          )}
                          {image.status === 'completed' && (
                            <Text style={styles.photoCardCheck}>✓ 분석 완료</Text>
                          )}
                          {image.status === 'failed' && (
                            <Text style={styles.photoCardError}>✕ {image.error || '실패'}</Text>
                          )}
                          </View>
                          <TouchableOpacity
                            onPress={() => removeImage(image.id)}
                            style={styles.photoCardRemoveButton}
                            disabled={isUploading || isAnalyzing}
                          >
                            <Text style={styles.photoCardRemoveText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleAddPhoto(position)}
                          style={[
                            styles.positionButton,
                            (isUploading || isAnalyzing) && styles.positionButtonDisabled
                          ]}
                          disabled={isUploading || isAnalyzing}
                        >
                          <View style={styles.positionButtonIcon}>
                            <Text style={styles.positionButtonIconText}>📷</Text>
                          </View>
                          <Text style={styles.positionButtonText}>
                            {POSITION_LABELS[position]}
                          </Text>
                          <Text style={styles.positionButtonSubtext}>
                            촬영하기
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 분석 시작 버튼 */}
          {allImagesReady && !isUploading && !isAnalyzing && !allCompleted && (
            <TouchableOpacity
              onPress={startAnalysis}
              style={styles.startAnalysisButton}
            >
              <Text style={styles.startAnalysisButtonText}>
                🔍 분석하기
              </Text>
            </TouchableOpacity>
          )}

          {/* 분석 중 표시 */}
          {isAnalyzing && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>
                AI 분석 중...
              </Text>
              <Text style={styles.loadingSubtext}>
                {uploadProgress.toFixed(0)}% 완료
              </Text>
            </View>
          )}

          {/* 분석 결과 표시 */}
          {allCompleted && hasResults && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>분석 결과</Text>
              
              {/* 전체 요약 */}
              {images.length === TOTAL_IMAGES && images.every(img => img.analysisResult) && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>전체 요약</Text>
                  <View style={styles.summaryScores}>
                    {images.map((img) => {
                      const result = img.analysisResult;
                      if (!result || result.score === null) return null;
                      return (
                        <View key={img.id} style={styles.summaryScoreItem}>
                          <Text style={styles.summaryScoreLabel}>
                            {POSITION_LABELS[img.position]}
                          </Text>
                          <Text style={styles.summaryScoreValue}>{result.score}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.summaryAverage}>
                    {(() => {
                      const scores = images
                        .map(img => img.analysisResult?.score)
                        .filter(score => score !== null);
                      const average = scores.length > 0 
                        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                        : null;
                      return average !== null ? (
                        <>
                          <Text style={styles.summaryAverageLabel}>평균 점수</Text>
                          <Text style={styles.summaryAverageValue}>{average}</Text>
                        </>
                      ) : null;
                    })()}
                  </View>
                </View>
              )}

              {/* 개별 결과 */}
              {images.map((img, index) => {
                if (!img.analysisResult) return null;
                
                const result = img.analysisResult;
                return (
                  <View key={img.id} style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                      <Image 
                        source={{ uri: img.asset.uri }} 
                        style={styles.resultThumbnail} 
                      />
                      <View style={styles.resultHeaderText}>
                        <Text style={styles.resultPosition}>
                          {POSITION_LABELS[img.position] || '선택 안함'}
                        </Text>
                        {result.score !== null && (
                          <Text style={styles.resultScore}>점수: {result.score}</Text>
                        )}
                      </View>
                    </View>

                    {result.issues && result.issues.length > 0 && (
                      <View style={styles.issuesSection}>
                        {result.issues.map((issue, issueIndex) => (
                          <View key={issueIndex} style={styles.issueItem}>
                            <Text style={styles.issueIcon}>
                              {issue.type === 'good' ? '✅' : issue.type === 'warning' ? '⚠️' : 'ℹ️'}
                            </Text>
                            <Text style={styles.issueText}>{issue.text}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {result.recommendations && result.recommendations.length > 0 && (
                      <View style={styles.recommendationsSection}>
                        <Text style={styles.recommendationsTitle}>추천 사항</Text>
                        {result.recommendations.map((rec, recIndex) => (
                          <View key={recIndex} style={styles.recommendationItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.recommendationText}>{rec}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* 에러 메시지 */}
          {pickerError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{pickerError}</Text>
            </View>
          )}

          {/* 다시 시작 버튼 */}
          {allCompleted && (
            <TouchableOpacity onPress={resetState} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>다시 분석하기</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* 카메라 가이드라인 모달 */}
      <Modal
        visible={cameraModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCameraClose}
      >
        {currentCameraPosition && (
          <CameraGuideComponent
            position={currentCameraPosition}
            onCapture={handleCameraCapture}
            onClose={handleCameraClose}
          />
        )}
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  progressSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginTop: 8,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0f2fe',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  startCard: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  startCardContent: {
    padding: 32,
    alignItems: 'center',
  },
  startCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  startCardSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  positionButtons: {
    gap: 16,
  },
  positionButtonContainer: {
    marginBottom: 12,
  },
  positionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  positionButtonDisabled: {
    opacity: 0.5,
  },
  positionButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  positionButtonIconText: {
    fontSize: 32,
  },
  positionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  positionButtonSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  photoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  photoCardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  photoCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photoCardLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  photoCardStatus: {
    marginLeft: 8,
  },
  photoCardStatusText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '500',
  },
  photoCardCheck: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoCardError: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoCardRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCardRemoveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startAnalysisButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startAnalysisButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#3b82f6',
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resultThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  resultHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  resultPosition: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  resultScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  issuesSection: {
    marginTop: 12,
    gap: 8,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
  },
  issueIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  issueText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  recommendationsSection: {
    marginTop: 12,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    fontSize: 13,
    color: '#6b7280',
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  resetButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryScoreItem: {
    alignItems: 'center',
  },
  summaryScoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  summaryScoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3b82f6',
  },
  summaryAverage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },
  summaryAverageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  summaryAverageValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2563eb',
  },
});

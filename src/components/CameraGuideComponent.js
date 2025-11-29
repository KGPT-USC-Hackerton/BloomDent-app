import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { detectLips } from '../services/lipDetectionService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const POSITION_LABELS = {
  upper: '윗니',
  lower: '아랫니',
  front: '앞니',
};

export default function CameraGuideComponent({ position, onCapture, onClose }) {
  const camera = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const insets = useSafeAreaInsets();
  
  // 입술 검출 관련 상태
  const [lipPoints, setLipPoints] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef(null);
  const uploadIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastPhotoRef = useRef(null); // 마지막 촬영한 사진 저장
  const autoCaptureTriggeredRef = useRef(false); // 자동 촬영 트리거 플래그

  const checkPermission = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          '카메라 권한 필요',
          '구강 사진 촬영을 위해 카메라 권한이 필요합니다.',
          [{ text: '확인', onPress: onClose }]
        );
      }
    }
  }, [hasPermission, requestPermission, onClose]);

  useEffect(() => {
    checkPermission();
    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, [checkPermission]);

  // 1초마다 사진 촬영 (셔터음 무음)
  const capturePhoto = useCallback(async () => {
    if (!camera.current || isProcessingRef.current || !hasPermission || !isReady) {
      return;
    }

    // 이미 처리 중이면 스킵
    if (isProcessingRef.current) {
      return;
    }

    try {
      isProcessingRef.current = true;

      // 빠른 사진 촬영 (셔터음 무음)
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false, // 셔터음 무음
      });

      const photoPath = photo.path.startsWith('file://') 
        ? photo.path 
        : `file://${photo.path}`;
      
      // 마지막 촬영한 사진 저장
      lastPhotoRef.current = photoPath;
      
      console.log('📸 사진 촬영 완료 (무음)');
    } catch (error) {
      // 에러가 발생해도 조용히 처리 (너무 자주 로그 남기지 않음)
      const errorCode = error?.code || error?.message || 'unknown';
      if (errorCode !== -11803 && errorCode !== -16409) {
        console.warn('사진 촬영 경고:', errorCode);
      }
      // 에러 발생 시에도 이전 사진 유지
    } finally {
      // 약간의 지연 후 다음 촬영 허용 (카메라 세션 안정화)
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }
  }, [hasPermission, isReady]);

  // 입술 포인트가 가이드라인과 일치하는지 확인
  const checkAlignment = useCallback((points, pos) => {
    if (!points || points.length === 0) return false;

    const guideStyle = getGuideStyle(pos);
    const guideBounds = {
      x: guideStyle.left,
      y: guideStyle.top,
      width: guideStyle.width,
      height: guideStyle.height,
    };

    // 입술 포인트의 중심점 계산
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // 중심점이 가이드라인 내부에 있는지 확인 (여유 공간 20% 허용)
    const margin = 0.2;
    const minX = guideBounds.x - guideBounds.width * margin;
    const maxX = guideBounds.x + guideBounds.width * (1 + margin);
    const minY = guideBounds.y - guideBounds.height * margin;
    const maxY = guideBounds.y + guideBounds.height * (1 + margin);

    const isCenterInGuide = 
      centerX >= minX && centerX <= maxX &&
      centerY >= minY && centerY <= maxY;

    // 포인트 중 일정 비율 이상이 가이드라인 내부에 있는지 확인
    const pointsInGuide = points.filter(p => 
      p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY
    ).length;
    const pointsRatio = pointsInGuide / points.length;

    // 중심점이 가이드 내부에 있고, 60% 이상의 포인트가 가이드 내부에 있으면 정렬됨
    return isCenterInGuide && pointsRatio >= 0.6;
  }, []);

  // 자동 촬영 실행
  const triggerAutoCapture = useCallback(async () => {
    if (autoCaptureTriggeredRef.current || isCapturing || !camera.current || !isReady) {
      return;
    }

    try {
      autoCaptureTriggeredRef.current = true;
      setIsCapturing(true);
      
      console.log('🤖 자동 촬영 시작 - 구도 적합');

      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
      });

      const photoPath = photo.path.startsWith('file://') 
        ? photo.path 
        : `file://${photo.path}`;
      
      const asset = {
        uri: photoPath,
        type: 'image/jpeg',
        fileName: `dental_${position}_${Date.now()}.jpg`,
        width: photo.width,
        height: photo.height,
      };

      console.log('✅ 자동 촬영 완료');
      onCapture(asset);
    } catch (error) {
      console.error('❌ 자동 촬영 오류:', error);
      autoCaptureTriggeredRef.current = false; // 에러 시 재시도 허용
    } finally {
      setIsCapturing(false);
    }
  }, [isReady, isCapturing, position, onCapture]);

  // 0.5초마다 사진 전송 (입술 검출)
  const uploadAndDetectLips = useCallback(async () => {
    if (!lastPhotoRef.current) return;

    try {
      setIsDetecting(true);
      
      // 입술 검출 API 호출
      const result = await detectLips(lastPhotoRef.current);
      
      if (result.success && result.data.faceDetected) {
        const scaleX = SCREEN_WIDTH / result.data.width;
        const scaleY = SCREEN_HEIGHT / result.data.height;
        
        // 화면 좌표로 변환
        const screenPoints = result.data.lipPoints.map(point => ({
          x: point.x * scaleX,
          y: point.y * scaleY,
        }));

        setLipPoints(screenPoints);
        setImageSize({
          width: result.data.width,
          height: result.data.height,
        });
        
        console.log('✅ 입술 검출 성공:', screenPoints.length, '개 포인트');

        // 입술 포인트가 가이드라인과 일치하는지 확인
        if (screenPoints.length > 0 && checkAlignment(screenPoints, position)) {
          console.log('🎯 구도 적합 - 자동 촬영 트리거');
          // 약간의 지연 후 자동 촬영 (안정성 향상)
          setTimeout(() => {
            triggerAutoCapture();
          }, 300);
        }
      } else {
        // 얼굴이 감지되지 않으면 포인트 초기화
        setLipPoints([]);
      }
    } catch (error) {
      console.error('입술 검출 오류:', error);
      // 에러 발생 시 조용히 처리 (사용자에게 알리지 않음)
    } finally {
      setIsDetecting(false);
    }
  }, [position, checkAlignment, triggerAutoCapture]);

  // 카메라 준비 완료 핸들러
  const handleCameraReady = useCallback(() => {
    setIsReady(true);
    console.log('✅ 카메라 준비 완료');
  }, []);

  // 카메라 활성화 지연 (안정성 향상)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🎬 카메라 활성화');
      setIsCameraActive(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      console.log('🛑 카메라 비활성화');
      setIsCameraActive(false);
    };
  }, []);

  // 1초마다 사진 촬영 (셔터음 무음)
  useEffect(() => {
    if (hasPermission && device && isReady && isCameraActive) {
      // 초기 지연 후 시작 (카메라 세션 안정화)
      const initialDelay = setTimeout(() => {
        capturePhoto();
      }, 500);
      
      // 1초마다 사진 촬영
      detectionIntervalRef.current = setInterval(() => {
        capturePhoto();
      }, 1000);

      return () => {
        clearTimeout(initialDelay);
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [hasPermission, device, isReady, isCameraActive, capturePhoto]);

  // 0.5초마다 사진 전송 (입술 검출)
  useEffect(() => {
    if (hasPermission && device && isReady && isCameraActive) {
      // 0.5초마다 사진 전송
      uploadIntervalRef.current = setInterval(() => {
        uploadAndDetectLips();
      }, 500);
    }

    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current);
      }
    };
  }, [hasPermission, device, isReady, isCameraActive, uploadAndDetectLips]);

  const takePhoto = async () => {
    console.log('📸 촬영 시도 - 카메라 준비:', isReady, '카메라 ref:', !!camera.current);

    if (!camera.current || !isReady || isCapturing || !hasPermission) {
      console.warn('⚠️ 촬영 불가 - 카메라가 준비되지 않음');
      return;
    }

    try {
      setIsCapturing(true);
      
      // 안정적인 기본 촬영 옵션
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false,
      });

      console.log('📸 촬영 성공, 결과:', photo);

      const photoPath = photo.path.startsWith('file://') 
        ? photo.path 
        : `file://${photo.path}`;
      
      const asset = {
        uri: photoPath,
        type: 'image/jpeg',
        fileName: `dental_${position}_${Date.now()}.jpg`,
        width: photo.width,
        height: photo.height,
      };

      onCapture(asset);
    } catch (error) {
      console.error('❌ 촬영 오류:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCapturing(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라 권한이 필요합니다</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={checkPermission}>
            <Text style={styles.permissionButtonText}>권한 요청</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // device가 없으면 렌더링하지 않음 (nil 체크로 크래시 방지)
  if (!device) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>카메라를 찾을 수 없습니다</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device && (
        <Camera
          ref={camera}
          style={styles.camera}
          device={device}
          isActive={isCameraActive}
          photo={true}
          onInitialized={handleCameraReady}
          onError={(error) => {
            console.error('Camera error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
          }}
        />
      )}

      {/* 가이드라인 오버레이 */}
      <View style={styles.overlay}>
        <View style={styles.guideContainer}>
          <MouthGuide position={position} />
        </View>
        
        {/* 입술 랜드마크 오버레이 */}
        {lipPoints.length > 0 && imageSize.width > 0 && (
          <LipOverlay 
            lipPoints={lipPoints} 
            imageSize={imageSize}
            screenWidth={SCREEN_WIDTH}
            screenHeight={SCREEN_HEIGHT}
          />
        )}
      </View>

      {/* 하단 컨트롤 */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        {/* 제목과 닫기 버튼 */}
        <View style={styles.bottomHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{POSITION_LABELS[position]} 촬영</Text>
            <Text style={styles.subtitle}>가이드라인에 맞춰 입을 맞춰주세요</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 촬영 버튼 */}
        {isReady ? (
          <TouchableOpacity
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={takePhoto}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        ) : (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.loadingText}>준비 중...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// 입술 랜드마크 오버레이 컴포넌트
function LipOverlay({ lipPoints, imageSize, screenWidth, screenHeight }) {
  // 이미지 크기와 화면 크기의 비율 계산
  // 카메라 프리뷰는 화면을 채우지만, 실제 이미지 비율에 맞춰 조정 필요
  const scaleX = screenWidth / imageSize.width;
  const scaleY = screenHeight / imageSize.height;
  
  // 포인트를 화면 좌표로 변환
  const screenPoints = lipPoints.map(point => ({
    x: point.x * scaleX,
    y: point.y * scaleY,
  }));

  // 입술 포인트를 Path로 연결
  const pathData = screenPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ') + ' Z';

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={screenWidth}
      height={screenHeight}
    >
      {/* 입술 외곽선 */}
      <Path
        d={pathData}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 입술 포인트 표시 */}
      {screenPoints.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#10b981"
        />
      ))}
    </Svg>
  );
}

// 입 모양 가이드라인 컴포넌트
function MouthGuide({ position }) {
  const guideStyles = getGuideStyle(position);

  return (
    <View style={styles.guideWrapper}>
      <View style={[styles.guideOutline, guideStyles]}>
        {/* 윗니 가이드 */}
        {position === 'upper' && (
          <>
            <View style={[styles.upperTeethGuide, guideStyles.upperTeeth]} />
            <Text style={styles.guideText}>윗니를 가이드라인에 맞춰주세요</Text>
          </>
        )}

        {/* 아랫니 가이드 */}
        {position === 'lower' && (
          <>
            <View style={[styles.lowerTeethGuide, guideStyles.lowerTeeth]} />
            <Text style={styles.guideText}>아랫니를 가이드라인에 맞춰주세요</Text>
          </>
        )}

        {/* 앞니 가이드 */}
        {position === 'front' && (
          <>
            <View style={[styles.frontTeethGuide, guideStyles.frontTeeth]} />
            <Text style={styles.guideText}>앞니를 가이드라인에 맞춰주세요</Text>
          </>
        )}
      </View>
    </View>
  );
}

function getGuideStyle(position) {
  const baseSize = SCREEN_WIDTH * 0.7;
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  switch (position) {
    case 'upper':
      return {
        width: baseSize,
        height: baseSize * 0.5,
        top: centerY - baseSize * 0.25,
        left: centerX - baseSize / 2,
        borderTopLeftRadius: baseSize * 0.3,
        borderTopRightRadius: baseSize * 0.3,
        borderBottomLeftRadius: baseSize * 0.1,
        borderBottomRightRadius: baseSize * 0.1,
        upperTeeth: {
          width: baseSize * 0.9,
          height: baseSize * 0.25,
          top: 0,
          left: baseSize * 0.05,
          borderTopLeftRadius: baseSize * 0.3,
          borderTopRightRadius: baseSize * 0.3,
        },
      };

    case 'lower':
      return {
        width: baseSize,
        height: baseSize * 0.5,
        top: centerY - baseSize * 0.25,
        left: centerX - baseSize / 2,
        borderTopLeftRadius: baseSize * 0.1,
        borderTopRightRadius: baseSize * 0.1,
        borderBottomLeftRadius: baseSize * 0.3,
        borderBottomRightRadius: baseSize * 0.3,
        lowerTeeth: {
          width: baseSize * 0.9,
          height: baseSize * 0.25,
          bottom: 0,
          left: baseSize * 0.05,
          borderBottomLeftRadius: baseSize * 0.3,
          borderBottomRightRadius: baseSize * 0.3,
        },
      };

    case 'front':
      return {
        width: baseSize * 0.6,
        height: baseSize * 0.8,
        top: centerY - baseSize * 0.4,
        left: centerX - baseSize * 0.3,
        borderRadius: baseSize * 0.2,
        frontTeeth: {
          width: baseSize * 0.5,
          height: baseSize * 0.6,
          top: baseSize * 0.1,
          left: baseSize * 0.05,
          borderRadius: baseSize * 0.15,
        },
      };

    default:
      return {};
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideOutline: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#3b82f6',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  upperTeethGuide: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderBottomWidth: 0,
  },
  lowerTeethGuide: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderTopWidth: 0,
  },
  frontTeethGuide: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#10b981',
    borderStyle: 'solid',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  guideText: {
    position: 'absolute',
    bottom: -40,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 20,
  },
  bottomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
  },
});


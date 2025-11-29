import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
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
  const [isActive, setIsActive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const insets = useSafeAreaInsets();
  
  // 입술 검출 관련 상태
  const [lipPoints, setLipPoints] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);

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
    };
  }, [checkPermission]);

  // 입술 검출을 위한 프레임 캡처 및 전송
  const captureAndDetectLips = useCallback(async () => {
    if (!camera.current || isProcessingRef.current || !hasPermission) return;

    try {
      isProcessingRef.current = true;
      setIsDetecting(true);

      // 빠른 사진 촬영 (저품질로 성능 향상)
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });

      const photoPath = Platform.OS === 'ios' ? `file://${photo.path}` : `file://${photo.path}`;
      
      // 입술 검출 API 호출
      const result = await detectLips(photoPath);
      
      if (result.success && result.data.faceDetected) {
        setLipPoints(result.data.lipPoints);
        setImageSize({
          width: result.data.width,
          height: result.data.height,
        });
      } else {
        // 얼굴이 감지되지 않으면 포인트 초기화
        setLipPoints([]);
      }
    } catch (error) {
      console.error('입술 검출 오류:', error);
      // 에러 발생 시 조용히 처리 (사용자에게 알리지 않음)
    } finally {
      setIsDetecting(false);
      isProcessingRef.current = false;
    }
  }, [hasPermission]);

  // 0.5초마다 입술 검출 시작
  useEffect(() => {
    if (hasPermission && device) {
      // 즉시 한 번 실행
      captureAndDetectLips();
      
      // 0.5초마다 반복
      detectionIntervalRef.current = setInterval(() => {
        captureAndDetectLips();
      }, 500);
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [hasPermission, device, captureAndDetectLips]);

  const takePhoto = async () => {
    if (!camera.current || isCapturing || !hasPermission) return;

    try {
      setIsCapturing(true);
      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
      });

      // photo.path를 asset 형식으로 변환
      // react-native-vision-camera는 path를 반환합니다
      const photoPath = photo.path;
      const asset = {
        uri: Platform.OS === 'ios' ? `file://${photoPath}` : `file://${photoPath}`,
        type: 'image/jpeg',
        fileName: `photo_${Date.now()}.jpg`,
        width: photo.width,
        height: photo.height,
      };

      onCapture(asset);
    } catch (error) {
      console.error('사진 촬영 오류:', error);
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
          isActive={isActive}
          photo={true}
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
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={takePhoto}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
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
});


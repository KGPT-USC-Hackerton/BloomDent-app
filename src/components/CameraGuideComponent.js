import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  Image, // ✅ 실제 원본 크기 계산용
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { detectLips } from '../services/lipDetectionService';
import ImageManipulator from 'react-native-image-manipulator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const POSITION_LABELS = {
  upper: '윗니',
  lower: '아랫니',
  front: '앞니',
};

// ✅ 실제 이미지 크기 가져오기 (ImageManipulator가 사용하는 원본 기준)
const getRealImageSize = uri =>
  new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      error => reject(error),
    );
  });

export default function CameraGuideComponent({ position, onCapture, onClose }) {
  const camera = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const insets = useSafeAreaInsets();
  
  const [lipPoints, setLipPoints] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDetecting, setIsDetecting] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const detectionIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastPhotoRef = useRef(null);
  const autoCaptureTriggeredRef = useRef(false);
  const alignmentTimerRef = useRef(null);

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
    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (alignmentTimerRef.current) clearTimeout(alignmentTimerRef.current);
    };
  }, [checkPermission]);

  // 가이드라인 정렬 체크
  const checkAlignment = useCallback((points, pos) => {
    if (!points || points.length === 0) return false;

    const guideStyle = getGuideStyle(pos);
    const guideBounds = {
      x: guideStyle.left,
      y: guideStyle.top,
      width: guideStyle.width,
      height: guideStyle.height,
    };

    const lipMinX = Math.min(...points.map(p => p.x));
    const lipMaxX = Math.max(...points.map(p => p.x));
    const lipMinY = Math.min(...points.map(p => p.y));
    const lipMaxY = Math.max(...points.map(p => p.y));
    const lipWidth = lipMaxX - lipMinX;
    const lipHeight = lipMaxY - lipMinY;
    const lipArea = lipWidth * lipHeight;

    const lipCenterX = (lipMinX + lipMaxX) / 2;
    const lipCenterY = (lipMinY + lipMaxY) / 2;

    const guideCenterX = guideBounds.x + guideBounds.width / 2;
    const guideCenterY = guideBounds.y + guideBounds.height / 2;

    const overlapMinX = Math.max(lipMinX, guideBounds.x);
    const overlapMaxX = Math.min(lipMaxX, guideBounds.x + guideBounds.width);
    const overlapMinY = Math.max(lipMinY, guideBounds.y);
    const overlapMaxY = Math.min(lipMaxY, guideBounds.y + guideBounds.height);

    const overlapWidth = Math.max(0, overlapMaxX - overlapMinX);
    const overlapHeight = Math.max(0, overlapMaxY - overlapMinY);
    const overlapArea = overlapWidth * overlapHeight;

    const guideArea = guideBounds.width * guideBounds.height;
    const unionArea = lipArea + guideArea - overlapArea;
    const overlapRatio = unionArea > 0 ? overlapArea / unionArea : 0;
    const lipOverlapRatio = lipArea > 0 ? overlapArea / lipArea : 0;
    const guideOverlapRatio = guideArea > 0 ? overlapArea / guideArea : 0;

    const centerDistanceX = Math.abs(lipCenterX - guideCenterX) / guideBounds.width;
    const centerDistanceY = Math.abs(lipCenterY - guideCenterY) / guideBounds.height;
    const normalizedCenterDistance = Math.sqrt(
      centerDistanceX * centerDistanceX + centerDistanceY * centerDistanceY
    );

    const isOptimalAlignment = 
      overlapRatio >= 0.4 &&
      lipOverlapRatio >= 0.5 &&
      guideOverlapRatio >= 0.5 &&
      normalizedCenterDistance <= 0.3;

    if (isOptimalAlignment) {
      console.log('🎯 최적 겹침 조건:', {
        overlapRatio: (overlapRatio * 100).toFixed(1) + '%',
        lipOverlapRatio: (lipOverlapRatio * 100).toFixed(1) + '%',
        guideOverlapRatio: (guideOverlapRatio * 100).toFixed(1) + '%',
        centerDistance: (normalizedCenterDistance * 100).toFixed(1) + '%',
      });
    }

    return isOptimalAlignment;
  }, []);

  // 플래시 효과
  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 150);
  }, []);

  // ✅ 입술 영역 크롭 (crop rectangle 완전 방어)
  const cropLipArea = useCallback(async (photoPath, rawWidth, rawHeight) => {
    try {
      if (!ImageManipulator || typeof ImageManipulator.manipulate !== 'function') {
        console.warn('⚠️ ImageManipulator 사용 불가 - 원본 반환');
        return photoPath;
      }

      let imageWidth = rawWidth;
      let imageHeight = rawHeight;

      // 실제 원본 크기 우선 사용
      try {
        const realSize = await getRealImageSize(photoPath);
        imageWidth = realSize.width;
        imageHeight = realSize.height;
      } catch (e) {
        console.warn('⚠️ Image.getSize 실패, VisionCamera width/height 사용', e?.message);
      }

      if (!imageWidth || !imageHeight) {
        console.warn('⚠️ 이미지 크기 알 수 없음 - 원본 반환');
        return photoPath;
      }

      const result = await detectLips(photoPath);
      if (!result.success || !result.data?.faceDetected || !Array.isArray(result.data.lipPoints) || !result.data.lipPoints.length) {
        console.warn('⚠️ 입술 검출 실패 - 원본 반환');
        return photoPath;
      }

      const detectedLipPoints = result.data.lipPoints;
      const detectedImageWidth = result.data.width || imageWidth;
      const detectedImageHeight = result.data.height || imageHeight;

      const scaleX = imageWidth / detectedImageWidth;
      const scaleY = imageHeight / detectedImageHeight;

      const scaledLipPoints = detectedLipPoints.map(p => ({
        x: p.x * scaleX,
        y: p.y * scaleY,
      }));

      const xs = scaledLipPoints.map(p => p.x);
      const ys = scaledLipPoints.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) {
        console.warn('⚠️ 입술 좌표 이상 - 원본 반환');
        return photoPath;
      }

      const lipWidth = maxX - minX;
      const lipHeight = maxY - minY;
      const lipCenterX = (minX + maxX) / 2;
      const lipCenterY = (minY + maxY) / 2;

      // 가로/세로 여유 공간을 다르게 설정 (세로는 더 작게)
      const paddingRatioX = 0.2; // 가로 여유 공간 20%
      const paddingRatioY = 0.1; // 세로 여유 공간 10% (더 타이트하게)
      const paddingX = lipWidth * paddingRatioX;
      const paddingY = lipHeight * paddingRatioY;
      const minCropSize = 80;

      const desiredCropWidth = Math.max(lipWidth + 2 * paddingX, minCropSize);
      const desiredCropHeight = Math.max(lipHeight + 2 * paddingY, minCropSize);

      let cropX = lipCenterX - desiredCropWidth / 2;
      let cropY = lipCenterY - desiredCropHeight / 2;

      // 경계 안으로 1차 클램프
      cropX = Math.max(0, Math.min(cropX, imageWidth - desiredCropWidth));
      cropY = Math.max(0, Math.min(cropY, imageHeight - desiredCropHeight));

      let cropWidth = Math.min(desiredCropWidth, imageWidth - cropX);
      let cropHeight = Math.min(desiredCropHeight, imageHeight - cropY);

      // 너무 작으면 최소값 보장
      if (cropWidth < 1 || cropHeight < 1) {
        console.warn('⚠️ 크롭 영역 너무 작음 - 원본 반환');
        return photoPath;
      }

      // 정수로 반올림 후 다시 한 번 경계 체크
      const originX = Math.floor(cropX);
      const originY = Math.floor(cropY);
      const width = Math.floor(cropWidth);
      const height = Math.floor(cropHeight);

      const isValidCrop =
        originX >= 0 &&
        originY >= 0 &&
        width > 0 &&
        height > 0 &&
        originX + width <= imageWidth &&
        originY + height <= imageHeight;

      if (!isValidCrop) {
        console.warn('⚠️ 최종 크롭 영역이 이미지 밖입니다 - 원본 반환', {
          originX,
          originY,
          width,
          height,
          imageWidth,
          imageHeight,
        });
        return photoPath;
      }

      console.log('✂️ 최종 크롭 영역:', {
        originX,
        originY,
        width,
        height,
        imageWidth,
        imageHeight,
      });

      const manipulatedImage = await ImageManipulator.manipulate(
        photoPath,
        [
          {
            crop: {
              originX,
              originY,
              width,
              height,
            },
          },
        ],
        { compress: 0.9, format: 'jpeg' }
      );

      if (!manipulatedImage?.uri) {
        console.warn('⚠️ 크롭 결과 URI 없음 - 원본 반환');
        return photoPath;
      }

      console.log('✅ 입술 영역 크롭 완료:', manipulatedImage.uri);
      return manipulatedImage.uri;
    } catch (error) {
      console.error('❌ 입술 영역 크롭 오류:', error);
      return photoPath;
    }
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

      triggerFlash();

      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'quality',
        flash: 'off',
        enableShutterSound: false,
      });

      const photoPath = photo.path.startsWith('file://') 
        ? photo.path 
        : `file://${photo.path}`;

      const croppedPath = await cropLipArea(photoPath, photo.width, photo.height);

      const cropRatio = croppedPath !== photoPath ? 0.7 : 1.0;
      const asset = {
        uri: croppedPath,
        type: 'image/jpeg',
        fileName: `dental_${position}_${Date.now()}.jpg`,
        width: Math.round(photo.width * cropRatio),
        height: Math.round(photo.height * cropRatio),
      };

      console.log('✅ 자동 촬영 완료 (입술 영역 크롭)');
      if (alignmentTimerRef.current) {
        clearTimeout(alignmentTimerRef.current);
        alignmentTimerRef.current = null;
      }

      onCapture(asset);
    } catch (error) {
      console.error('❌ 자동 촬영 오류:', error);
      autoCaptureTriggeredRef.current = false;
      if (alignmentTimerRef.current) {
        clearTimeout(alignmentTimerRef.current);
        alignmentTimerRef.current = null;
      }
    } finally {
      setIsCapturing(false);
    }
  }, [isReady, isCapturing, position, onCapture, triggerFlash, cropLipArea]);

  // 0.5초마다 사진 촬영 및 입술 검출
  const captureAndUploadPhoto = useCallback(async () => {
    if (!camera.current || isProcessingRef.current || !hasPermission || !isReady) return;

    if (isProcessingRef.current) return;

    try {
      isProcessingRef.current = true;

      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false,
      });

      const photoPath = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;

      lastPhotoRef.current = photoPath;
      console.log('📸 사진 촬영 완료 (무음)');

      try {
        setIsDetecting(true);
        const result = await detectLips(photoPath);

        if (result.success && result.data.faceDetected) {
          setLipPoints(result.data.lipPoints);
          setImageSize({
            width: result.data.width,
            height: result.data.height,
          });

          const scaleX = SCREEN_WIDTH / result.data.width;
          const scaleY = SCREEN_HEIGHT / result.data.height;
          const screenPoints = result.data.lipPoints.map(point => ({
            x: point.x * scaleX,
            y: point.y * scaleY,
          }));

          if (screenPoints.length > 0 && checkAlignment(screenPoints, position)) {
            if (!alignmentTimerRef.current) {
              console.log('🎯 구도 적합 - 3초 유지 대기 중...');
              alignmentTimerRef.current = setTimeout(() => {
                console.log('✅ 3초 유지 완료 - 자동 촬영 실행');
                alignmentTimerRef.current = null;
                triggerAutoCapture();
              }, 3000);
            }
          } else {
            if (alignmentTimerRef.current) {
              console.log('⚠️ 구도 불일치 - 타이머 리셋');
              clearTimeout(alignmentTimerRef.current);
              alignmentTimerRef.current = null;
            }
          }
        } else {
          setLipPoints([]);
        }
      } catch (error) {
        console.error('입술 검출 오류:', error);
      } finally {
        setIsDetecting(false);
      }
    } catch (error) {
      const errorCode = error?.code || error?.message || 'unknown';
      if (errorCode !== -11803 && errorCode !== -16409) {
        console.warn('사진 촬영 경고:', errorCode);
      }
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 100);
    }
  }, [hasPermission, isReady, position, checkAlignment, triggerAutoCapture]);

  // 수동 촬영
  const takePhoto = async () => {
    console.log('📸 촬영 시도 - 카메라 준비:', isReady, '카메라 ref:', !!camera.current);

    if (!camera.current || !isReady || isCapturing || !hasPermission) {
      console.warn('⚠️ 촬영 불가 - 카메라가 준비되지 않음');
      return;
    }

    try {
      setIsCapturing(true);
      triggerFlash();

      const photo = await camera.current.takePhoto({
        qualityPrioritization: 'speed',
        flash: 'off',
        enableShutterSound: false,
      });

      const photoPath = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;

      const croppedPath = await cropLipArea(photoPath, photo.width, photo.height);

      const cropRatio = croppedPath !== photoPath ? 0.7 : 1.0;
      const asset = {
        uri: croppedPath,
        type: 'image/jpeg',
        fileName: `dental_${position}_${Date.now()}.jpg`,
        width: Math.round(photo.width * cropRatio),
        height: Math.round(photo.height * cropRatio),
      };

      console.log('✅ 수동 촬영 완료 (입술 영역 크롭)');
      onCapture(asset);
    } catch (error) {
      console.error('❌ 촬영 오류:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCameraReady = useCallback(() => {
    setIsReady(true);
    console.log('✅ 카메라 준비 완료');
  }, []);

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

  useEffect(() => {
    if (hasPermission && device && isReady && isCameraActive) {
      const initialDelay = setTimeout(() => {
        captureAndUploadPhoto();
      }, 500);

      detectionIntervalRef.current = setInterval(() => {
        captureAndUploadPhoto();
      }, 500);

      return () => {
        clearTimeout(initialDelay);
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      };
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [hasPermission, device, isReady, isCameraActive, captureAndUploadPhoto]);

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

      {showFlash && <View style={styles.flashOverlay} />}

      <View style={styles.overlay}>
        <View style={styles.guideContainer}>
          <MouthGuide position={position} />
        </View>

        {lipPoints.length > 0 && imageSize.width > 0 && (
          <LipOverlay 
            lipPoints={lipPoints} 
            imageSize={imageSize}
            screenWidth={SCREEN_WIDTH}
            screenHeight={SCREEN_HEIGHT}
          />
        )}
      </View>

      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.bottomHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{POSITION_LABELS[position]} 촬영</Text>
            <Text style={styles.subtitle}>가이드라인에 맞춰 입을 맞춰주세요</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

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

// ====== 오버레이 컴포넌트들 ======

function LipOverlay({ lipPoints, imageSize, screenWidth, screenHeight }) {
  const scaleX = screenWidth / imageSize.width;
  const scaleY = screenHeight / imageSize.height;

  const screenPoints = lipPoints.map(point => ({
    x: point.x * scaleX,
    y: point.y * scaleY,
  }));

  const pathData =
    screenPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ') + ' Z';

  return (
    <Svg style={StyleSheet.absoluteFill} width={screenWidth} height={screenHeight}>
      <Path
        d={pathData}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {screenPoints.map((point, index) => (
        <Circle key={index} cx={point.x} cy={point.y} r="3" fill="#10b981" />
      ))}
    </Svg>
  );
}

function MouthGuide({ position }) {
  const guideStyles = getGuideStyle(position);

  return (
    <View style={styles.guideWrapper}>
      <View style={[styles.guideOutline, guideStyles]}>
        {position === 'upper' && (
          <>
            <View style={[styles.upperTeethGuide, guideStyles.upperTeeth]} />
            <Text style={styles.guideText}>윗니를 가이드라인에 맞춰주세요</Text>
          </>
        )}

        {position === 'lower' && (
          <>
            <View style={[styles.lowerTeethGuide, guideStyles.lowerTeeth]} />
            <Text style={styles.guideText}>아랫니를 가이드라인에 맞춰주세요</Text>
          </>
        )}

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
        width: baseSize * 0.8,
        height: baseSize * 0.5,
        top: centerY - baseSize * 0.25,
        left: centerX - baseSize * 0.4,
        borderRadius: baseSize * 0.2,
        frontTeeth: {
          width: baseSize * 0.7,
          height: baseSize * 0.35,
          top: baseSize * 0.075,
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
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 9999,
  },
});

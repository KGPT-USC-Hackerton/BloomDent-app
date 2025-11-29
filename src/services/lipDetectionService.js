/**
 * 입술 검출 API 서비스
 * FastAPI 서버의 /detect-lips 엔드포인트 호출
 */

// FastAPI 서버 주소 (로컬 개발용)
const LIP_DETECTION_API_URL = 'http://192.168.0.61:8000';

/**
 * 이미지에서 입술 랜드마크 검출
 * @param {string} imageUri - 이미지 파일 경로 (file://...)
 * @returns {Promise<Object>} - { lipPoints: [{x, y}], faceDetected: bool, width, height }
 */
export const detectLips = async (imageUri) => {
  try {
    // React Native에서 파일을 FormData로 전송
    const formData = new FormData();
    
    // 파일명 추출
    const fileName = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
    
    // FormData에 파일 추가
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    });

    const response = await fetch(`${LIP_DETECTION_API_URL}/detect-lips`, {
      method: 'POST',
      body: formData,
      headers: {
        // FormData 사용 시 Content-Type은 자동으로 설정됨
      },
    });

    if (!response.ok) {
      throw new Error(`서버 오류: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        lipPoints: data.lipPoints || [],
        faceDetected: data.faceDetected || false,
        width: data.width || 0,
        height: data.height || 0,
        pointCount: data.pointCount || 0,
      },
    };
  } catch (error) {
    console.error('입술 검출 오류:', error);
    return {
      success: false,
      error: error.message || '입술 검출에 실패했습니다.',
      data: {
        lipPoints: [],
        faceDetected: false,
        width: 0,
        height: 0,
      },
    };
  }
};


import { get, del, uploadFormData } from './api';
import { getUser } from '../utils/storage';

/**
 * 이미지 업로드
 * @param {Object} file - 이미지 파일 객체 (react-native-image-picker의 asset)
 * @param {Object} options - { user_id?, image_type?, position? }
 * @param {Function} onProgress - 업로드 진행률 콜백 (0-100)
 * @returns {Promise<Object>} - { success, message, data: { image_id, cloudinary_url, analysis_status } }
 */
export const uploadImage = async (file, options = {}, onProgress = null) => {
  try {
    // 파일 URI 정규화 (iOS의 경우 file:// 제거가 필요할 수 있음)
    let imageUri = file.uri;
    if (imageUri.startsWith('file://')) {
      // React Native에서는 file://를 그대로 사용해야 함
      imageUri = imageUri;
    }

    // 파일명 생성
    const fileName = file.fileName || file.originalFileName || `image_${Date.now()}.jpg`;
    
    // MIME 타입 결정
    let mimeType = file.type || 'image/jpeg';
    if (!mimeType && fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };
      mimeType = mimeTypes[ext] || 'image/jpeg';
    }

    const formData = new FormData();
    
    // 이미지 파일 추가 (React Native FormData 형식)
    formData.append('image', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    });

    // 선택적 필드 추가
    if (options.user_id) {
      formData.append('user_id', options.user_id.toString());
    }
    if (options.image_type) {
      formData.append('image_type', options.image_type);
    }
    if (options.position) {
      formData.append('position', options.position);
    }

    // 진행률 추적 시뮬레이션
    if (onProgress) {
      onProgress(10);
      setTimeout(() => onProgress(50), 100);
      setTimeout(() => onProgress(80), 200);
    }

    const response = await uploadFormData('/images/upload', formData);
    
    if (onProgress) {
      onProgress(100);
    }

    console.log('uploadImage 응답:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    console.error('uploadImage 상세 오류:', {
      error,
      file: {
        uri: file?.uri,
        type: file?.type,
        fileName: file?.fileName,
      },
      options,
    });
    
    throw {
      status: error.status || 500,
      message: error.message || getErrorMessage(error.status, '이미지 업로드'),
      data: error.data || null,
    };
  }
};

/**
 * 분석 상태 조회
 * @param {number} imageId - 이미지 ID
 * @returns {Promise<Object>} - { success, data: { id, cloudinary_url, analysis_status, ... } }
 */
export const getImageStatus = async (imageId) => {
  try {
    const response = await get(`/images/${imageId}/status`);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '분석 상태 조회'),
      data: error.data || null,
    };
  }
};

/**
 * 분석 결과 조회
 * @param {number} imageId - 이미지 ID
 * @returns {Promise<Object>} - { success, data: { image_id, analysis, ... } }
 */
export const getImageAnalysis = async (imageId) => {
  try {
    const response = await get(`/images/${imageId}/analysis`);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '분석 결과 조회'),
      data: error.data || null,
    };
  }
};

/**
 * 사용자 이미지 목록 조회
 * @param {number} userId - 사용자 ID
 * @param {Object} options - { status? }
 * @returns {Promise<Object>} - { success, count, data: [...] }
 */
export const getUserImages = async (userId, options = {}) => {
  try {
    let endpoint = `/images/user/${userId}`;
    const queryParams = [];
    
    if (options.status) {
      queryParams.push(`status=${options.status}`);
    }
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }

    const response = await get(endpoint);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '이미지 목록 조회'),
      data: error.data || null,
    };
  }
};

/**
 * 이미지 삭제
 * @param {number} imageId - 이미지 ID
 * @returns {Promise<Object>} - { success, message }
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await del(`/images/${imageId}`);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '이미지 삭제'),
      data: error.data || null,
    };
  }
};

/**
 * 분석 상태 폴링 (비동기 분석 완료 대기)
 * @param {number} imageId - 이미지 ID
 * @param {Object} options - { interval?: number, maxAttempts?: number, onStatusChange?: Function }
 * @returns {Promise<Object>} - 분석 결과 데이터
 */
export const pollAnalysisStatus = async (imageId, options = {}) => {
  const {
    interval = 2500, // 2.5초 간격
    maxAttempts = 60, // 최대 60회 시도 (약 2.5분)
    onStatusChange = null,
  } = options;

  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        
        const statusResponse = await getImageStatus(imageId);
        const status = statusResponse.data?.analysis_status;

        if (onStatusChange) {
          onStatusChange(status, attempts);
        }

        if (status === 'completed') {
          // 분석 완료 - 결과 조회
          const analysisResponse = await getImageAnalysis(imageId);
          resolve(analysisResponse);
          return;
        }

        if (status === 'failed') {
          reject({
            status: 500,
            message: '분석에 실패했습니다. 다시 시도해주세요.',
            data: statusResponse.data,
          });
          return;
        }

        if (attempts >= maxAttempts) {
          reject({
            status: 408,
            message: '분석 시간이 초과되었습니다. 잠시 후 다시 확인해주세요.',
            data: statusResponse.data,
          });
          return;
        }

        // 계속 폴링
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
};

/**
 * History ID로 분석 결과 조회 (3개 사진 세트)
 * @param {string} historyId - History ID (UUID v4)
 * @returns {Promise<Object>} - { success, data: { upper, lower, front } }
 */
export const getHistoryAnalysis = async (historyId) => {
  try {
    const response = await get(`/images/history/${historyId}/analysis`);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '분석 결과 조회'),
      data: error.data || null,
    };
  }
};

/**
 * 사용자의 모든 history_id 목록 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Object>} - { success, count, data: [...] }
 */
export const getUserHistories = async (userId) => {
  try {
    const response = await get(`/images/user/${userId}/histories`);
    return response;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: getErrorMessage(error.status, '히스토리 목록 조회'),
      data: error.data || null,
    };
  }
};

/**
 * History ID의 분석 상태 폴링 (3개 사진 세트)
 * @param {string} historyId - History ID (UUID v4)
 * @param {Object} options - { interval?: number, maxAttempts?: number, onStatusChange?: Function }
 * @returns {Promise<Object>} - 분석 결과 데이터
 */
export const pollHistoryAnalysisStatus = async (historyId, options = {}) => {
  const {
    interval = 2500, // 2.5초 간격
    maxAttempts = 60, // 최대 60회 시도 (약 2.5분)
    onStatusChange = null,
  } = options;

  let attempts = 0;

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        attempts++;
        
        const response = await getHistoryAnalysis(historyId);
        
        // 3개 사진 모두 분석 완료되었는지 확인
        const upper = response.data?.upper;
        const lower = response.data?.lower;
        const front = response.data?.front;
        
        const allCompleted = upper?.analysis && lower?.analysis && front?.analysis;
        const anyFailed = [upper, lower, front].some(img => img?.analysis_status === 'failed');

        if (onStatusChange) {
          const status = allCompleted ? 'completed' : anyFailed ? 'failed' : 'processing';
          onStatusChange(status, attempts);
        }

        if (allCompleted) {
          resolve(response);
          return;
        }

        if (anyFailed) {
          reject({
            status: 500,
            message: '일부 이미지의 분석에 실패했습니다.',
            data: response.data,
          });
          return;
        }

        if (attempts >= maxAttempts) {
          reject({
            status: 408,
            message: '분석 시간이 초과되었습니다. 잠시 후 다시 확인해주세요.',
            data: response.data,
          });
          return;
        }

        // 계속 폴링
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
};

/**
 * HTTP 상태 코드에 따른 에러 메시지 반환
 * @param {number} status - HTTP 상태 코드
 * @param {string} action - 수행 중인 작업명
 * @returns {string} - 에러 메시지
 */
const getErrorMessage = (status, action) => {
  switch (status) {
    case 400:
      return `${action} 요청이 잘못되었습니다. 입력 정보를 확인해주세요.`;
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 408:
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    case 413:
      return '파일 크기가 너무 큽니다.';
    case 415:
      return '지원하지 않는 파일 형식입니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    default:
      return `${action} 중 오류가 발생했습니다.`;
  }
};


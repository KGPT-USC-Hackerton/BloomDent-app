// API 기본 설정
const API_BASE_URL = 'http://192.168.0.61:3001/api';

// 공통 fetch 함수
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // 토큰이 있으면 헤더에 추가 (나중에 JWT 토큰 사용 시)
  const token = await import('../utils/storage').then(m => m.getToken());
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || '요청 처리 중 오류가 발생했습니다.',
        data: data,
      };
    }

    return data;
  } catch (error) {
    // 네트워크 오류 처리
    if (error.message === 'Network request failed') {
      throw {
        status: 0,
        message: '네트워크 연결을 확인해주세요.',
        data: null,
      };
    }
    throw error;
  }
};

// GET 요청
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'GET',
  });
};

// POST 요청
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

// PUT 요청
export const put = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

// DELETE 요청
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'DELETE',
  });
};

// FormData 업로드 (이미지 등) - 타임아웃 및 재시도 로직 포함
export const uploadFormData = async (endpoint, formData, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeout = options.timeout || 60000; // 기본 60초 타임아웃
  const maxRetries = options.maxRetries || 2; // 최대 2회 재시도
  const retryDelay = options.retryDelay || 1000; // 재시도 간격 1초
  
  const defaultHeaders = {};
  
  // 토큰이 있으면 헤더에 추가
  const token = await import('../utils/storage').then(m => m.getToken());
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const makeRequest = async (attempt = 0) => {
    // AbortController로 타임아웃 구현
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const config = {
      ...options,
      method: 'POST',
      signal: controller.signal,
      headers: {
        ...defaultHeaders,
        ...options.headers,
        // FormData 사용 시 Content-Type은 자동으로 설정되므로 명시하지 않음
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || '업로드 중 오류가 발생했습니다.',
          data: data,
        };
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // AbortError는 타임아웃
      if (error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        throw {
          status: 408,
          message: '업로드 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
          data: null,
          error: error.message || 'Request timeout',
        };
      }
      
      // 네트워크 오류 처리
      if (error.message === 'Network request failed' || error.message?.includes('Network')) {
        throw {
          status: 0,
          message: '네트워크 연결을 확인해주세요.',
          data: null,
          error: error.message,
        };
      }
      
      // 재시도 가능한 오류인지 확인 (5xx 서버 오류 또는 타임아웃)
      const isRetryable = 
        (error.status >= 500 && error.status < 600) || 
        error.status === 408 || 
        error.status === 0 ||
        attempt < maxRetries;
      
      if (isRetryable && attempt < maxRetries) {
        console.log(`🔄 업로드 재시도 ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        return makeRequest(attempt + 1);
      }
      
      throw error;
    }
  };

  return makeRequest();
};


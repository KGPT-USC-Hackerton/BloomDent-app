import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 관련
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('@auth_token', token);
  } catch (error) {
    console.error('토큰 저장 오류:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    console.error('토큰 조회 오류:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@auth_token');
  } catch (error) {
    console.error('토큰 삭제 오류:', error);
  }
};

// 사용자 정보 관련
export const setUser = async (user) => {
  try {
    await AsyncStorage.setItem('@user_data', JSON.stringify(user));
  } catch (error) {
    console.error('사용자 정보 저장 오류:', error);
  }
};

export const getUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('@user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem('@user_data');
  } catch (error) {
    console.error('사용자 정보 삭제 오류:', error);
  }
};

// 설문 완료 여부 관련
export const setSurveyCompleted = async (completed) => {
  try {
    await AsyncStorage.setItem('@survey_completed', JSON.stringify(completed));
  } catch (error) {
    console.error('설문 완료 여부 저장 오류:', error);
  }
};

export const getSurveyCompleted = async () => {
  try {
    const completed = await AsyncStorage.getItem('@survey_completed');
    return completed ? JSON.parse(completed) : false;
  } catch (error) {
    console.error('설문 완료 여부 조회 오류:', error);
    return false;
  }
};

// 임시 회원가입 정보 저장 (설문 전)
export const setTempSignUpData = async (signUpData) => {
  try {
    await AsyncStorage.setItem('@temp_signup_data', JSON.stringify(signUpData));
  } catch (error) {
    console.error('임시 회원가입 정보 저장 오류:', error);
  }
};

export const getTempSignUpData = async () => {
  try {
    const data = await AsyncStorage.getItem('@temp_signup_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('임시 회원가입 정보 조회 오류:', error);
    return null;
  }
};

export const removeTempSignUpData = async () => {
  try {
    await AsyncStorage.removeItem('@temp_signup_data');
  } catch (error) {
    console.error('임시 회원가입 정보 삭제 오류:', error);
  }
};

// 모든 인증 데이터 삭제
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['@auth_token', '@user_data', '@survey_completed', '@temp_signup_data']);
  } catch (error) {
    console.error('인증 데이터 삭제 오류:', error);
  }
};


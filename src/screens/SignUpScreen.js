import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { setTempSignUpData } from '../utils/storage';
import { checkUsernameAvailability } from '../services/authService';

const SignUpScreen = ({ onNavigateToSurvey, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '아이디를 입력해주세요.';
    } else if (formData.username.length < 3) {
      newErrors.username = '아이디는 3자 이상이어야 합니다.';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // 아이디 중복 확인
      const usernameCheck = await checkUsernameAvailability(formData.username);
      
      if (!usernameCheck.available) {
        // 중복된 아이디인 경우
        setErrors((prev) => ({
          ...prev,
          username: usernameCheck.message || '이미 사용 중인 아이디입니다.',
        }));
        setLoading(false);
        return;
      }

      // 비밀번호 확인 필드 제거
      const { passwordConfirm, ...signUpData } = formData;
      
      // 임시로 회원가입 정보 저장 (설문 완료 후 DB에 저장)
      await setTempSignUpData(signUpData);
      
      // 설문 화면으로 이동
      if (onNavigateToSurvey) {
        onNavigateToSurvey();
      }
    } catch (error) {
      console.error('회원가입 정보 저장 오류:', error);
      
      // 네트워크 오류 등 기타 에러 처리
      if (error.status === 0) {
        Alert.alert('오류', '네트워크 연결을 확인해주세요.');
      } else {
        Alert.alert('오류', '회원가입 정보 저장 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>회원가입</Text>

          <TextInput
            style={[styles.input, errors.username && styles.inputError]}
            placeholder="아이디 *"
            value={formData.username}
            onChangeText={(value) => updateField('username', value)}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}

          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="비밀번호 *"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            textContentType="none"
            autoComplete="off"
            editable={!loading}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          <TextInput
            style={[styles.input, errors.passwordConfirm && styles.inputError]}
            placeholder="비밀번호 확인 *"
            value={formData.passwordConfirm}
            onChangeText={(value) => updateField('passwordConfirm', value)}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            textContentType="none"
            autoComplete="off"
            editable={!loading}
          />
          {errors.passwordConfirm && (
            <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
          )}

          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="이름 *"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            editable={!loading}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}

          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="전화번호 (선택)"
            value={formData.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
            editable={!loading}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}

          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="이메일 (선택)"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>회원가입</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onBackToLogin}
            disabled={loading}
          >
            <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    width: '100%',
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default SignUpScreen;


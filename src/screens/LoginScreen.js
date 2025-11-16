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
} from 'react-native';
import { login } from '../services/authService';

const LoginScreen = ({ onLogin, onNavigateToSignUp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await login(username.trim(), password);
      
      if (response.success) {
        // 로그인 성공
        if (onLogin) {
          onLogin(response.data.user);
        }
      }
    } catch (error) {
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (error.status === 401) {
        errorMessage = error.message || '아이디 또는 비밀번호가 일치하지 않습니다.';
      } else if (error.status === 400) {
        errorMessage = error.message || '아이디와 비밀번호를 입력해주세요.';
      } else if (error.status === 0) {
        errorMessage = error.message || '네트워크 연결을 확인해주세요.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Bloomdent에 오신 것을 환영합니다.</Text>
        <TextInput
          style={styles.input}
          placeholder="아이디"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="none"
          autoComplete="off"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>로그인</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={onNavigateToSignUp}
          disabled={loading}
        >
          <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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

export default LoginScreen;
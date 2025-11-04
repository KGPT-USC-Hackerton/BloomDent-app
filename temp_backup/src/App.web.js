// 웹 전용 App - 순수 React로 구현
import React, { useState, useEffect } from 'react';
import SurveyScreenWeb from './screens/SurveyScreen.web';

// 웹용 로그인 화면 (순수 React)
function LoginScreenWeb({ onLogin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 아이디나 비밀번호 어느 곳에 'test' 입력해도 로그인 성공
    if (id.trim().toLowerCase() === 'test' || password.trim().toLowerCase() === 'test') {
      onLogin();
    } else {
      alert('올바른 입력값을 입력해주세요.');
    }
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginContent}>
        <h1 style={styles.title}>로그인</h1>
        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          style={styles.input}
        />
        <button onClick={handleLogin} style={styles.button}>
          로그인
        </button>
      </div>
    </div>
  );
}

// 웹용 홈 스크린 - 원래 HomeScreen과 유사한 구조
function HomeScreenWeb() {
  return (
    <div style={styles.mainContainer}>
      <div style={styles.greeting}>
        <h1 style={styles.greetingTitle}>안녕하세요! 👋</h1>
        <p style={styles.greetingSubtext}>오늘도 건강한 구강관리를 시작해보세요</p>
        <p style={styles.dateText}>2025년 10월 14일</p>
      </div>

      <div style={styles.healthCard}>
        <div style={styles.healthCardContent}>
          <div style={styles.healthInfo}>
            <h3 style={styles.healthTitle}>구강 건강 점수</h3>
            <div style={styles.scoreContainer}>
              <span style={styles.scoreText}>85</span>
              <span style={styles.scoreMax}>/ 100</span>
            </div>
          </div>
          <div style={styles.iconContainer}>📈</div>
        </div>
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>오늘의 구강관리</h2>
        <div style={styles.todoList}>
          <div style={styles.todoItem}>
            <div style={{...styles.todoCircle, backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>✓</div>
            <span style={styles.todoText}>아침 양치질</span>
          </div>
          <div style={styles.todoItem}>
            <div style={{...styles.todoCircle, backgroundColor: '#e5e7eb'}}>○</div>
            <span style={styles.todoText}>구강 사진 촬영</span>
          </div>
          <div style={styles.todoItem}>
            <div style={{...styles.todoCircle, backgroundColor: '#e5e7eb'}}>○</div>
            <span style={styles.todoText}>저녁 양치질</span>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>최근 기록</h2>
        <div style={styles.recordList}>
          <div style={styles.recordCard}>
            <div style={styles.recordContent}>
              <div style={styles.recordIconContainer}>📷</div>
              <div style={styles.recordInfo}>
                <div style={styles.recordTitle}>구강 사진 분석</div>
                <div style={styles.recordDate}>9월 22일</div>
              </div>
            </div>
            <span style={styles.recordStatus}>양호</span>
          </div>
          
          <div style={styles.recordCard}>
            <div style={styles.recordContent}>
              <div style={{...styles.recordIconContainer, backgroundColor: '#dcfce7'}}>📅</div>
              <div style={styles.recordInfo}>
                <div style={styles.recordTitle}>치과 예약</div>
                <div style={styles.recordDate}>9월 25일 예정</div>
              </div>
            </div>
            <span style={{...styles.recordStatus, color: '#2563eb'}}>완료</span>
          </div>
        </div>
      </div>

      <div style={styles.tipCard}>
        <div style={styles.tipContent}>
          <div style={styles.tipIconContainer}>🏆</div>
          <div style={styles.tipTextContainer}>
            <h3 style={styles.tipTitle}>오늘의 팁</h3>
            <p style={styles.tipText}>
              칫솔질 후 30분 이내에는 음식을 섭취하지 않는 것이 좋습니다. 
              불소가 치아에 완전히 흡수될 시간을 주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 메인 App 컴포넌트
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // 로그인 시 설문 완료 상태 초기화 (새로 로그인할 때마다 설문 진행)
    setSurveyCompleted(false);
  };

  const handleSurveyComplete = (answers) => {
    // 설문 답변 저장
    console.log('Survey answers:', answers);
    // localStorage에는 저장하지 않고 state로만 관리 (매번 로그인 시 설문 진행)
    setSurveyCompleted(true);
  };

  if (!isLoggedIn) {
    return <LoginScreenWeb onLogin={handleLogin} />;
  }

  if (!surveyCompleted) {
    return <SurveyScreenWeb onComplete={handleSurveyComplete} />;
  }

  return <HomeScreenWeb />;
}

// 스타일 정의
const styles = {
  loginContainer: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  loginContent: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '40px',
    color: '#333',
    margin: 0,
  },
  input: {
    width: '100%',
    height: '50px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '0 15px',
    fontSize: '16px',
    marginBottom: '20px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    height: '50px',
    backgroundColor: '#007AFF',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  mainContainer: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '16px',
    boxSizing: 'border-box',
  },
  greeting: {
    textAlign: 'center',
    padding: '24px 16px',
  },
  greetingTitle: {
    fontSize: '20px',
    color: '#374151',
    marginBottom: '8px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  greetingSubtext: {
    color: '#6b7280',
    marginBottom: '4px',
    margin: '0 0 4px 0',
  },
  dateText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  healthCard: {
    margin: '16px',
    padding: '16px',
    backgroundColor: '#eff6ff',
    borderRadius: '12px',
    border: '1px solid #dbeafe',
  },
  healthCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  healthInfo: {
    flex: 1,
  },
  healthTitle: {
    color: '#374151',
    marginBottom: '4px',
    fontSize: '16px',
    margin: '0 0 4px 0',
  },
  scoreContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: '24px',
    color: '#2563eb',
    marginRight: '8px',
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: '14px',
    color: '#6b7280',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    backgroundColor: '#3b82f6',
    borderRadius: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#bfdbfe',
    borderRadius: '4px',
  },
  progressFill: {
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
    width: '80%',
  },
  section: {
    margin: '0 16px 24px',
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: '12px',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  todoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  todoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  todoCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
  },
  todoText: {
    color: '#374151',
    fontSize: '16px',
  },
  recordList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recordCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  recordContent: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
  },
  recordIconContainer: {
    width: '40px',
    height: '40px',
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    fontSize: '20px',
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    color: '#374151',
    fontSize: '16px',
    marginBottom: '2px',
  },
  recordDate: {
    fontSize: '14px',
    color: '#6b7280',
  },
  recordStatus: {
    fontSize: '14px',
    color: '#10b981',
  },
  tipCard: {
    margin: '16px',
    padding: '16px',
    backgroundColor: '#fefce8',
    borderRadius: '12px',
    border: '1px solid #fde047',
  },
  tipContent: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: '32px',
    height: '32px',
    backgroundColor: '#eab308',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    marginTop: '4px',
    fontSize: '16px',
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    color: '#374151',
    marginBottom: '4px',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  tipText: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '20px',
    margin: 0,
  },
};

export default App;

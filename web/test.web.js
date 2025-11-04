// 간단한 테스트 - React Native Web 없이 순수 React로 테스트
import React from 'react';
import { createRoot } from 'react-dom/client';

function TestApp() {
  return React.createElement('div', {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
    }
  }, '로그인 화면 테스트 - 이 메시지가 보이면 React는 작동합니다!');
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(React.createElement(TestApp));
  console.log('Test component rendered');
} else {
  console.error('Root element not found!');
}


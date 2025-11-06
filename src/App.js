import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './screens/HomeScreen';
import CareScreen from './screens/CareScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import MyPageScreen from './screens/MyPageScreen';
import LoginScreen from './screens/LoginScreen';
import Start_SurveyScreen from './screens/Start_SurveyScreen';
import LearnScreen from './screens/LearnScreen';

const Tab = createBottomTabNavigator();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  // 앱 시작 시 설문 완료 여부 확인 (AsyncStorage 대신 간단하게 localStorage 사용)
  useEffect(() => {
    // React Native에서는 AsyncStorage를 사용해야 하지만, 
    // 여기서는 간단한 state로 관리 (웹에서는 localStorage 사용)
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // 로그인 후 설문 완료 여부 확인은 SurveyScreen에서 처리
  };

  const handleSurveyComplete = (answers) => {
    // 설문 답변 저장 (실제로는 서버에 전송하거나 저장)
    console.log('Survey answers:', answers);
    setSurveyCompleted(true);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!surveyCompleted) {
    return <Start_SurveyScreen onComplete={handleSurveyComplete} />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.topSafeArea} />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: '홈',
              tabBarIcon: ({ color, size }) => (
                <Icon name="home" color={color} size={size} />
              ),
            }}
          />
          
          <Tab.Screen
            name="Learn"
            component={LearnScreen} // ✅ LearnNavigator → LearnScreen
            options={{
              title: '학습',
              tabBarIcon: ({ color, size }) => (
                <Icon name="menu-book" color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Care"
            component={CareScreen}
            options={{
              title: '관리',
              tabBarIcon: ({ color, size }) => (
                <Icon name="camera" color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="Appointment"
            component={AppointmentScreen}
            options={{
              title: '예약',
              tabBarIcon: ({ color, size }) => (
                <Icon name="calendar-month" color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen
            name="My Page"
            component={MyPageScreen}
            options={{
              title: '마이페이지',
              tabBarIcon: ({ color, size }) => (
                <Icon name="person" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topSafeArea: { flex: 0, backgroundColor: '#f8f9fa' },
});

export default App;

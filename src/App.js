import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from './screens/HomeScreen';
import CareScreen from './screens/CareScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import MyPageScreen from './screens/MyPageScreen';
import LearnScreen from './screens/LearnScreen'; // ✅ 수정

const Tab = createBottomTabNavigator();

function App() {
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

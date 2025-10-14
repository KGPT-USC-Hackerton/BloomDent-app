import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import CareScreen from './screens/CareScreen';
import AppointmentScreen from './screens/AppointmentScreen';
import MyPageScreen from './screens/MyPageScreen';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Care" component={CareScreen} />
          <Tab.Screen name="Appointment" component={AppointmentScreen} />
          <Tab.Screen name="MyPage" component={MyPageScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
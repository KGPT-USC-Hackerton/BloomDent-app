import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import CareScreen from './screens/CareScreen';
const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator initialRouteName="Home">
	      <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Care" component={CareScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
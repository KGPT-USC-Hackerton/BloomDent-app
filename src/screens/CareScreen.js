import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function CareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>케어 화면입니다!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18 },
});

export default CareScreen;
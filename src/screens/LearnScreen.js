// src/screens/LearnScreen.js
import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import TopTabsChips from './learn/components/TopTabsChips';
import BrushingGuideScreen from './learn/BrushingGuideScreen';
import HygieneProductsScreen from './learn/HygieneProductsScreen';
import KnowledgeClipsScreen from './learn/KnowledgeClipsScreen';

const SCREENS = {
  BrushingGuide:   <BrushingGuideScreen />,
  HygieneProducts: <HygieneProductsScreen />,
  KnowledgeClips:  <KnowledgeClipsScreen />,
};

export default function LearnScreen() {
  const [active, setActive] = useState('BrushingGuide'); // ← 탭 key와 동일

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopTabsChips active={active} onChange={setActive} />
      <View style={{ flex: 1 }}>{SCREENS[active] || null}</View>
    </SafeAreaView>
  );
}

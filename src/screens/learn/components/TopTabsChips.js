// src/screens/learn/components/TopTabsChips.js
import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const TABS = [
  { key: 'BrushingGuide',   label: '칫솔질 가이드', icon: 'brush' },
  { key: 'HygieneProducts', label: '구강 위생용품', icon: 'cleaning-services' },
  { key: 'KnowledgeClips',  label: '치아 상식 클립', icon: 'ondemand-video' },
];

export default function TopTabsChips({ active, onChange = () => {} }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {TABS.map(t => {
          const isActive = active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onChange(t.key)}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <Icon name={t.icon} size={16} color={isActive ? '#fff' : '#111827'} style={{ marginRight: 6 }} />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  chipActive: { backgroundColor: '#14532D', borderColor: '#14532D' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  chipTextActive: { color: '#fff' },
});

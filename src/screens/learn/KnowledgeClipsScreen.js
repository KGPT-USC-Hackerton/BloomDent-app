import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DATA = [
  {
    id: '1',
    type: 'video',
    title: '설탕 음료와 충치의 관계',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
  },
  {
    id: '2',
    type: 'card',
    title: '불소의 역할',
    points: ['치아 표면 강화', '충치균 억제', '재광화 촉진'],
  },
  {
    id: '3',
    type: 'video',
    title: '칫솔 교체 주기',
    url: 'https://www.w3schools.com/html/movie.mp4',
  },
];

function ClipVideo({ title, url }) {
  const [paused, setPaused] = useState(true);
  const player = useRef(null);
  const [progress, setProgress] = useState(0);

  return (
    <Pressable onPress={() => setPaused(!paused)} style={styles.cardVideo}>
      <Text style={styles.h2}>{title}</Text>
      <Video
        ref={player}
        source={{ uri: url }}
        style={styles.video}
        paused={paused}
        resizeMode="cover"
        onProgress={p => {
          const ratio = Math.min(p.currentTime / 15, 1);
          setProgress(ratio);
          if (p.currentTime >= 15) setPaused(true);
        }}
      />
      <View style={styles.progressWrap}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.helper}>{paused ? '▶ 탭하여 재생' : '⏸ 일시정지'}</Text>
    </Pressable>
  );
}

function ClipCard({ title, points }) {
  return (
    <View style={styles.card}>
      <Text style={styles.h2}>{title}</Text>
      {points.map((p, i) => (
        <Text key={i} style={styles.li}>• {p}</Text>
      ))}
    </View>
  );
}

export default function KnowledgeClipsScreen() {
  const renderItem = ({ item }) =>
    item.type === 'video'
      ? <ClipVideo title={item.title} url={item.url} />
      : <ClipCard title={item.title} points={item.points} />;

  return (
    <FlatList
      data={DATA}
      keyExtractor={i => i.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16, backgroundColor: '#F8FAFC', gap: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  h2: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  li: { fontSize: 14, color: '#374151', lineHeight: 22 },
  cardVideo: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  video: { height: 200, borderRadius: 10, backgroundColor: '#000' },
  progressWrap: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 99, marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: '#2563EB' },
  helper: { fontSize: 12, color: '#64748B', marginTop: 6 },
});

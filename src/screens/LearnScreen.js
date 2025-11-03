import React, {useRef, useState} from 'react';
import {View, Text, FlatList, Dimensions, StyleSheet, Pressable} from 'react-native';

const {width} = Dimensions.get('window');
const CARD_W = width * 0.9;
const GAP = 16;

const CARDS = [
  {
    id: 'c1',
    title: '치아 번호 체계 익히기',
    points: ['FDI 표기: 11=우상중절치', '유치: 51~85', '임상에서 가장 많이 쓰는 표기 기억!'],
    bg: '#E8F0FF',
  },
  {
    id: 'c2',
    title: '우식(충치) 초기 징후',
    points: ['백색반점(탈회) 관찰', '찬물/단것 민감', '교합면의 착색 주의'],
    bg: '#FFF3E0',
  },
  {
    id: 'c3',
    title: '올바른 칫솔질 루틴',
    points: ['2분 이상, 하루 2~3회', '바스법: 45° 진동', '치실/치간칫솔 병행'],
    bg: '#E8F5E9',
  },
  {
    id: 'c4',
    title: '구강사진 촬영 팁',
    points: ['정면→좌→우→상→하 순서', '빛 반사 최소화', '치아 전체 프레임 확보'],
    bg: '#FCE4EC',
  },
];

const Dot = ({active}) => (
  <View style={[styles.dot, active && styles.dotActive]} />
);

export default function LearnScreen({navigation}) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);

  const renderItem = ({item}) => (
    <View style={[styles.card, {backgroundColor: item.bg}]}>
      <Text style={styles.title}>{item.title}</Text>
      {item.points.map((p, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.point}>{p}</Text>
        </View>
      ))}
      <Pressable
        style={styles.cta}
        onPress={() => navigation?.navigate?.('Care')}>
        <Text style={styles.ctaText}>관련 케어 보기</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={ref}
        data={CARDS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        contentContainerStyle={{paddingHorizontal: (width - CARD_W) / 2}}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        onMomentumScrollEnd={e => {
          const x = e.nativeEvent.contentOffset.x;
          const newIdx = Math.round(x / (CARD_W + GAP));
          setIdx(newIdx);
        }}
        getItemLayout={(_, index) => ({
          length: CARD_W + GAP,
          offset: (CARD_W + GAP) * index,
          index,
        })}
      />
      <View style={styles.dots}>
        {CARDS.map((_, i) => (
          <Dot key={i} active={i === idx} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center'},
  card: {
    width: CARD_W,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },
  title: {fontSize: 20, fontWeight: '700', marginBottom: 12},
  bulletRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6},
  bullet: {fontSize: 16, marginRight: 6, lineHeight: 20},
  point: {flex: 1, fontSize: 16, lineHeight: 22},
  dots: {flexDirection: 'row', alignSelf: 'center', marginTop: 16, gap: 6},
  dot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#C8CDD6'},
  dotActive: {backgroundColor: '#4F46E5', width: 16},
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  ctaText: {color: 'white', fontWeight: '600'},
});

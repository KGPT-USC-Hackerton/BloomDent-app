import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* 인사말과 오늘 날짜 */}
      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>안녕하세요! 👋</Text>
        <Text style={styles.greetingSubtext}>오늘도 건강한 구강관리를 시작해보세요</Text>
        <Text style={styles.dateText}>2025년 10월 14일</Text>
      </View>

      {/* 건강 현황 카드 */}
      <View style={styles.healthCard}>
        <View style={styles.healthCardContent}>
          <View style={styles.healthInfo}>
            <Text style={styles.healthTitle}>구강 건강 점수</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>85</Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📈</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* 오늘의 할 일 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘의 구강관리</Text>
        <View style={styles.todoList}>
          <View style={styles.todoItem}>
            <View style={[styles.todoCircle, styles.todoCompleted]}>
              <Text style={styles.todoCheckmark}>✓</Text>
            </View>
            <Text style={styles.todoText}>아침 양치질</Text>
          </View>
          <View style={styles.todoItem}>
            <View style={[styles.todoCircle, styles.todoPending]}>
              <Text style={styles.todoPendingText}>○</Text>
            </View>
            <Text style={styles.todoText}>구강 사진 촬영</Text>
          </View>
          <View style={styles.todoItem}>
            <View style={[styles.todoCircle, styles.todoPending]}>
              <Text style={styles.todoPendingText}>○</Text>
            </View>
            <Text style={styles.todoText}>저녁 양치질</Text>
          </View>
        </View>
      </View>

      {/* 최근 기록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 기록</Text>
        <View style={styles.recordList}>
          <View style={styles.recordCard}>
            <View style={styles.recordContent}>
              <View style={styles.recordIconContainer}>
                <Text style={styles.recordIcon}>📷</Text>
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>구강 사진 분석</Text>
                <Text style={styles.recordDate}>9월 22일</Text>
              </View>
            </View>
            <Text style={styles.recordStatus}>양호</Text>
          </View>
          
          <View style={styles.recordCard}>
            <View style={styles.recordContent}>
              <View style={[styles.recordIconContainer, styles.greenBackground]}>
                <Text style={styles.recordIcon}>📅</Text>
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>치과 예약</Text>
                <Text style={styles.recordDate}>9월 25일 예정</Text>
              </View>
            </View>
            <Text style={[styles.recordStatus, styles.blueText]}>완료</Text>
          </View>
        </View>
      </View>

      {/* 건강 팁 */}
      <View style={styles.tipCard}>
        <View style={styles.tipContent}>
          <View style={styles.tipIconContainer}>
            <Text style={styles.tipIcon}>🏆</Text>
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>오늘의 팁</Text>
            <Text style={styles.tipText}>
              칫솔질 후 30분 이내에는 음식을 섭취하지 않는 것이 좋습니다. 
              불소가 치아에 완전히 흡수될 시간을 주세요.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  greeting: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  greetingTitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  greetingSubtext: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  healthCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  healthCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthInfo: {
    flex: 1,
  },
  healthTitle: {
    color: '#374151',
    marginBottom: 4,
    fontSize: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    color: '#2563eb',
    marginRight: 8,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 14,
    color: '#6b7280',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#bfdbfe',
    borderRadius: 4,
    marginTop: 12,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    width: '80%',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#374151',
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  todoList: {
    gap: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  todoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  todoCompleted: {
    backgroundColor: '#10b981',
  },
  todoPending: {
    backgroundColor: '#e5e7eb',
  },
  todoCheckmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  todoPendingText: {
    color: '#6b7280',
    fontSize: 12,
  },
  todoText: {
    color: '#374151',
    fontSize: 16,
  },
  recordList: {
    gap: 12,
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  greenBackground: {
    backgroundColor: '#dcfce7',
  },
  recordIcon: {
    fontSize: 20,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    color: '#374151',
    fontSize: 16,
    marginBottom: 2,
  },
  recordDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  recordStatus: {
    fontSize: 14,
    color: '#10b981',
  },
  blueText: {
    color: '#2563eb',
  },
  tipCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fefce8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#eab308',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    color: '#374151',
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
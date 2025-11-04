import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OralCareRecordComponent({ records = [] }) {
  if (!records.length) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>기록이 아직 없습니다</Text>
        <Text style={styles.emptySubtitle}>관리 활동을 추가하면 타임라인이 채워집니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      {records.map((record, index) => {
        const isLastItem = index === records.length - 1;
        const statusColors = getStatusColors(record.status);

        return (
          <View key={record.date} style={styles.timelineCard}>
            <View style={styles.timelineContent}>
              <View style={styles.timelineIndicator}>
                <View style={[styles.timelineDot, { backgroundColor: statusColors.dot }]} />
                {!isLastItem && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineInfo}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineDate}>{record.date}</Text>
                  <View style={[styles.scoreTag, { backgroundColor: statusColors.tag }]}>
                    <Text style={[styles.scoreTagText, { color: statusColors.tagText }]}>
                      점수: {record.score}
                    </Text>
                  </View>
                </View>
                <Text style={styles.timelineNote}>{record.note}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function getStatusColors(status) {
  switch (status) {
    case 'warning':
      return { dot: '#f59e0b', tag: '#fef3c7', tagText: '#92400e' };
    case 'good':
      return { dot: '#10b981', tag: '#dcfce7', tagText: '#166534' };
    default:
      return { dot: '#6b7280', tag: '#f3f4f6', tagText: '#374151' };
  }
}

const styles = StyleSheet.create({
  timelineContainer: {
    gap: 16,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timelineContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
    marginTop: 8,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  timelineDate: {
    color: '#374151',
    fontSize: 16,
  },
  scoreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineNote: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});

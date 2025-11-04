import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function AppointmentScreen() {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState([]);

  const mockClinics = [
    {
      id: 1,
      name: '서울치과의원',
      address: '서울시 강남구 테헤란로 123',
      rating: 4.8,
      distance: '0.5km',
      availableSlots: ['09:00', '10:30', '14:00', '16:30'],
      phone: '02-123-4567'
    },
    {
      id: 2,
      name: '건강한치과',
      address: '서울시 강남구 역삼동 456',
      rating: 4.6,
      distance: '0.8km',
      availableSlots: ['09:30', '11:00', '15:00', '17:00'],
      phone: '02-234-5678'
    },
    {
      id: 3,
      name: '미소치과병원',
      address: '서울시 강남구 논현동 789',
      rating: 4.9,
      distance: '1.2km',
      availableSlots: ['10:00', '13:30', '15:30'],
      phone: '02-345-6789'
    }
  ];

  const surveyQuestions = [
    {
      question: '현재 치아나 잇몸에 통증이 있나요?',
      options: ['없음', '약간의 통증', '심한 통증', '참을 수 없는 통증']
    },
    {
      question: '최근 언제 치과 검진을 받으셨나요?',
      options: ['3개월 이내', '6개월 이내', '1년 이내', '1년 이상']
    },
    {
      question: '주요 증상은 무엇인가요?',
      options: ['정기검진', '치아 통증', '잇몸 출혈', '치석 제거']
    }
  ];

  const handleBooking = (clinic) => {
    setSelectedClinic(clinic);
    setShowSurvey(true);
  };

  const handleSurveyAnswer = (answer) => {
    const newAnswers = [...surveyAnswers, answer];
    setSurveyAnswers(newAnswers);
    
    if (surveyStep < surveyQuestions.length - 1) {
      setSurveyStep(surveyStep + 1);
    } else {
      Alert.alert('완료', '예약이 완료되었습니다!');
      setShowSurvey(false);
      setSurveyStep(0);
      setSurveyAnswers([]);
    }
  };

  if (showSurvey) {
    return (
      <View style={styles.container}>
        <View style={styles.surveyHeader}>
          <Text style={styles.surveyTitle}>사전 자가진단</Text>
          <Text style={styles.surveySubtext}>
            더 나은 진료를 위해 몇 가지 질문에 답해주세요
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((surveyStep + 1) / surveyQuestions.length) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.surveyCard}>
          <Text style={styles.surveyQuestion}>
            {surveyQuestions[surveyStep].question}
          </Text>
          <View style={styles.surveyOptions}>
            {surveyQuestions[surveyStep].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSurveyAnswer(option)}
                style={styles.surveyOption}
              >
                <Text style={styles.surveyOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.surveyFooter}>
          <TouchableOpacity
            onPress={() => setShowSurvey(false)}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>나중에 하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 지도 영역 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>근처 치과 찾기</Text>
        <View style={styles.mapCard}>
          <View style={styles.mapContainer}>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapIcon}>🗺️</Text>
              <Text style={styles.mapText}>현재 위치 기준</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 치과 리스트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>예약 가능한 치과</Text>
        <View style={styles.clinicList}>
          {mockClinics.map((clinic) => (
            <View key={clinic.id} style={styles.clinicCard}>
              <View style={styles.clinicInfo}>
                <View style={styles.clinicHeader}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  <View style={styles.clinicRating}>
                    <Text style={styles.starIcon}>⭐</Text>
                    <Text style={styles.ratingText}>{clinic.rating}</Text>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.distanceText}>{clinic.distance}</Text>
                  </View>
                </View>

                <View style={styles.clinicDetails}>
                  <View style={styles.clinicDetail}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{clinic.address}</Text>
                  </View>
                  <View style={styles.clinicDetail}>
                    <Text style={styles.detailIcon}>📞</Text>
                    <Text style={styles.detailText}>{clinic.phone}</Text>
                  </View>
                </View>

                <View style={styles.slotsSection}>
                  <Text style={styles.slotsLabel}>예약 가능 시간</Text>
                  <View style={styles.slotsContainer}>
                    {clinic.availableSlots.map((slot, index) => (
                      <View key={index} style={styles.slotTag}>
                        <Text style={styles.slotText}>{slot}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleBooking(clinic)}
                  style={styles.bookingButton}
                >
                  <Text style={styles.bookingButtonText}>📅 예약하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 예약 현황 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>예약 현황</Text>
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentContent}>
            <View style={styles.appointmentIcon}>
              <Text style={styles.appointmentIconText}>✅</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentClinic}>서울치과의원</Text>
              <Text style={styles.appointmentDate}>9월 25일 14:00</Text>
            </View>
          </View>
          <Text style={styles.appointmentArrow}>→</Text>
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
  surveyHeader: {
    padding: 16,
    backgroundColor: 'white',
  },
  surveyTitle: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  surveySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  surveyCard: {
    margin: 16,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  surveyQuestion: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  surveyOptions: {
    gap: 12,
  },
  surveyOption: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  surveyOptionText: {
    color: '#374151',
    fontSize: 16,
  },
  surveyFooter: {
    alignItems: 'center',
    marginTop: 24,
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    color: '#6b7280',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 16,
  },
  mapCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapContainer: {
    height: 192,
    backgroundColor: '#dbeafe',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapText: {
    color: 'white',
    fontSize: 16,
  },
  clinicList: {
    gap: 16,
  },
  clinicCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  clinicInfo: {
    gap: 12,
  },
  clinicHeader: {
    marginBottom: 8,
  },
  clinicName: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  clinicRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starIcon: {
    fontSize: 16,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    fontSize: 14,
    color: '#9ca3af',
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  clinicDetails: {
    gap: 8,
  },
  clinicDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  slotsSection: {
    marginTop: 8,
  },
  slotsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  slotTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
  },
  slotText: {
    color: '#1d4ed8',
    fontSize: 12,
  },
  bookingButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appointmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentIconText: {
    fontSize: 20,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClinic: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  appointmentArrow: {
    color: '#9ca3af',
    fontSize: 20,
  },
});
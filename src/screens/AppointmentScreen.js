import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform, PermissionsAndroid } from 'react-native';
import { NaverMapView, NaverMapMarkerOverlay } from '@mj-studio/react-native-naver-map';
import Geolocation from '@react-native-community/geolocation';

export default function AppointmentScreen() {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState([]);
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.5665, // 서울 기본 좌표
    longitude: 126.9780,
  });

  // 현재 위치 가져오기
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: '위치 권한 요청',
              message: '근처 치과를 찾기 위해 위치 권한이 필요합니다.',
              buttonNeutral: '나중에',
              buttonNegative: '거부',
              buttonPositive: '허용',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          }
        } catch (err) {
          console.warn(err);
        }
      } else {
        // iOS는 Info.plist 설정만으로 자동 요청
        getCurrentLocation();
      }
    };

    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log('위치 가져오기 실패:', error);
          Alert.alert(
            '위치 정보',
            '현재 위치를 가져올 수 없습니다. 기본 위치(서울)를 표시합니다.',
            [{ text: '확인' }]
          );
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);

  const mockClinics = [
    {
      id: 1,
      name: '서울치과의원',
      address: '서울시 강남구 테헤란로 123',
      latitude: 37.5665,
      longitude: 127.0380,
      rating: 4.8,
      distance: '0.5km',
      availableSlots: ['09:00', '10:30', '14:00', '16:30'],
      phone: '02-123-4567'
    },
    {
      id: 2,
      name: '건강한치과',
      address: '서울시 강남구 역삼동 456',
      latitude: 37.5010,
      longitude: 127.0360,
      rating: 4.6,
      distance: '0.8km',
      availableSlots: ['09:30', '11:00', '15:00', '17:00'],
      phone: '02-234-5678'
    },
    {
      id: 3,
      name: '미소치과병원',
      address: '서울시 강남구 논현동 789',
      latitude: 37.5110,
      longitude: 127.0220,
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
        <TouchableOpacity 
          style={styles.mapCard}
          onPress={() => setShowFullscreenMap(true)}
          activeOpacity={0.8}
        >
          <NaverMapView
            style={styles.mapContainer}
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              zoom: 15,
            }}
          >
            {/* 현재 위치 마커 */}
            <NaverMapMarkerOverlay
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </NaverMapMarkerOverlay>
            
            {/* 치과 마커들 */}
            {mockClinics.map((clinic) => (
              <NaverMapMarkerOverlay
                key={clinic.id}
                latitude={clinic.latitude}
                longitude={clinic.longitude}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.clinicMarker}>
                  <View style={styles.clinicMarkerContent}>
                    <Text style={styles.clinicMarkerText}>🦷</Text>
                  </View>
                  <View style={styles.clinicMarkerArrow} />
                </View>
              </NaverMapMarkerOverlay>
            ))}
          </NaverMapView>
          <View style={styles.mapOverlayHint}>
            <Text style={styles.mapOverlayText}>📍 지도를 탭하여 확대</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 풀스크린 지도 모달 */}
      <Modal
        visible={showFullscreenMap}
        animationType="slide"
        onRequestClose={() => setShowFullscreenMap(false)}
      >
        <View style={styles.fullscreenMapContainer}>
          <NaverMapView
            style={styles.fullscreenMap}
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              zoom: 15,
            }}
          >
            {/* 현재 위치 마커 */}
            <NaverMapMarkerOverlay
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
              </View>
            </NaverMapMarkerOverlay>
            
            {/* 치과 마커들 */}
            {mockClinics.map((clinic) => (
              <NaverMapMarkerOverlay
                key={clinic.id}
                latitude={clinic.latitude}
                longitude={clinic.longitude}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.clinicMarker}>
                  <View style={styles.clinicMarkerContent}>
                    <Text style={styles.clinicMarkerText}>🦷</Text>
                  </View>
                  <View style={styles.clinicMarkerArrow} />
                </View>
              </NaverMapMarkerOverlay>
            ))}
          </NaverMapView>
          <TouchableOpacity
            style={styles.closeMapButton}
            onPress={() => setShowFullscreenMap(false)}
          >
            <Text style={styles.closeMapButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
  mapOverlayHint: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapOverlayText: {
    color: 'white',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mapText: {
    color: 'white',
    fontSize: 16,
  },
  fullscreenMapContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenMap: {
    flex: 1,
  },
  closeMapButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeMapButtonText: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '600',
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clinicMarker: {
    alignItems: 'center',
  },
  clinicMarkerContent: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clinicMarkerText: {
    fontSize: 20,
  },
  clinicMarkerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ef4444',
    marginTop: -2,
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
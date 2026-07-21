import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서비스 약관</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.paragraph}>
            본 약관은 BloomDent(이하 "회사")가 제공하는 구강 건강 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제2조 (정의)</Text>
          <Text style={styles.paragraph}>
            1. "서비스"란 회사가 제공하는 구강 건강 관리 관련 모든 서비스를 의미합니다.{'\n'}
            2. "이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.{'\n'}
            3. "콘텐츠"란 서비스를 통해 제공되는 모든 정보, 데이터, 텍스트, 이미지 등을 의미합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</Text>
          <Text style={styles.paragraph}>
            1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.{'\n'}
            2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.{'\n'}
            3. 변경된 약관은 공지된 날로부터 7일 후부터 효력이 발생합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제4조 (서비스의 제공 및 변경)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 다음과 같은 서비스를 제공합니다:{'\n'}
            - AI 기반 구강 건강 분석 서비스{'\n'}
            - 구강 건강 관리 기록 및 통계 서비스{'\n'}
            - 치과 예약 서비스{'\n'}
            - 구강 건강 관련 정보 제공 서비스{'\n'}
            2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시 이용자에게 사전 공지합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제5조 (이용자의 의무)</Text>
          <Text style={styles.paragraph}>
            1. 이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다:{'\n'}
            - 타인의 정보를 도용하는 행위{'\n'}
            - 서비스의 안정적 운영을 방해하는 행위{'\n'}
            - 법령 및 본 약관에 위배되는 행위{'\n'}
            2. 이용자는 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제6조 (개인정보 보호)</Text>
          <Text style={styles.paragraph}>
            회사는 이용자의 개인정보를 보호하기 위하여 노력하며, 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의 개인정보처리방침을 따릅니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제7조 (면책사항)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.{'\n'}
            2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.{'\n'}
            3. 회사가 제공하는 AI 분석 결과는 참고용이며, 실제 진단은 전문의의 상담을 받으시기 바랍니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제8조 (준거법 및 관할법원)</Text>
          <Text style={styles.paragraph}>
            본 약관은 대한민국 법률에 따라 규율되고 해석되며, 서비스와 관련하여 분쟁이 발생한 경우 서울중앙지방법원을 관할법원으로 합니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 약관은 2024년 1월 1일부터 시행됩니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    minWidth: 40,
  },
  backButtonText: {
    fontSize: 24,
    color: '#2563eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  placeholder: {
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});


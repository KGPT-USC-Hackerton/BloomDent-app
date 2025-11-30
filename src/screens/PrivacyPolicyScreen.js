import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보처리방침</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (개인정보의 처리 목적)</Text>
          <Text style={styles.paragraph}>
            BloomDent(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다:{'\n'}
            1. 서비스 제공: 구강 건강 관리 서비스 제공, 예약 서비스 제공{'\n'}
            2. 회원 관리: 회원 식별, 본인 확인, 부정 이용 방지{'\n'}
            3. 서비스 개선: 신규 서비스 개발, 맞춤형 서비스 제공{'\n'}
            4. 마케팅 및 광고: 이벤트 및 프로모션 정보 제공
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제2조 (개인정보의 처리 및 보유기간)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.{'\n'}
            2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:{'\n'}
            - 회원 가입 정보: 회원 탈퇴 시까지{'\n'}
            - 서비스 이용 기록: 3년{'\n'}
            - 결제 정보: 관련 법령에 따라 5년
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제3조 (처리하는 개인정보의 항목)</Text>
          <Text style={styles.paragraph}>
            회사는 다음의 개인정보 항목을 처리하고 있습니다:{'\n'}
            1. 필수 항목: 이름, 이메일, 전화번호, 비밀번호{'\n'}
            2. 선택 항목: 프로필 사진, 생년월일{'\n'}
            3. 자동 수집 항목: IP 주소, 쿠키, 서비스 이용 기록, 기기 정보
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제4조 (개인정보의 제3자 제공)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.{'\n'}
            2. 회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:{'\n'}
            - 이용자가 사전에 동의한 경우{'\n'}
            - 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제5조 (개인정보처리의 위탁)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:{'\n'}
            - 클라우드 서비스 제공: AWS (Amazon Web Services){'\n'}
            - 결제 서비스: 결제 대행사{'\n'}
            2. 회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제6조 (정보주체의 권리·의무 및 행사방법)</Text>
          <Text style={styles.paragraph}>
            1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:{'\n'}
            - 개인정보 처리정지 요구권{'\n'}
            - 개인정보 열람 요구권{'\n'}
            - 개인정보 정정·삭제 요구권{'\n'}
            - 개인정보 처리정지 요구권{'\n'}
            2. 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제7조 (개인정보의 파기)</Text>
          <Text style={styles.paragraph}>
            1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.{'\n'}
            2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:{'\n'}
            - 파기절차: 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.{'\n'}
            - 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제8조 (개인정보 보호책임자)</Text>
          <Text style={styles.paragraph}>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:{'\n\n'}
            개인정보 보호책임자{'\n'}
            - 성명: 홍길동{'\n'}
            - 직책: 개인정보보호팀장{'\n'}
            - 연락처: privacy@bloomdent.com, 02-1234-5678
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 방침은 2024년 1월 1일부터 시행됩니다.
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
    color: '#059669',
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


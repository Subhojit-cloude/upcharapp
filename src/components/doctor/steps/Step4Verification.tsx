import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoctorRegistrationData, GovIdType } from '../../../types/doctor';
import { ChecklistItem } from '../shared/ChecklistItem';

interface Step4VerificationProps {
  data: DoctorRegistrationData;
  updateData: (fields: Partial<DoctorRegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const Step4Verification: React.FC<Step4VerificationProps> = ({
  data,
  updateData,
  onSubmit,
  onBack,
  isSubmitting = false,
}) => {
  const [isFetchingDigiLocker, setIsFetchingDigiLocker] = useState(false);

  const handleDigiLockerSync = () => {
    setIsFetchingDigiLocker(true);
    setTimeout(() => {
      setIsFetchingDigiLocker(false);
      updateData({
        medCertUri: 'nmc_registration_cert_2015_verified.pdf',
        degreeUri: 'aiims_dm_cardiology_degree.pdf',
        govIdFrontUri: 'aadhaar_front.jpg',
        govIdBackUri: 'aadhaar_back.jpg',
      });
      Alert.alert(
        'DigiLocker Synced ⚡',
        'Successfully retrieved verified NMC Certificate, Degree, and Aadhaar Card in 1.4s.'
      );
    }, 1200);
  };

  const handleUploadDoc = (docType: string) => {
    Alert.alert(
      `Upload ${docType}`,
      'Choose upload source:',
      [
        {
          text: 'Scan via Camera',
          onPress: () => {
            if (docType === 'Degree Certificate') {
              updateData({ degreeUri: 'degree_scanned_doc.pdf' });
            } else if (docType === 'Medical Registration') {
              updateData({ medCertUri: 'nmc_registration_scanned.pdf' });
            }
            Alert.alert('Uploaded', `${docType} captured successfully.`);
          },
        },
        {
          text: 'Browse Files',
          onPress: () => {
            if (docType === 'Degree Certificate') {
              updateData({ degreeUri: 'degree_scanned_doc.pdf' });
            } else if (docType === 'Medical Registration') {
              updateData({ medCertUri: 'nmc_registration_scanned.pdf' });
            }
            Alert.alert('Uploaded', `${docType} selected successfully.`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleFinalSubmit = () => {
    if (!data.agreedTelemedicine || !data.agreedAuthenticity) {
      Alert.alert(
        'Regulatory Compliance Required',
        'Please review and check both compliance checkboxes before submitting for credentialing.'
      );
      return;
    }
    onSubmit();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title & Subtitle */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Identity & Document Verification</Text>
        <Text style={styles.subtitle}>
          Upload required medical licenses and identity proofs for regulatory compliance and final credentialing.
        </Text>
      </View>

      {/* ── DigiLocker Fast-Track Card ─────────────────────────────────── */}
      <View style={styles.digiLockerCard}>
        <View style={styles.digiLockerHeaderRow}>
          <View style={styles.digiIconCircle}>
            <Ionicons name="finger-print" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.digiTitleWrap}>
            <View style={styles.digiTitleWithBadge}>
              <Text style={styles.digiTitle}>Instant DigiLocker Sync</Text>
              <View style={styles.fastTrackBadge}>
                <Text style={styles.fastTrackText}>Fast-Track</Text>
              </View>
            </View>
            <Text style={styles.digiSubtitle}>
              Fetch verified Aadhaar & NMC registration in 30 seconds directly from government databases.
            </Text>
          </View>
        </View>

        <View style={styles.digiActionRow}>
          <TouchableOpacity
            style={styles.digiFetchBtn}
            onPress={handleDigiLockerSync}
            activeOpacity={0.8}
            disabled={isFetchingDigiLocker}
          >
            <Ionicons
              name="sync-outline"
              size={16}
              color="#0F766E"
              style={isFetchingDigiLocker ? styles.spinning : undefined}
            />
            <Text style={styles.digiFetchBtnText}>
              {isFetchingDigiLocker ? 'Syncing...' : 'Fetch via DigiLocker'}
            </Text>
          </TouchableOpacity>
          <View style={styles.syncSpeedNote}>
            <Text style={styles.lightningIcon}>⚡</Text>
            <Text style={styles.syncSpeedText}>30s sync</Text>
          </View>
        </View>
      </View>

      {/* ── Section 1: Required Credentials ───────────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="folder-open-outline" size={18} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Required Credentials</Text>
          </View>
          <Text style={styles.readyCountText}>3 of 4 Ready</Text>
        </View>

        {/* Doc 1: Medical Registration Certificate (Uploaded) */}
        <View style={styles.docItemCard}>
          <View style={styles.docItemHeader}>
            <View style={styles.docTitleBlock}>
              <Text style={styles.docTitle}>
                Medical Registration Certificate <Text style={styles.reqStar}>*</Text>
              </Text>
              <Text style={styles.docSub}>
                National Medical Commission (NMC) or State Medical Council
              </Text>
            </View>
            <View style={styles.uploadedPill}>
              <Ionicons name="checkmark-circle" size={12} color="#0F766E" />
              <Text style={styles.uploadedPillText}>Uploaded</Text>
            </View>
          </View>

          <View style={styles.filePreviewRow}>
            <View style={styles.fileIconBox}>
              <Ionicons name="document-text-outline" size={20} color="#0EA5E9" />
            </View>
            <View style={styles.fileDetails}>
              <Text style={styles.fileMainName} numberOfLines={1}>
                {data.medCertUri || 'nmc_registration_cert_2015.pdf'}
              </Text>
              <Text style={styles.fileMeta}>
                2.4 MB • <Text style={styles.legibleGreen}>✓ Verified & Legible</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.fileActionBtn}
              onPress={() => Alert.alert('Preview', 'Opening verified NMC document preview.')}
            >
              <Ionicons name="eye-outline" size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fileActionBtn}
              onPress={() => handleUploadDoc('Medical Registration')}
            >
              <Ionicons name="swap-horizontal-outline" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Doc 2: Degree & Super-Specialty Certificates (Pending or Uploaded) */}
        <View style={styles.docItemCard}>
          <View style={styles.docItemHeader}>
            <View style={styles.docTitleBlock}>
              <Text style={styles.docTitle}>
                Degree & Super-Specialty Certificates <Text style={styles.reqStar}>*</Text>
              </Text>
              <Text style={styles.docSub}>MBBS, MD, MS, DM or DNB formal degrees</Text>
            </View>
            {data.degreeUri ? (
              <View style={styles.uploadedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#0F766E" />
                <Text style={styles.uploadedPillText}>Uploaded</Text>
              </View>
            ) : (
              <View style={styles.pendingPill}>
                <Ionicons name="time-outline" size={12} color="#C2410C" />
                <Text style={styles.pendingPillText}>Pending</Text>
              </View>
            )}
          </View>

          {data.degreeUri ? (
            <View style={styles.filePreviewRow}>
              <View style={styles.fileIconBox}>
                <Ionicons name="school-outline" size={20} color="#0EA5E9" />
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileMainName} numberOfLines={1}>
                  {data.degreeUri}
                </Text>
                <Text style={styles.fileMeta}>
                  3.1 MB • <Text style={styles.legibleGreen}>✓ Verified Degree</Text>
                </Text>
              </View>
              <TouchableOpacity
                style={styles.fileActionBtn}
                onPress={() => handleUploadDoc('Degree Certificate')}
              >
                <Ionicons name="swap-horizontal-outline" size={16} color="#0EA5E9" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadCircle}>
                <Ionicons name="cloud-upload-outline" size={22} color="#0EA5E9" />
              </View>
              <Text style={styles.uploadTapText}>Tap to upload Degree Certificate</Text>
              <Text style={styles.uploadFormatNote}>Supports PDF, JPG, PNG (Max 10MB)</Text>
              <View style={styles.uploadActionsRow}>
                <TouchableOpacity
                  style={styles.scanBtn}
                  onPress={() => handleUploadDoc('Degree Certificate')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={14} color="#475569" />
                  <Text style={styles.scanBtnText}>Scan via Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => handleUploadDoc('Degree Certificate')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="folder-outline" size={14} color="#0F766E" />
                  <Text style={styles.browseBtnText}>Browse Files</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Doc 3: Government Photo ID Proof */}
        <View style={styles.docItemCard}>
          <View style={styles.docItemHeader}>
            <View style={styles.docTitleBlock}>
              <Text style={styles.docTitle}>
                Government Photo ID Proof <Text style={styles.reqStar}>*</Text>
              </Text>
              <Text style={styles.docSub}>
                Regulatory verification against government databases
              </Text>
            </View>
            <View style={styles.uploadedPill}>
              <Ionicons name="checkmark-circle" size={12} color="#0F766E" />
              <Text style={styles.uploadedPillText}>Uploaded</Text>
            </View>
          </View>

          {/* ID Type Segment Tabs */}
          <View style={styles.idTabsRow}>
            {(['aadhaar', 'pan', 'passport'] as GovIdType[]).map((idType) => {
              const isSelected = data.govIdType === idType;
              const label =
                idType === 'aadhaar'
                  ? 'Aadhaar Card'
                  : idType === 'pan'
                  ? 'PAN Card'
                  : 'Passport';
              return (
                <TouchableOpacity
                  key={idType}
                  style={[styles.idTab, isSelected && styles.idTabSelected]}
                  onPress={() => updateData({ govIdType: idType })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.idTabText, isSelected && styles.idTabTextSelected]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Front Preview */}
          <View style={styles.idFileRow}>
            <View style={styles.idIconBox}>
              <Ionicons name="card-outline" size={18} color="#0EA5E9" />
            </View>
            <View style={styles.fileDetails}>
              <View style={styles.idSideRow}>
                <Text style={styles.fileMainName}>
                  {data.govIdFrontUri || 'aadhaar_front.jpg'}
                </Text>
                <View style={styles.sideBadge}>
                  <Text style={styles.sideBadgeText}>FRONT</Text>
                </View>
              </View>
              <Text style={styles.fileMeta}>1.2 MB • Clear facial match</Text>
            </View>
            <TouchableOpacity
              style={styles.fileActionBtn}
              onPress={() => handleUploadDoc('Aadhaar Front')}
            >
              <Ionicons name="swap-horizontal-outline" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          {/* Back Preview */}
          <View style={[styles.idFileRow, { marginTop: 8 }]}>
            <View style={styles.idIconBox}>
              <Ionicons name="card-outline" size={18} color="#0EA5E9" />
            </View>
            <View style={styles.fileDetails}>
              <View style={styles.idSideRow}>
                <Text style={styles.fileMainName}>
                  {data.govIdBackUri || 'aadhaar_back.jpg'}
                </Text>
                <View style={styles.sideBadge}>
                  <Text style={styles.sideBadgeText}>BACK</Text>
                </View>
              </View>
              <Text style={styles.fileMeta}>1.1 MB • Address & QR visible</Text>
            </View>
            <TouchableOpacity
              style={styles.fileActionBtn}
              onPress={() => handleUploadDoc('Aadhaar Back')}
            >
              <Ionicons name="swap-horizontal-outline" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Section 2: Regulatory Compliance & Undertaking ────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="shield-outline" size={18} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>Regulatory Compliance & Undertaking</Text>
        </View>

        {/* Checkbox 1 */}
        <ChecklistItem
          checked={data.agreedTelemedicine}
          onToggle={() =>
            updateData({ agreedTelemedicine: !data.agreedTelemedicine })
          }
        >
          <Text style={styles.undertakingText}>
            I agree to adhere strictly to the{' '}
            <Text style={styles.boldBlue}>Telemedicine Practice Guidelines 2020</Text>{' '}
            issued by the Ministry of Health and Family Welfare, along with UPCHAR
            HEALTH clinical governance protocols.
          </Text>
        </ChecklistItem>

        {/* Checkbox 2 */}
        <ChecklistItem
          checked={data.agreedAuthenticity}
          onToggle={() =>
            updateData({ agreedAuthenticity: !data.agreedAuthenticity })
          }
        >
          <Text style={styles.undertakingText}>
            I certify that all medical credentials, council registrations,
            super-specialty degrees, and clinical experience submitted herein are
            authentic, unrevoked, and valid under Indian Law.
          </Text>
        </ChecklistItem>
      </View>

      {/* ── Section 3: Rapid Credentialing Window Info Box ─────────────── */}
      <View style={styles.credentialingCard}>
        <View style={styles.clockIconCircle}>
          <Ionicons name="time-outline" size={20} color="#0D9488" />
        </View>
        <View style={styles.credentialingTextBlock}>
          <Text style={styles.credentialingTitle}>Rapid Credentialing Window</Text>
          <Text style={styles.credentialingDesc}>
            Typical review & live activation within 24 to 48 hours by our Medical Credentialing Committee.
          </Text>
        </View>
      </View>

      {/* ── Final Submit CTA ───────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleFinalSubmit}
        activeOpacity={0.8}
        disabled={isSubmitting}
      >
        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
        <Text style={styles.submitBtnText}>
          {isSubmitting
            ? 'Submitting & Onboarding...'
            : 'Submit for Final Verification & Onboard'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  digiLockerCard: {
    backgroundColor: '#044E46',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  digiLockerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  digiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digiTitleWrap: {
    flex: 1,
  },
  digiTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  digiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  fastTrackBadge: {
    backgroundColor: '#5EEAD4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fastTrackText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#042F2E',
  },
  digiSubtitle: {
    fontSize: 11,
    color: '#CCFBF1',
    lineHeight: 15,
  },
  digiActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  digiFetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  digiFetchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  syncSpeedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lightningIcon: {
    fontSize: 12,
  },
  syncSpeedText: {
    fontSize: 11,
    color: '#5EEAD4',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  readyCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0EA5E9',
  },
  docItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  docItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  docTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  reqStar: {
    color: '#EF4444',
  },
  docSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  uploadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  uploadedPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  pendingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
  },
  filePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  fileIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileMainName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  fileMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  legibleGreen: {
    color: '#059669',
    fontWeight: '700',
  },
  fileActionBtn: {
    padding: 6,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTapText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0EA5E9',
    marginBottom: 2,
  },
  uploadFormatNote: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 12,
  },
  uploadActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  scanBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  browseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },
  idTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 3,
    marginBottom: 10,
  },
  idTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  idTabSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  idTabText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  idTabTextSelected: {
    color: '#0EA5E9',
    fontWeight: '800',
  },
  idFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  idIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idSideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sideBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  undertakingText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  boldBlue: {
    fontWeight: '800',
    color: '#0284C7',
  },
  credentialingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 16,
    gap: 12,
  },
  clockIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  credentialingTextBlock: {
    flex: 1,
  },
  credentialingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
    marginBottom: 2,
  },
  credentialingDesc: {
    fontSize: 11,
    color: '#115E59',
    lineHeight: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

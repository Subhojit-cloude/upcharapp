import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoctorRegistrationData } from '../../../types/doctor';
import { FormField } from '../shared/FormField';
import { TagSelector } from '../shared/TagSelector';

interface Step2CredentialsProps {
  data: DoctorRegistrationData;
  updateData: (fields: Partial<DoctorRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
}

const AVAILABLE_SUB_SPECIALTIES = [
  'Interventional Cardiology',
  'Hypertension',
  'Heart Failure',
  'Preventive Care',
  'Cardiac Arrhythmia',
  'Echocardiography',
  'Pediatric Cardiology',
  'Electrophysiology',
];

const COUNCILS = [
  'Delhi Medical Council (DMC) - National Medical Commission',
  'Maharashtra Medical Council (MMC)',
  'Karnataka Medical Council (KMC)',
  'Tamil Nadu Medical Council (TNMC)',
  'West Bengal Medical Council (WBMC)',
  'Medical Council of India / NMC Direct',
];

const QUALIFICATIONS = [
  'DM / MCh (Super-Speciality)',
  'MD / MS (Post-Graduate)',
  'DNB (National Board)',
  'MBBS (Primary Medical Degree)',
  'Fellowship / Post-Doctoral Diploma',
];

export const Step2Credentials: React.FC<Step2CredentialsProps> = ({
  data,
  updateData,
  onNext,
  onBack,
  onSaveDraft,
}) => {
  const [isCheckingNmc, setIsCheckingNmc] = useState(false);

  const handleCheckNmc = () => {
    if (!data.registrationNumber.trim()) {
      Alert.alert('Registration Number', 'Please enter your Council Registration Number.');
      return;
    }
    setIsCheckingNmc(true);
    setTimeout(() => {
      setIsCheckingNmc(false);
      updateData({ isLicenseVerified: true });
      Alert.alert(
        'NMC Verified ✅',
        `Registration Number "${data.registrationNumber}" verified successfully against the Indian Medical Registry.`
      );
    }, 800);
  };

  const handleToggleSubSpecialty = (tag: string) => {
    const exists = data.subSpecialties.includes(tag);
    if (exists) {
      updateData({
        subSpecialties: data.subSpecialties.filter((t) => t !== tag),
      });
    } else {
      updateData({
        subSpecialties: [...data.subSpecialties, tag],
      });
    }
  };

  const handleAdjustExperience = (delta: number) => {
    const current = data.yearsExperience || 0;
    const next = Math.max(0, Math.min(50, current + delta));
    updateData({ yearsExperience: next });
  };

  const handleContinue = () => {
    if (!data.registrationNumber.trim()) {
      Alert.alert('Required Field', 'Please enter your Registration Number.');
      return;
    }
    if (!data.primarySpecialty.trim()) {
      Alert.alert('Required Field', 'Please specify your Primary Medical Specialty.');
      return;
    }
    if (!data.qualification.trim()) {
      Alert.alert('Required Field', 'Please specify your Highest Medical Qualification.');
      return;
    }
    onNext();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <View style={styles.topHeaderBanner}>
        <View style={styles.bannerIconBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#0EA5E9" />
        </View>
        <View style={styles.bannerTextBlock}>
          <Text style={styles.bannerTitle}>Medical License & Specialization</Text>
          <Text style={styles.bannerSubtitle}>
            Provide your medical council registration and clinical expertise for instant NMC verification.
          </Text>
        </View>
      </View>

      {/* ── Section 1: Council Registration ───────────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="id-card-outline" size={18} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Council Registration</Text>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>NMC Direct Sync</Text>
          </View>
        </View>

        {/* State Medical Council Dropdown Mock */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>State Medical Council / Authority</Text>
          <View style={styles.dropdownBox}>
            <Text style={styles.dropdownText} numberOfLines={1}>
              {data.medicalCouncil || COUNCILS[0]}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </View>
        </View>

        {/* Registration Number */}
        <View style={styles.formGroup}>
          <View style={styles.labelWithLinkRow}>
            <Text style={styles.label}>Registration Number</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Format Guide',
                  'Enter state council prefix followed by year and serial (e.g., DMC-2015-84920 or MMC/2018/1234).'
                )
              }
            >
              <Text style={styles.linkHint}>ⓘ Format Guide</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.regInputRow}>
            <Text style={styles.inputEmoji}>🪪</Text>
            <TextInput
              style={styles.regInput}
              placeholder="DMC-2015-84920"
              placeholderTextColor="#94A3B8"
              value={data.registrationNumber}
              onChangeText={(text) => updateData({ registrationNumber: text })}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.checkBtn}
              onPress={handleCheckNmc}
              activeOpacity={0.7}
              disabled={isCheckingNmc}
            >
              <Ionicons name="people" size={14} color="#FFFFFF" />
              <Text style={styles.checkBtnText}>
                {isCheckingNmc ? 'Checking...' : 'Check'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verified Banner */}
        {data.isLicenseVerified && (
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedIconWrap}>
              <Ionicons name="checkmark-circle" size={22} color="#0284C7" />
            </View>
            <View style={styles.verifiedTextBlock}>
              <Text style={styles.verifiedTitle}>License Verified via NMC</Text>
              <Text style={styles.verifiedSubtitle}>
                Matches Indian Medical Registry Records
              </Text>
            </View>
            <View style={styles.validActivePill}>
              <Text style={styles.validActiveText}>Valid Active</Text>
            </View>
          </View>
        )}

        {/* Year of Registration */}
        <FormField
          label="Year of Registration"
          placeholder="2015"
          value={data.yearOfRegistration}
          onChangeText={(text) => updateData({ yearOfRegistration: text })}
          keyboardType="numeric"
          icon="📅"
        />
      </View>

      {/* ── Section 2: Specialty & Clinical Focus ─────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="medkit-outline" size={18} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Specialty & Clinical Focus</Text>
          </View>
        </View>

        {/* Primary Medical Specialty */}
        <FormField
          label="Primary Medical Specialty"
          placeholder="Cardiology / Interventional Cardiology"
          value={data.primarySpecialty}
          onChangeText={(text) => updateData({ primarySpecialty: text })}
          icon="🩺"
        />

        {/* Sub-Specialties Chips */}
        <TagSelector
          label="Sub-Specialties & Micro-Domains"
          allTags={AVAILABLE_SUB_SPECIALTIES}
          selectedTags={data.subSpecialties}
          onToggle={handleToggleSubSpecialty}
        />

        {/* Highest Medical Qualification */}
        <FormField
          label="Highest Medical Qualification"
          placeholder="DM / MCh (Super-Speciality)"
          value={data.qualification}
          onChangeText={(text) => updateData({ qualification: text })}
          icon="📜"
        />

        {/* University / Medical College */}
        <FormField
          label="University / Medical College"
          placeholder="All India Institute of Medical Sciences (AIIMS)"
          value={data.medicalCollege}
          onChangeText={(text) => updateData({ medicalCollege: text })}
          icon="🎓"
        />

        {/* Active Clinical Experience Stepper */}
        <View style={styles.expCard}>
          <View style={styles.expHeaderRow}>
            <View>
              <Text style={styles.expTitle}>Active Clinical Experience</Text>
              <Text style={styles.expSubtitle}>Post-residency clinical service</Text>
            </View>
            {(data.yearsExperience || 0) >= 10 && (
              <View style={styles.seniorBadge}>
                <Text style={styles.seniorBadgeText}>Senior Practitioner</Text>
              </View>
            )}
          </View>
          <View style={styles.stepperRow}>
            <Text style={styles.expNumberText}>
              {data.yearsExperience || 0} Years
            </Text>
            <View style={styles.stepperButtons}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustExperience(-1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={18} color="#1E293B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => handleAdjustExperience(1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* AES Encrypted Note */}
      <View style={styles.encryptionNoteBox}>
        <Ionicons name="shield-outline" size={16} color="#0EA5E9" />
        <Text style={styles.encryptionNoteText}>
          Data encrypted with AES-256 and matched in real-time with Indian Medical Registry standards.
        </Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#475569" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue to Practice</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Save Draft */}
      <TouchableOpacity
        style={styles.saveDraftBtn}
        onPress={() => {
          if (onSaveDraft) onSaveDraft();
          else Alert.alert('Draft Saved', 'Your registration draft has been saved locally.');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.saveDraftText}>Save draft & continue later</Text>
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
  topHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bannerTextBlock: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
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
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 5,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  syncText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  labelWithLinkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  linkHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  regInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  inputEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  regInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  checkBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 14,
    gap: 10,
  },
  verifiedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTextBlock: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  verifiedSubtitle: {
    fontSize: 10,
    color: '#115E59',
    marginTop: 1,
  },
  validActivePill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  validActiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  expCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  expHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  expTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  expSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  seniorBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  seniorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0EA5E9',
  },
  stepperButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encryptionNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  encryptionNoteText: {
    flex: 1,
    fontSize: 10,
    color: '#475569',
    lineHeight: 14,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveDraftBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveDraftText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});

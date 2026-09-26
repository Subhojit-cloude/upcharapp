import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoctorRegistrationData, DoctorGender } from '../../../types/doctor';
import { FormField } from '../shared/FormField';

interface Step1PersonalInfoProps {
  data: DoctorRegistrationData;
  updateData: (fields: Partial<DoctorRegistrationData>) => void;
  onNext: () => void;
  onNavigateToLogin: () => void;
}

export const Step1PersonalInfo: React.FC<Step1PersonalInfoProps> = ({
  data,
  updateData,
  onNext,
  onNavigateToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form validations
  const isEmailValid = data.email.includes('@') && data.email.includes('.');
  const isPhoneValid = data.phone.replace(/\D/g, '').length === 10;
  const isPasswordMatch =
    data.password.length >= 6 && data.password === data.confirmPassword;

  const handleTakeOrPickPhoto = (source: 'camera' | 'library') => {
    // Simulated photo picker
    updateData({
      photoUri:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    });
    Alert.alert(
      'Photo Uploaded',
      `Doctor profile photo successfully updated from ${source}.`
    );
  };

  const handleVerifyOtp = () => {
    if (!isPhoneValid) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
    updateData({ isPhoneVerified: true });
    Alert.alert('OTP Verified', 'Mobile number verified via SMS OTP.');
  };

  const handleContinue = () => {
    if (!data.fullLegalName.trim()) {
      Alert.alert('Required Field', 'Please enter your Full Legal Name.');
      return;
    }
    if (!data.email.trim() || !isEmailValid) {
      Alert.alert('Required Field', 'Please enter a valid professional email.');
      return;
    }
    if (!data.phone.trim() || !isPhoneValid) {
      Alert.alert('Required Field', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!data.password || data.password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters.');
      return;
    }
    if (data.password !== data.confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }
    if (!data.dateOfBirth.trim()) {
      Alert.alert('Required Field', 'Please enter your Date of Birth.');
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
      {/* Title & Subtitle */}
      <View style={styles.headerBlock}>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>
          Enter your basic details and create a secure clinical login.
        </Text>
      </View>

      {/* Doctor Profile Photo Card */}
      <View style={styles.photoCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                data.photoUri ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatarImg}
          />
          <View style={styles.cameraIconBadge}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.photoInfo}>
          <Text style={styles.photoTitle}>Doctor Profile Photo</Text>
          <Text style={styles.photoHint}>
            Clear professional headshot (JPG, PNG up to 5MB)
          </Text>
          <View style={styles.photoBtnRow}>
            <TouchableOpacity
              style={styles.photoBtn}
              onPress={() => handleTakeOrPickPhoto('camera')}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={14} color="#0284C7" />
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoBtn, styles.uploadBtn]}
              onPress={() => handleTakeOrPickPhoto('library')}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={14} color="#0284C7" />
              <Text style={styles.photoBtnText}>Upload File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full Legal Name */}
      <FormField
        label="Full Legal Name"
        required
        placeholder="Dr. Rajesh Sharma"
        value={data.fullLegalName}
        onChangeText={(text) => updateData({ fullLegalName: text })}
        icon="🪪"
        hint="ⓘ Must match your Medical Council registration record."
      />

      {/* Professional Email Address */}
      <FormField
        label="Professional Email Address"
        placeholder="dr.rajesh@upcharhealth.org"
        value={data.email}
        onChangeText={(text) =>
          updateData({ email: text, isEmailVerified: text.includes('@') })
        }
        keyboardType="email-address"
        autoCapitalize="none"
        icon="✉️"
        rightElement={
          isEmailValid ? (
            <View style={styles.verifiedPill}>
              <Ionicons name="checkmark-circle" size={13} color="#0D9488" />
              <Text style={styles.verifiedPillText}>Verified</Text>
            </View>
          ) : null
        }
      />

      {/* Primary Mobile Number */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Primary Mobile Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.flagIcon}>🇮🇳</Text>
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="98102 44920"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={data.phone}
            onChangeText={(text) => updateData({ phone: text })}
          />
          <TouchableOpacity
            style={[
              styles.verifyOtpBtn,
              data.isPhoneVerified && styles.verifyOtpBtnActive,
            ]}
            onPress={handleVerifyOtp}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.verifyOtpText,
                data.isPhoneVerified && styles.verifyOtpTextActive,
              ]}
            >
              {data.isPhoneVerified ? '✓ Verified' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          Used for critical patient notifications & two-factor authentication.
        </Text>
      </View>

      {/* Create Password */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Create Password</Text>
        <View style={styles.passwordRow}>
          <Text style={styles.inputEmoji}>🔒</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="UpcharDocSecure#2025"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={data.password}
            onChangeText={(text) => updateData({ password: text })}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>

        {/* Strength Segments */}
        <View style={styles.strengthBar}>
          <View
            style={[
              styles.strengthSegment,
              data.password.length > 0 && styles.strengthActive,
            ]}
          />
          <View
            style={[
              styles.strengthSegment,
              data.password.length >= 4 && styles.strengthActive,
            ]}
          />
          <View
            style={[
              styles.strengthSegment,
              data.password.length >= 8 && styles.strengthActive,
            ]}
          />
          <View
            style={[
              styles.strengthSegment,
              data.password.length >= 10 && styles.strengthActive,
            ]}
          />
        </View>
        <View style={styles.strengthNoteRow}>
          <Ionicons name="shield-checkmark" size={13} color="#0284C7" />
          <Text style={styles.strengthNoteText}>
            Strong: 8+ chars, uppercase, digits & symbols
          </Text>
        </View>
      </View>

      {/* Confirm Password */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordRow}>
          <Text style={styles.inputEmoji}>🔄</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="UpcharDocSecure#2025"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            value={data.confirmPassword}
            onChangeText={(text) => updateData({ confirmPassword: text })}
          />
          {isPasswordMatch ? (
            <Ionicons name="checkmark-circle" size={18} color="#0EA5E9" />
          ) : null}
        </View>
      </View>

      {/* Date of Birth */}
      <FormField
        label="Date of Birth"
        placeholder="06/15/1984"
        value={data.dateOfBirth}
        onChangeText={(text) => updateData({ dateOfBirth: text })}
        icon="📅"
      />

      {/* Gender as on Medical License */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Gender as on Medical License</Text>
        <View style={styles.genderRow}>
          {(['Male', 'Female', 'Other'] as DoctorGender[]).map((genderOption) => {
            const isSelected = data.gender === genderOption;
            return (
              <TouchableOpacity
                key={genderOption}
                style={[
                  styles.genderChip,
                  isSelected && styles.genderChipSelected,
                ]}
                onPress={() => updateData({ gender: genderOption })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderText,
                    isSelected && styles.genderTextSelected,
                  ]}
                >
                  {genderOption}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Security Vault Info Card */}
      <View style={styles.securityVaultCard}>
        <View style={styles.shieldIconBox}>
          <Ionicons name="shield-checkmark" size={20} color="#0284C7" />
        </View>
        <View style={styles.vaultTextContainer}>
          <Text style={styles.vaultTitle}>
            HIPAA & NMC Compliant Data Vault
          </Text>
          <Text style={styles.vaultDescription}>
            Your credentials and identity are encrypted with banking-grade
            AES-256 standards. Patient logs adhere to strict statutory
            safeguards.
          </Text>
        </View>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={handleContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueBtnText}>Continue to Credentials</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Sign In Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already registered? </Text>
        <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoInfo: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  photoHint: {
    fontSize: 11,
    color: '#64748B',
    marginVertical: 4,
  },
  photoBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 4,
  },
  uploadBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  photoBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 48,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    gap: 4,
  },
  flagIcon: {
    fontSize: 14,
  },
  countryCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingHorizontal: 10,
  },
  verifyOtpBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifyOtpBtnActive: {
    backgroundColor: '#CCFBF1',
  },
  verifyOtpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  verifyOtpTextActive: {
    color: '#0F766E',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 10,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  strengthSegment: {
    flex: 1,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  strengthActive: {
    backgroundColor: '#0EA5E9',
  },
  strengthNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  strengthNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  genderChipSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  genderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  securityVaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginVertical: 16,
    gap: 12,
  },
  shieldIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTextContainer: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  vaultDescription: {
    fontSize: 11,
    color: '#3B82F6',
    lineHeight: 15,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#64748B',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0EA5E9',
  },
});

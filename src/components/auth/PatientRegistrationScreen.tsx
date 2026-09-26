import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { GenderType, GenderSelector } from './GenderSelector';
import { RegistrationHeader } from './RegistrationHeader';
import { ProfilePhotoPicker } from './ProfilePhotoPicker';
import { PhoneVerificationInput } from './PhoneVerificationInput';
import { BloodGroupPicker } from './BloodGroupPicker';

interface PatientRegistrationScreenProps {
  onBackToLogin: () => void;
  onSuccessRegistration?: () => void;
}

export const PatientRegistrationScreen: React.FC<PatientRegistrationScreenProps> = ({
  onBackToLogin,
  onSuccessRegistration,
}) => {
  const { registerPatient } = useAuth();

  // Account State (Supabase Auth)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Details State
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<GenderType>('male');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);

  // Optional Details State
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [address, setAddress] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validations
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!dateOfBirth.trim()) {
      setErrorMessage('Please enter your date of birth.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);

    const err = await registerPatient({
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender,
      mobileNumber: mobileNumber.trim(),
      isPhoneVerified,
      bloodGroup,
      address: address.trim(),
      avatarUri,
    });

    setIsLoading(false);

    if (err) {
      setErrorMessage(err.message);
    } else {
      onSuccessRegistration?.();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top App Bar with Back & Logo */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <RegistrationHeader onBack={onBackToLogin} />
        </Animated.View>

        {/* Onboarding Pill & Subtitle */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.onboardingPillRow}
        >
          <View style={styles.onboardingPill}>
            <Ionicons name="shield-checkmark" size={13} color="#059669" />
            <Text style={styles.onboardingPillText}>Secure Patient Account</Text>
          </View>
          <Text style={styles.bulletSeparator}>•</Text>
          <Text style={styles.quickOnboardingText}>Supabase Powered</Text>
        </Animated.View>

        {/* Title and Explanation */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <Text style={styles.headingTitle}>Create Patient Profile</Text>
          <Text style={styles.headingSubtitle}>
            Register with your email and password to securely access health records, book doctor consultations, and track prescriptions.
          </Text>
        </Animated.View>

        {/* Error Banner */}
        {errorMessage && (
          <Animated.View entering={FadeInDown.duration(200)} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#DC2626" />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* Profile Photo Card (Optional) */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <ProfilePhotoPicker
            avatarUri={avatarUri}
            onPhotoSelected={(uri) => setAvatarUri(uri)}
          />
        </Animated.View>

        {/* Card 1: Account Credentials (Mandatory) */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(230)}
          style={styles.card}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithDot}>
              <View style={styles.blueDot} />
              <Text style={styles.cardSectionTitle}>ACCOUNT CREDENTIALS</Text>
            </View>
            <Text style={styles.mandatoryBadge}>* Mandatory</Text>
          </View>

          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={18}
                color="#64748B"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#64748B"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="At least 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color="#64748B"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Re-enter your password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Card 2: Personal Details */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(280)}
          style={styles.card}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithDot}>
              <View style={styles.blueDot} />
              <Text style={styles.cardSectionTitle}>PERSONAL DETAILS</Text>
            </View>
            <Text style={styles.mandatoryBadge}>* Mandatory</Text>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="id-card-outline"
                size={18}
                color="#64748B"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={(val) => {
                  setFullName(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your full name (e.g. Rahul Sharma)"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Date of Birth Input */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#64748B"
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                value={dateOfBirth}
                onChangeText={(val) => {
                  setDateOfBirth(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="DD / MM / YYYY"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Gender Selector */}
          <GenderSelector
            selectedGender={gender}
            onSelectGender={(g) => setGender(g)}
          />

          {/* Mobile Number */}
          <PhoneVerificationInput
            value={mobileNumber}
            onChangeText={(val) => {
              setMobileNumber(val);
              if (errorMessage) setErrorMessage(null);
            }}
            isVerified={isPhoneVerified}
            onVerifiedChange={setIsPhoneVerified}
          />
        </Animated.View>

        {/* Card 3: Medical & Address Info (Optional) */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(350)}
          style={styles.card}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleWithDot}>
              <View style={styles.grayDot} />
              <Text style={styles.cardSectionTitle}>
                MEDICAL & ADDRESS (OPTIONAL)
              </Text>
            </View>
          </View>

          {/* Blood Group Picker */}
          <BloodGroupPicker
            value={bloodGroup}
            onSelect={(bg) => setBloodGroup(bg)}
          />

          {/* Address Multiline Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Residential Address</Text>
            <View style={[styles.inputContainer, styles.multilineContainer]}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#64748B"
                style={[styles.fieldIcon, { marginTop: 4 }]}
              />
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter flat / house no., street, city, state"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </Animated.View>

        {/* Bottom CTA Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(450)}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  Create Account & Continue
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          {/* Already registered Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Already registered? </Text>
            <TouchableOpacity activeOpacity={0.7} onPress={onBackToLogin}>
              <Text style={styles.footerLink}>Sign In ›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 40,
  },
  onboardingPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  onboardingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  onboardingPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669',
  },
  bulletSeparator: {
    fontSize: 12,
    color: '#94A3B8',
  },
  quickOnboardingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  headingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  headingSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    marginBottom: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blueDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0080FF',
  },
  grayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  mandatoryBadge: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  requiredAsterisk: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldIcon: {
    marginRight: 8,
  },
  eyeBtn: {
    padding: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
    paddingVertical: 0,
  },
  multilineContainer: {
    height: 'auto',
    minHeight: 74,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0080FF',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#0080FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerPrompt: {
    fontSize: 13.5,
    color: '#475569',
  },
  footerLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0080FF',
  },
});

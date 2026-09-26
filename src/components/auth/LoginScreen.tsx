import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS } from '../../constants/roleConfig';
import { RoleSelector } from './RoleSelector';
import { AuthCard } from './AuthCard';
import { SocialAuthButtons } from './SocialAuthButtons';

interface LoginScreenProps {
  onSuccessLogin?: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToDoctorRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccessLogin,
  onNavigateToRegister,
  onNavigateToDoctorRegister,
}) => {
  const {
    activeRole,
    setActiveRole,
    signIn,
    rememberDevice,
    setRememberDevice,
  } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignIn = () => {
    signIn(activeRole);
    onSuccessLogin?.();
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Password',
      `A password reset link or SMS OTP has been sent for the ${activeRole} account.`,
      [{ text: 'OK' }]
    );
  };

  const handleAlternateIdPress = () => {
    const config = ROLE_CONFIGS[activeRole];
    showToast(`You can sign in using your official ${config.identifierRightActionText}`);
  };

  const handleGooglePress = () => {
    signIn(activeRole);
    showToast(`Signed in with Google as ${activeRole.toUpperCase()}`);
    onSuccessLogin?.();
  };

  const handleOtpPress = () => {
    signIn(activeRole);
    showToast(`OTP verified successfully for ${activeRole.toUpperCase()}`);
    onSuccessLogin?.();
  };

  const config = ROLE_CONFIGS[activeRole];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />

      {/* Floating Info Toast */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Spacer / Brand Breathing Room */}
        <View style={styles.topSpacer} />

        {/* Subtitle / Header Prompt from Mockup */}
        <Text style={styles.headerSubtitle}>{config.subtitle}</Text>

        {/* Role Selector Capsule (Patient | Doctor | Lab) */}
        <RoleSelector
          activeRole={activeRole}
          onSelectRole={(role) => setActiveRole(role)}
        />

        {/* Main Authentication Card */}
        <AuthCard
          activeRole={activeRole}
          onSignIn={handleSignIn}
          rememberDevice={rememberDevice}
          onToggleRemember={setRememberDevice}
          onForgotPassword={handleForgotPassword}
          onAlternateIdPress={handleAlternateIdPress}
        />

        {/* Social / Alternative Sign-in Options */}
        <SocialAuthButtons
          onGooglePress={handleGooglePress}
          onOtpPress={handleOtpPress}
        />

        {/* Create Account Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerPromptText}>Don't have an account? </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (activeRole === 'patient' && onNavigateToRegister) {
                onNavigateToRegister();
              } else if (activeRole === 'doctor' && onNavigateToDoctorRegister) {
                onNavigateToDoctorRegister();
              } else {
                Alert.alert(
                  'Registration',
                  `Redirecting to ${config.title} registration form...`
                );
              }
            }}
          >
            <Text style={styles.footerLinkText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom capsule decor */}
        <View style={styles.bottomBarCapsule} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  topSpacer: {
    height: 30,
  },
  headerSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '400',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  footerPromptText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '400',
  },
  footerLinkText: {
    fontSize: 14,
    color: '#0080FF',
    fontWeight: '600',
  },
  bottomBarCapsule: {
    alignSelf: 'center',
    width: '90%',
    height: 36,
    backgroundColor: '#EEF2F6',
    borderRadius: 20,
    marginTop: 10,
  },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

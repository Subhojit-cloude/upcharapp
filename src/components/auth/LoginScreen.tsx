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
import { Ionicons } from '@expo/vector-icons';
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
    signInWithEmail,
    sendPasswordReset,
    rememberDevice,
    setRememberDevice,
  } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ── Sign-in handler ────────────────────────────────────────────────────────
  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);

    const cleanEmail = email ? email.trim() : '';
    const cleanPassword = password ? password.trim() : '';

    // If email and password are provided, attempt real Supabase sign-in first
    // This looks up the user's DB profile_type and automatically redirects to their authorized dashboard
    if (cleanEmail && cleanPassword) {
      const err = await signInWithEmail(cleanEmail, cleanPassword);
      if (!err) {
        // Successfully authenticated!
        // AuthContext automatically set activeRole to the user's DB authorized role (patient, doctor, clinic, or lab)
        onSuccessLogin?.();
        return;
      }

      // Display authentication error for all roles and return without demo fallback
      setAuthError(err.message);
      return;
    }

    // Keep demo sign-in available only through an explicit demo action or a __DEV__-guarded path
    if (__DEV__) {
      signIn(activeRole);
      onSuccessLogin?.();
      return;
    }

    setAuthError('Please enter both email and password.');
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async (email?: string) => {
    if (!email) {
      Alert.alert(
        'Reset Password',
        'Please enter your email in the field above, then tap Forgot Password again.'
      );
      return;
    }
    const err = await sendPasswordReset(email);
    if (err) {
      Alert.alert('Error', err.message);
    } else {
      Alert.alert(
        'Email Sent',
        `A password reset link has been sent to ${email}. Check your inbox.`
      );
    }
  };

  // ── Alternate ID press ─────────────────────────────────────────────────────
  const handleAlternateIdPress = () => {
    const config = ROLE_CONFIGS[activeRole];
    showToast(`You can sign in using your official ${config.identifierRightActionText}`);
  };

  // ── Google / OTP (mock for non-patient; could be upgraded later) ───────────
  const handleGooglePress = () => {
    if (activeRole === 'patient') {
      showToast('Google Sign-In coming soon for patients!');
      return;
    }
    signIn(activeRole);
    showToast(`Signed in with Google as ${activeRole.toUpperCase()}`);
    onSuccessLogin?.();
  };

  const handleOtpPress = () => {
    if (activeRole === 'patient') {
      showToast('Mobile OTP sign-in coming soon!');
      return;
    }
    signIn(activeRole);
    showToast(`OTP verified for ${activeRole.toUpperCase()}`);
    onSuccessLogin?.();
  };

  const config = ROLE_CONFIGS[activeRole];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />

      {/* Floating Toast */}
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
        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* Subtitle */}
        <Text style={styles.headerSubtitle}>{config.subtitle}</Text>

        {/* Role Selector */}
        <RoleSelector
          activeRole={activeRole}
          onSelectRole={(role) => {
            setActiveRole(role);
            setAuthError(null);
          }}
        />

        {/* Auth Card */}
        <AuthCard
          activeRole={activeRole}
          onSignIn={handleSignIn}
          rememberDevice={rememberDevice}
          onToggleRemember={setRememberDevice}
          onForgotPassword={handleForgotPassword}
          onAlternateIdPress={handleAlternateIdPress}
          errorMessage={authError}
        />

        {/* Social Sign-in */}
        <SocialAuthButtons
          onGooglePress={handleGooglePress}
          onOtpPress={handleOtpPress}
        />

        {/* Explicit Demo Sign-in (__DEV__ only) */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.demoActionBtn}
            onPress={() => {
              signIn(activeRole);
              onSuccessLogin?.();
            }}
          >
            <Ionicons name="flash-outline" size={14} color="#64748B" />
            <Text style={styles.demoActionText}>Demo Sign-In ({config.title})</Text>
          </TouchableOpacity>
        )}

        {/* Create Account */}
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
                  `Please contact your Upchar Health administrator to register as ${config.title}.`
                );
              }
            }}
          >
            <Text style={styles.footerLinkText}>
              {activeRole === 'patient' ? 'Create Account' : 'Contact Admin'}
            </Text>
          </TouchableOpacity>
        </View>

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
  demoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    marginTop: 14,
    alignSelf: 'center',
  },
  demoActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
});

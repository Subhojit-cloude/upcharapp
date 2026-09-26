import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import { Clinic } from '../types/clinic';

import { LoginScreen } from '../components/auth/LoginScreen';
import { PatientRegistrationScreen } from '../components/auth/PatientRegistrationScreen';
import { DoctorRegistrationScreen } from '../components/doctor/DoctorRegistrationScreen';
import { RoleTopBar } from '../components/common/RoleTopBar';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { LabDashboard } from '../components/lab/LabDashboard';
import { ClinicDashboard } from '../components/clinic/ClinicDashboard';
import { OnboardingScreen, ONBOARDING_STORAGE_KEY } from '../components/onboarding/OnboardingScreen';

export default function AppEntry() {
  const router = useRouter();
  const { isAuthenticated, activeRole } = useAuth();
  const { selectClinic, toastMessage } = useClinic();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [authView, setAuthView] = useState<'login' | 'patient-register' | 'doctor-register'>('login');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // During development, reset onboarding flag so it always shows on restart.
      // Remove this block (or set to false) before shipping to production.
      if (__DEV__) {
        await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (e) {
      setHasSeenOnboarding(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleOpenClinic = (clinic: Clinic) => {
    selectClinic(clinic.id);
    router.push({
      pathname: '/schedule-detail',
      params: { clinicId: clinic.id },
    });
  };

  // Loading state
  if (isLoadingAuth || hasSeenOnboarding === null) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B8EF3" />
        <View style={styles.loadingCard}>
          <Ionicons name="medical" size={42} color="#0B8EF3" />
          <Text style={styles.loadingTitle}>Upchar Health</Text>
          <ActivityIndicator size="small" color="#0B8EF3" style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  // First-time open: show onboarding carousel
  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setHasSeenOnboarding(true);
        }}
      />
    );
  }

  // If user is not yet logged in, show the tri-role login or registration screen
  if (!isAuthenticated) {
    if (authView === 'patient-register') {
      return (
        <PatientRegistrationScreen
          onBackToLogin={() => setAuthView('login')}
          onSuccessRegistration={() => setAuthView('login')}
        />
      );
    }
    if (authView === 'doctor-register') {
      return (
        <DoctorRegistrationScreen
          onBackToLogin={() => setAuthView('login')}
          onSuccessRegistration={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthView('patient-register')}
        onNavigateToDoctorRegister={() => setAuthView('doctor-register')}
      />
    );
  }

  // Once authenticated, show the active role experience with the RoleTopBar
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Toast Notification from ClinicContext */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="information-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top Role Switcher Bar: Allows instantaneous switching between Patient, Doctor, Clinic, and Lab */}
      <RoleTopBar />

      {/* Render the Active Role Experience */}
      <View style={styles.content}>
        {activeRole === 'patient' && (
          <PatientDashboard
            onNavigateToClinicDetail={(clinicId) => {
              selectClinic(clinicId);
              router.push({
                pathname: '/schedule-detail',
                params: { clinicId },
              });
            }}
          />
        )}

        {activeRole === 'clinic' && <ClinicDashboard />}

        {activeRole === 'doctor' && (
          <DoctorDashboard onOpenClinic={handleOpenClinic} />
        )}

        {activeRole === 'lab' && <LabDashboard />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});

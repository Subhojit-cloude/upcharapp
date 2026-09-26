import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  FadeInLeft,
  FadeOutRight,
} from 'react-native-reanimated';
import { DoctorRegistrationData, DEFAULT_DOCTOR_DATA } from '../../types/doctor';
import { useAuth } from '../../context/AuthContext';
import { DoctorRegHeader } from './shared/DoctorRegHeader';
import { StepProgressBar } from './shared/StepProgressBar';
import { Step1PersonalInfo } from './steps/Step1PersonalInfo';
import { Step2Credentials } from './steps/Step2Credentials';
import { Step3ClinicalPractice } from './steps/Step3ClinicalPractice';
import { Step4Verification } from './steps/Step4Verification';

interface DoctorRegistrationScreenProps {
  onBackToLogin: () => void;
  onSuccessRegistration?: () => void;
}

export const DoctorRegistrationScreen: React.FC<DoctorRegistrationScreenProps> = ({
  onBackToLogin,
  onSuccessRegistration,
}) => {
  const { registerDoctor } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<DoctorRegistrationData>({
    ...DEFAULT_DOCTOR_DATA,
    fullLegalName: 'Dr. Rajesh Sharma',
    email: 'dr.rajesh@upcharhealth.org',
    isEmailVerified: true,
    phone: '9810244920',
    isPhoneVerified: true,
    password: 'UpcharDocSecure#2025',
    confirmPassword: 'UpcharDocSecure#2025',
    dateOfBirth: '06/15/1984',
    gender: 'Male',
    medicalCouncil: 'Delhi Medical Council (DMC) - National Medical Commission',
    registrationNumber: 'DMC-2015-84920',
    isLicenseVerified: true,
    yearOfRegistration: '2015',
    primarySpecialty: 'Cardiology / Interventional Cardiology',
    subSpecialties: ['Interventional Cardiology', 'Hypertension', 'Heart Failure'],
    qualification: 'DM / MCh (Super-Speciality)',
    medicalCollege: 'All India Institute of Medical Sciences (AIIMS)',
    yearsExperience: 12,
    hospitalName: 'Max Super Speciality Hospital, Saket',
    department: 'Cardiology & Heart Institute',
    streetAddress: '1, 2 Press Enclave Marg, Saket',
    city: 'New Delhi',
    pincode: '110017',
    practicePhone: '+91 11 2651 5050',
    consultationModes: {
      video: { enabled: true, fee: 800 },
      inClinic: { enabled: true, fee: 1200 },
      followUp: { enabled: true },
    },
    availability: {
      days: ['M', 'T', 'W', 'Th', 'F', 'S'],
      morningShift: { start: '09:00 AM', end: '01:00 PM' },
      eveningShift: { start: '05:00 PM', end: '08:30 PM' },
    },
    medCertUri: 'nmc_registration_cert_2015.pdf',
    degreeUri: undefined,
    govIdType: 'aadhaar',
    govIdFrontUri: 'aadhaar_front.jpg',
    govIdBackUri: 'aadhaar_back.jpg',
    agreedTelemedicine: true,
    agreedAuthenticity: true,
  });

  const updateFormData = (fields: Partial<DoctorRegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setDirection('forward');
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep((prev) => prev - 1);
    } else {
      onBackToLogin();
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (registerDoctor) {
        await registerDoctor(formData);
      }
      Alert.alert(
        'Onboarding Submitted 🎉',
        `Welcome ${formData.fullLegalName}! Your profile has been submitted for fast-track NMC credentialing and your doctor workspace is now active.`,
        [
          {
            text: 'Open Doctor Workspace',
            onPress: () => {
              if (onSuccessRegistration) {
                onSuccessRegistration();
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Registration Error', 'Unable to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Doctor Registration Header */}
      <DoctorRegHeader
        currentStep={currentStep}
        totalSteps={4}
        onBack={handlePrevStep}
      />

      {/* Step Progress & Indicator */}
      <StepProgressBar currentStep={currentStep} totalSteps={4} />

      {/* Animated Step Screen Content */}
      <View style={styles.stepContainer}>
        {currentStep === 1 && (
          <Animated.View
            key="step-1"
            entering={direction === 'forward' ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
            exiting={direction === 'forward' ? FadeOutLeft.duration(200) : FadeOutRight.duration(200)}
            style={styles.animatedStep}
          >
            <Step1PersonalInfo
              data={formData}
              updateData={updateFormData}
              onNext={handleNextStep}
              onNavigateToLogin={onBackToLogin}
            />
          </Animated.View>
        )}

        {currentStep === 2 && (
          <Animated.View
            key="step-2"
            entering={direction === 'forward' ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
            exiting={direction === 'forward' ? FadeOutLeft.duration(200) : FadeOutRight.duration(200)}
            style={styles.animatedStep}
          >
            <Step2Credentials
              data={formData}
              updateData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          </Animated.View>
        )}

        {currentStep === 3 && (
          <Animated.View
            key="step-3"
            entering={direction === 'forward' ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
            exiting={direction === 'forward' ? FadeOutLeft.duration(200) : FadeOutRight.duration(200)}
            style={styles.animatedStep}
          >
            <Step3ClinicalPractice
              data={formData}
              updateData={updateFormData}
              onNext={handleNextStep}
              onBack={handlePrevStep}
            />
          </Animated.View>
        )}

        {currentStep === 4 && (
          <Animated.View
            key="step-4"
            entering={direction === 'forward' ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
            exiting={direction === 'forward' ? FadeOutLeft.duration(200) : FadeOutRight.duration(200)}
            style={styles.animatedStep}
          >
            <Step4Verification
              data={formData}
              updateData={updateFormData}
              onSubmit={handleFinalSubmit}
              onBack={handlePrevStep}
              isSubmitting={isSubmitting}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  stepContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  animatedStep: {
    flex: 1,
  },
});

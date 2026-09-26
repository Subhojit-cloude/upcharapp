import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepProgressBarProps {
  currentStep: number; // 1-4
  totalSteps?: number;
}

const STEP_INFOS = [
  {
    title: 'Step 1 of 4: Personal Info',
    percentText: '25% Complete',
    percent: 25,
    icon: 'person-circle-outline' as const,
  },
  {
    title: 'Step 2 of 4: Medical Credentials',
    percentText: '50% Completed',
    percent: 50,
    icon: 'checkmark-circle' as const,
  },
  {
    title: 'Step 3 of 4: Clinical Practice',
    percentText: '75% Complete',
    percent: 75,
    icon: 'add-circle-outline' as const,
  },
  {
    title: 'STEP 4 OF 4: VERIFICATION & SUBMIT',
    percentText: '100% Completed',
    percent: 100,
    icon: 'shield-checkmark-outline' as const,
  },
];

const STEP_LABELS = ['Identity & KYC', 'Credentials', 'Clinic Setup', 'Verification'];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps = 4,
}) => {
  const stepIdx = Math.min(Math.max(currentStep - 1, 0), 3);
  const info = STEP_INFOS[stepIdx];

  return (
    <View style={styles.container}>
      {/* Top step subtitle row */}
      <View style={styles.topRow}>
        <View style={styles.titleWithIcon}>
          {currentStep === 2 ? (
            <View style={styles.stepNumCircle}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
          ) : (
            <Ionicons name={info.icon} size={16} color="#0EA5E9" style={styles.icon} />
          )}
          <Text style={styles.stepTitle}>{info.title}</Text>
        </View>
        <Text style={styles.percentText}>{info.percentText}</Text>
      </View>

      {/* Progress track */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${info.percent}%` }]} />
      </View>

      {/* Breadcrumbs */}
      {currentStep > 1 && currentStep < 4 ? (
        <View style={styles.breadcrumbs}>
          <Text style={[styles.crumbText, currentStep === 1 && styles.crumbActive]}>
            Step 1: Identity & KYC
          </Text>
          <Text style={styles.crumbSeparator}>•</Text>
          <Text style={[styles.crumbText, currentStep === 2 && styles.crumbActive]}>
            Credentials
          </Text>
          <Text style={styles.crumbSeparator}>•</Text>
          <Text style={[styles.crumbText, currentStep === 3 && styles.crumbActive]}>
            Step 3: Clinic Setup
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const ACCENT = '#0EA5E9';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  stepNumCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0EA5E9',
    letterSpacing: 0.2,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  track: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  crumbText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  crumbActive: {
    color: '#0EA5E9',
    fontWeight: '700',
  },
  crumbSeparator: {
    fontSize: 10,
    color: '#CBD5E1',
  },
});

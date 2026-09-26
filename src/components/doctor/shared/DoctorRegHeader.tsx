import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DoctorRegHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
}

export const DoctorRegHeader: React.FC<DoctorRegHeaderProps> = ({
  currentStep,
  totalSteps = 4,
  onBack,
}) => {
  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={22} color="#1E293B" />
      </TouchableOpacity>

      {/* Brand / Title */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🩺</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.brandTitle}>UPCHAR</Text>
          <Text style={styles.brandSubtitle}>HEALTH</Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.screenTitle}>Profile Details</Text>
      </View>

      {/* Step Badge Pill */}
      <View style={styles.rightContainer}>
        <View style={styles.stepPill}>
          <Text style={styles.stepPillText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>
        <View style={styles.userAvatarBtn}>
          <Ionicons name="person" size={15} color="#FFFFFF" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  logoIcon: {
    fontSize: 14,
  },
  titleContainer: {
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0EA5E9',
    letterSpacing: 0.5,
    lineHeight: 11,
  },
  brandSubtitle: {
    fontSize: 7,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    lineHeight: 8,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepPill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  userAvatarBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

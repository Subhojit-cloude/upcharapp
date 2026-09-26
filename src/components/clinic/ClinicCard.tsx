import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Clinic } from '../../types/clinic';
import { StatusBadge } from '../common/StatusBadge';

interface ClinicCardProps {
  clinic: Clinic;
  onPress: () => void;
  isHighlighted?: boolean;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  onPress,
  isHighlighted = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.98, { duration: 120 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, []);

  const renderIcon = (type: Clinic['iconType']) => {
    switch (type) {
      case 'plus':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="hospital-box" size={24} color="#007AFF" />
          </View>
        );
      case 'briefcase':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#E6F8F3' }]}>
            <MaterialCommunityIcons name="medical-bag" size={22} color="#0D9488" />
          </View>
        );
      case 'shield':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#EFF6FF' }]}>
            <MaterialCommunityIcons name="shield-cross" size={22} color="#2563EB" />
          </View>
        );
      case 'hospital':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
            <FontAwesome5 name="hospital-alt" size={20} color="#0284C7" />
          </View>
        );
      case 'bandage':
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#EEF2FF' }]}>
            <MaterialCommunityIcons name="bandage" size={22} color="#4F46E5" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="medkit" size={22} color="#007AFF" />
          </View>
        );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.clinicCard,
          isHighlighted && styles.clinicCardHighlighted,
          animatedStyle,
        ]}
      >
        {isHighlighted && <View style={styles.activeIndicatorBar} />}

        <View style={styles.clinicTopRow}>
          {renderIcon(clinic.iconType)}

          <View style={styles.clinicTitleGroup}>
            <Text style={styles.clinicName} numberOfLines={1}>
              {clinic.name}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color="#64748B" />
              <Text style={styles.locationText} numberOfLines={1}>
                {clinic.location}
              </Text>
            </View>
          </View>

          <View style={styles.activeStatusWrapper}>
            <StatusBadge label="Active" variant="active" showDot />
            <Ionicons name="chevron-forward" size={14} color="#0D9488" style={{ marginLeft: 2 }} />
          </View>
        </View>

        <View style={styles.tagsRow}>
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>{clinic.role}</Text>
          </View>

          <View style={styles.tagChip}>
            <Ionicons name="calendar-outline" size={13} color="#475569" style={{ marginRight: 4 }} />
            <Text style={styles.tagChipText}>{clinic.scheduleDays}</Text>
          </View>
        </View>

        {isHighlighted ? (
          <View style={styles.blueSlotBanner}>
            <View style={styles.slotBannerLeft}>
              <Ionicons name="time-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.blueBannerLabel}>{clinic.nextSlotLabel}</Text>
                <Text style={styles.blueBannerTime}>{clinic.nextSlotText}</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.softSlotBanner}>
            <View style={styles.slotBannerLeft}>
              <Ionicons name="time-outline" size={16} color="#007AFF" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.softBannerLabel}>{clinic.nextSlotLabel}</Text>
                <Text style={styles.softBannerTime}>{clinic.nextSlotText}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  clinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1.5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  clinicCardHighlighted: {
    borderColor: '#E0E7FF',
    shadowOpacity: 0.08,
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
    backgroundColor: '#007AFF',
  },
  clinicTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clinicTitleGroup: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 3,
  },
  activeStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  blueSlotBanner: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  softSlotBanner: {
    backgroundColor: '#F4F7FC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  slotBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
  },
  blueBannerTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  softBannerLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  softBannerTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
});

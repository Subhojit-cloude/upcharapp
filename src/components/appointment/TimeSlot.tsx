import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot as TimeSlotType } from '../../types/clinic';

interface TimeSlotProps {
  slot: TimeSlotType;
  onPress: () => void;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({ slot, onPress }) => {
  const isAvailable = slot.status === 'available';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(isAvailable ? 0.96 : 0.98, { duration: 100 });
  }, [isAvailable]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, { duration: 150 });
  }, []);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.pressableWrapper}
    >
      <Animated.View
        style={[
          styles.slotCard,
          isAvailable ? styles.slotCardAvailable : styles.slotCardBooked,
          animatedStyle,
        ]}
      >
        <View style={styles.slotHeader}>
          <Text style={[styles.slotTime, isAvailable ? styles.slotTimeAvailable : styles.slotTimeBooked]}>
            {slot.time}
          </Text>
          <View
            style={[
              styles.slotIndicatorDot,
              isAvailable ? styles.dotAvailable : styles.dotBooked,
            ]}
          />
        </View>

        <View style={styles.slotFooter}>
          {isAvailable ? (
            <View style={styles.availableRow}>
              <Text style={styles.availableLabel}>Available</Text>
              <Ionicons name="add-circle-outline" size={16} color="#0D9488" />
            </View>
          ) : (
            <View style={styles.bookedRow}>
              <Text style={styles.bookedLabel}>Booked</Text>
              <Text style={styles.bookedPatientName} numberOfLines={1}>
                {slot.patientName}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressableWrapper: {
    width: '48.5%',
  },
  slotCard: {
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
  },
  slotCardAvailable: {
    backgroundColor: '#E8F7F8',
    borderColor: '#B9E6FE',
  },
  slotCardBooked: {
    backgroundColor: '#F1F3FB',
    borderColor: '#E2E8F0',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
  },
  slotTimeAvailable: {
    color: '#0891B2',
  },
  slotTimeBooked: {
    color: '#334155',
  },
  slotIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotAvailable: {
    backgroundColor: '#007AFF',
  },
  dotBooked: {
    backgroundColor: '#64748B',
  },
  slotFooter: {
    marginTop: 2,
  },
  availableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  bookedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookedLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bookedPatientName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: '65%',
  },
});

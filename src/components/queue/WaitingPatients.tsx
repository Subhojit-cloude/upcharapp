import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface WaitingPatientsProps {
  count: number;
  onCallNext: () => void;
}

export const WaitingPatients: React.FC<WaitingPatientsProps> = ({
  count,
  onCallNext,
}) => {
  const btnScale = useSharedValue(1);

  const btnAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleBtnPressIn = useCallback(() => {
    if (count > 0) {
      btnScale.value = withTiming(0.94, { duration: 100 });
    }
  }, [count]);

  const handleBtnPressOut = useCallback(() => {
    btnScale.value = withTiming(1, { duration: 150 });
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.bellIconCircle}>
        <Ionicons name="notifications" size={18} color="#FFFFFF" />
      </View>

      <View style={styles.infoGroup}>
        <Text style={styles.title}>Live Walk-in Queue</Text>
        <Text style={styles.subtitle}>
          {count} walk-ins waiting at clinic reception
        </Text>
      </View>

      <Pressable
        onPress={onCallNext}
        onPressIn={handleBtnPressIn}
        onPressOut={handleBtnPressOut}
        disabled={count <= 0}
      >
        <Animated.View
          style={[
            styles.btn,
            count <= 0 && styles.btnDisabled,
            btnAnimatedStyle,
          ]}
        >
          <Text style={styles.btnText}>Call Next</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  bellIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoGroup: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  btn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDisabled: {
    backgroundColor: '#94A3B8',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

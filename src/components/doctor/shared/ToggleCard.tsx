import React from 'react';
import { View, Text, Switch, TextInput, StyleSheet, Platform } from 'react-native';

interface ToggleCardProps {
  icon: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  feeLabel?: string;         // e.g. "/ 15 min"
  feeValue?: string;
  onFeeChange?: (val: string) => void;
  freeLabel?: string;        // e.g. "7 Days Free Follow-up"
}

export const ToggleCard: React.FC<ToggleCardProps> = ({
  icon,
  title,
  subtitle,
  enabled,
  onToggle,
  feeLabel,
  feeValue,
  onFeeChange,
  freeLabel,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#CBD5E1', true: '#0EA5E930' }}
          thumbColor={enabled ? '#0EA5E9' : '#94A3B8'}
        />
      </View>

      {enabled && (
        <View style={styles.feeRow}>
          {feeLabel && onFeeChange ? (
            <>
              <Text style={styles.feeIcon}>₹</Text>
              <TextInput
                style={styles.feeInput}
                value={feeValue}
                onChangeText={onFeeChange}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#CBD5E1"
              />
              <Text style={styles.feeSuffix}>{feeLabel}</Text>
            </>
          ) : freeLabel ? (
            <View style={styles.freeLabelPill}>
              <Text style={styles.clockIcon}>⏱ </Text>
              <Text style={styles.freeLabelText}>{freeLabel}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 20 },
  titleBlock: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  feeIcon: {
    fontSize: 16,
    color: '#0EA5E9',
    fontWeight: '700',
    marginRight: 4,
  },
  feeInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    minWidth: 80,
  },
  feeSuffix: {
    marginLeft: 8,
    fontSize: 12,
    color: '#64748B',
  },
  freeLabelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  clockIcon: { fontSize: 13 },
  freeLabelText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
});

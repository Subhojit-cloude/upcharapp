import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ChecklistItemProps {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  checked,
  onToggle,
  children,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.row}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.textBlock}>{children}</View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  textBlock: {
    flex: 1,
  },
});

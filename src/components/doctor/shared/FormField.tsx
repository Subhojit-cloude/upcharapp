import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: string; // emoji icon
  required?: boolean;
  hint?: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  icon,
  required,
  hint,
  error,
  rightElement,
  containerStyle,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *Required</Text>}
        </Text>
      </View>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <TextInput
          style={[styles.input, !icon && styles.inputNoIcon]}
          placeholderTextColor="#94A3B8"
          {...inputProps}
        />
        {rightElement}
      </View>
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  required: {
    color: '#EF4444',
    fontWeight: '500',
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputRowError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 10,
  },
  inputNoIcon: {
    paddingLeft: 4,
  },
  hint: {
    marginTop: 5,
    fontSize: 11,
    color: '#64748B',
  },
  errorText: {
    marginTop: 5,
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
});

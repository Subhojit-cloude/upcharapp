import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../../types/auth';
import { ROLE_CONFIGS } from '../../constants/roleConfig';

interface AuthCardProps {
  activeRole: UserRole;
  /** Called with email+password when patient; or with empty strings for other roles (demo). */
  onSignIn: (email: string, password: string) => Promise<void> | void;
  rememberDevice: boolean;
  onToggleRemember: (val: boolean) => void;
  onForgotPassword?: (email?: string) => void;
  onAlternateIdPress?: () => void;
  errorMessage?: string | null;
  onError?: (error: string) => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  activeRole,
  onSignIn,
  rememberDevice,
  onToggleRemember,
  onForgotPassword,
  onAlternateIdPress,
  errorMessage,
  onError,
}) => {
  const config = ROLE_CONFIGS[activeRole];

  const [identifier, setIdentifier] = useState(config.defaultEmailOrId);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Update pre-filled values when switching roles for instant testing
  useEffect(() => {
    setIdentifier(config.defaultEmailOrId);
    setLocalError(null);
  }, [activeRole]);

  const handlePressSignIn = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      // Pass credentials; parent decides whether to call Supabase or mock
      await onSignIn(identifier.trim(), password);
    } catch (err: any) {
      const msg = err?.message || 'Sign in failed. Please try again.';
      setLocalError(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Field 1: Identifier */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{config.identifierLabel}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onAlternateIdPress}>
            <Text style={styles.rightActionLink}>
              {config.identifierRightActionText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="person-circle-outline"
            size={22}
            color="#64748B"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder={config.identifierPlaceholder}
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>

      {/* Field 2: Password */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Password</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => onForgotPassword?.(identifier)}>
            <Text style={styles.rightActionLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#64748B"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.eyeIconBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Remember this device & Trusted Badge */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.rememberTouchable}
          onPress={() => onToggleRemember(!rememberDevice)}
        >
          <View
            style={[
              styles.checkboxBox,
              rememberDevice && styles.checkboxBoxChecked,
            ]}
          >
            {rememberDevice && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.rememberText}>Remember this device</Text>
        </TouchableOpacity>

        <View style={styles.trustedBadge}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#0080FF" />
          <Text style={styles.trustedText}>Trusted</Text>
        </View>
      </View>

      {/* Primary CTA Sign In */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.signInButton}
        onPress={handlePressSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.signInButtonText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </>
        )}
      </TouchableOpacity>

      {/* Inline error message */}
      {(errorMessage || localError) ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{errorMessage || localError}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  rightActionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0080FF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeIconBtn: {
    padding: 6,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 20,
  },
  rememberTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#0080FF',
    borderColor: '#0080FF',
  },
  rememberText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  trustedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustedText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  signInButton: {
    backgroundColor: '#0080FF',
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0080FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },
});

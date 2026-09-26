export type UserRole = 'patient' | 'doctor' | 'clinic' | 'lab';

export interface RoleConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  iconName: string; // Ionicons name
  identifierLabel: string;
  identifierPlaceholder: string;
  identifierRightActionText: string;
  defaultEmailOrId: string;
  demoPassword: string;
  portalName: string;
  primaryColor: string;
  badgeText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  identifier: string; // UHID or Registration No or Lab ID
  email?: string;
  phone?: string;
  avatarUrl?: string;
  specialtyOrTagline?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  isVerified?: boolean;
}

export interface PatientRegistrationData {
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  mobileNumber: string;
  isPhoneVerified: boolean;
  email: string;
  password?: string;
  bloodGroup?: string;
  address?: string;
  avatarUri?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  activeRole: UserRole;
  user: UserProfile | null;
  rememberDevice: boolean;
}

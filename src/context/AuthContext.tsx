import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile, PatientRegistrationData } from '../types/auth';
import { DoctorRegistrationData } from '../types/doctor';
import { DEMO_USERS } from '../constants/roleConfig';

interface AuthContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  rememberDevice: boolean;
  setRememberDevice: (remember: boolean) => void;
  signIn: (roleOverride?: UserRole) => void;
  signOut: () => void;
  registerPatient: (data: PatientRegistrationData) => void;
  registerDoctor: (data: DoctorRegistrationData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rememberDevice, setRememberDevice] = useState<boolean>(true);

  const signIn = (roleOverride?: UserRole) => {
    const roleToLogin = roleOverride || activeRole;
    setActiveRole(roleToLogin);
    setUser(DEMO_USERS[roleToLogin]);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const registerPatient = (data: PatientRegistrationData) => {
    const randomUHID = `UPC-PAT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProfile: UserProfile = {
      id: `pat-${Date.now()}`,
      name: data.fullName,
      role: 'patient',
      identifier: randomUHID,
      email: data.email || `${data.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: `+91 ${data.mobileNumber}`,
      avatarUrl:
        data.avatarUri ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      specialtyOrTagline: `UHID: ${randomUHID} • Blood Group ${data.bloodGroup || 'O+'}`,
      bloodGroup: data.bloodGroup,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      isVerified: true,
    };

    setActiveRole('patient');
    setUser(newProfile);
    setIsAuthenticated(true);
  };

  const registerDoctor = (data: DoctorRegistrationData) => {
    const regNum = data.registrationNumber || `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}`;
    const newProfile: UserProfile = {
      id: `doc-${Date.now()}`,
      name: data.fullLegalName,
      role: 'doctor',
      identifier: regNum,
      email: data.email,
      phone: `+91 ${data.phone}`,
      avatarUrl:
        data.photoUri ||
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      specialtyOrTagline: `${data.qualification || 'MD'} • ${data.primarySpecialty || 'General Medicine'} • ${data.yearsExperience || 10}+ Yrs Exp`,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: `${data.hospitalName}, ${data.city}`,
      isVerified: true,
    };

    setActiveRole('doctor');
    setUser(newProfile);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider
      value={{
        activeRole,
        setActiveRole,
        isAuthenticated,
        user,
        rememberDevice,
        setRememberDevice,
        signIn,
        signOut,
        registerPatient,
        registerDoctor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

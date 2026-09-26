export interface Doctor {
  id: string;
  name: string;
  avatarUrl: string;
  specialty: string;
  qualifications: string;
  experienceYears: number;
  clinicName: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  isVerified: boolean;
  isOnline: boolean;
  queueStatus?: {
    isLive: boolean;
    nowServingToken: number;
    availableToken: number;
  };
  nextAvailableSlot?: string;
}

// ─── Doctor Registration Types ───────────────────────────────────────────────

export type DoctorGender = 'Male' | 'Female' | 'Other';
export type GovIdType = 'aadhaar' | 'pan' | 'passport';
export type WeekDay = 'M' | 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su';

export interface ConsultationMode {
  enabled: boolean;
  fee?: number;
}

export interface ShiftTime {
  start: string;
  end: string;
}

export interface DoctorRegistrationData {
  // Step 1 – Personal Info
  photoUri?: string;
  fullLegalName: string;
  email: string;
  isEmailVerified: boolean;
  phone: string;
  isPhoneVerified: boolean;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: DoctorGender;

  // Step 2 – Medical Credentials
  medicalCouncil: string;
  registrationNumber: string;
  isLicenseVerified: boolean;
  yearOfRegistration: string;
  primarySpecialty: string;
  subSpecialties: string[];
  qualification: string;
  medicalCollege: string;
  yearsExperience: number;

  // Step 3 – Clinical Practice
  hospitalName: string;
  department: string;
  streetAddress: string;
  city: string;
  pincode: string;
  practicePhone: string;
  consultationModes: {
    video: ConsultationMode;
    inClinic: ConsultationMode;
    followUp: ConsultationMode;
  };
  availability: {
    days: WeekDay[];
    morningShift: ShiftTime;
    eveningShift: ShiftTime;
  };

  // Step 4 – Verification & Submit
  medCertUri?: string;
  degreeUri?: string;
  govIdType: GovIdType;
  govIdFrontUri?: string;
  govIdBackUri?: string;
  agreedTelemedicine: boolean;
  agreedAuthenticity: boolean;
}

export const DEFAULT_DOCTOR_DATA: DoctorRegistrationData = {
  photoUri: undefined,
  fullLegalName: '',
  email: '',
  isEmailVerified: false,
  phone: '',
  isPhoneVerified: false,
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  gender: 'Male',
  medicalCouncil: 'Delhi Medical Council (DMC)',
  registrationNumber: '',
  isLicenseVerified: false,
  yearOfRegistration: '',
  primarySpecialty: '',
  subSpecialties: [],
  qualification: '',
  medicalCollege: '',
  yearsExperience: 0,
  hospitalName: '',
  department: '',
  streetAddress: '',
  city: '',
  pincode: '',
  practicePhone: '',
  consultationModes: {
    video: { enabled: true, fee: 800 },
    inClinic: { enabled: true, fee: 1200 },
    followUp: { enabled: true },
  },
  availability: {
    days: ['M', 'T', 'W', 'Th', 'F', 'S'],
    morningShift: { start: '09:00 AM', end: '01:00 PM' },
    eveningShift: { start: '05:00 PM', end: '08:30 PM' },
  },
  medCertUri: undefined,
  degreeUri: undefined,
  govIdType: 'aadhaar',
  govIdFrontUri: undefined,
  govIdBackUri: undefined,
  agreedTelemedicine: false,
  agreedAuthenticity: false,
};


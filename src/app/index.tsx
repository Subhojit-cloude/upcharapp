import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useClinic } from '../context/ClinicContext';
import { Clinic } from '../types/clinic';
import { DoctorHeader } from '../components/doctor/DoctorHeader';
import { SectionHeader } from '../components/dashboard/SectionHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { QuickAction } from '../components/dashboard/QuickAction';
import { Avatar } from '../components/common/Avatar';
import { StatusBadge } from '../components/common/StatusBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Sample data for dashboard sections ──────────────────────────────────────

const todayAppointments = [
  { id: '1', name: 'S. Dutta', time: '09:30 AM', problem: 'Hypertension Follow-up', status: 'completed' as const, token: 1 },
  { id: '2', name: 'R. Ghosh', time: '10:00 AM', problem: 'Viral Fever & Cough', status: 'in-progress' as const, token: 2 },
  { id: '3', name: 'M. Roy', time: '10:30 AM', problem: 'Type 2 Diabetes Review', status: 'waiting' as const, token: 3 },
  { id: '4', name: 'P. Mukherjee', time: '11:00 AM', problem: 'Chronic Migraine', status: 'waiting' as const, token: 4 },
  { id: '5', name: 'A. Sen', time: '11:30 AM', problem: 'General Checkup', status: 'upcoming' as const, token: 5 },
];

const recentPatients = [
  { id: 'p1', name: 'Suman Dutta', age: 45, gender: 'Male', lastVisit: 'Today', problem: 'Hypertension' },
  { id: 'p2', name: 'Rina Ghosh', age: 32, gender: 'Female', lastVisit: 'Yesterday', problem: 'Viral Fever' },
  { id: 'p3', name: 'Mohan Roy', age: 58, gender: 'Male', lastVisit: '2 days ago', problem: 'Diabetes' },
  { id: 'p4', name: 'Priya Banerjee', age: 28, gender: 'Female', lastVisit: '3 days ago', problem: 'Skin Allergy' },
];

const recentPrescriptions = [
  { id: 'rx1', patientName: 'S. Dutta', date: 'Today', meds: 3, problem: 'Hypertension' },
  { id: 'rx2', patientName: 'R. Ghosh', date: 'Yesterday', meds: 4, problem: 'Viral Fever' },
  { id: 'rx3', patientName: 'K. Banerjee', date: '22 Sep', meds: 2, problem: 'Chest Pain' },
];

const recentReports = [
  { id: 'rp1', testName: 'Complete Blood Count', patientName: 'S. Dutta', date: 'Today', status: 'Report Ready' as const },
  { id: 'rp2', testName: 'Lipid Profile', patientName: 'M. Roy', date: 'Yesterday', status: 'Processing' as const },
  { id: 'rp3', testName: 'Thyroid Panel', patientName: 'P. Banerjee', date: '21 Sep', status: 'Report Ready' as const },
];

const notifications = [
  { id: 'n1', title: 'New Appointment', message: 'A. Sen booked for 11:30 AM today', time: '2 min ago', type: 'appointment' as const },
  { id: 'n2', title: 'Lab Report Ready', message: 'CBC report for S. Dutta is ready', time: '15 min ago', type: 'report' as const },
  { id: 'n3', title: 'Prescription Refill', message: 'R. Ghosh requested prescription refill', time: '1 hr ago', type: 'prescription' as const },
  { id: 'n4', title: 'Clinic Reminder', message: 'Evening OPD starts at 5:00 PM', time: '2 hr ago', type: 'reminder' as const },
];

// ─── Appointment Status Helpers ──────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#0D9488';
    case 'in-progress': return '#007AFF';
    case 'waiting': return '#D97706';
    case 'upcoming': return '#64748B';
    default: return '#64748B';
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'completed': return '#E6F8F3';
    case 'in-progress': return '#E0F2FE';
    case 'waiting': return '#FEF3C7';
    case 'upcoming': return '#F1F5F9';
    default: return '#F1F5F9';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Completed';
    case 'in-progress': return 'In Progress';
    case 'waiting': return 'Waiting';
    case 'upcoming': return 'Upcoming';
    default: return status;
  }
};

const getNotifIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'appointment': return 'calendar';
    case 'report': return 'document-text';
    case 'prescription': return 'receipt';
    case 'reminder': return 'alarm';
    default: return 'notifications';
  }
};

const getNotifColor = (type: string) => {
  switch (type) {
    case 'appointment': return '#007AFF';
    case 'report': return '#0D9488';
    case 'prescription': return '#4F46E5';
    case 'reminder': return '#D97706';
    default: return '#64748B';
  }
};

// ─── Animated Wrapper ────────────────────────────────────────────────────────

const AnimatedSection: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: any;
}> = ({ children, delay = 0, style }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    const cfg = { duration: 400, easing: Easing.out(Easing.quad) };
    opacity.value = withDelay(delay, withTiming(1, cfg));
    translateY.value = withDelay(delay, withTiming(0, cfg));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};

// ─── Add Patient Modal ──────────────────────────────────────────────────────

const AddPatientModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, phone: string, problem: string) => void;
}> = ({ visible, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [problem, setProblem] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter patient name');
      return;
    }
    onAdd(name, phone, problem);
    setName('');
    setPhone('');
    setProblem('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={modalStyles.headerIcon}>
                <Ionicons name="person-add" size={20} color="#007AFF" />
              </View>
              <Text style={modalStyles.title}>Add New Patient</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Patient Name *</Text>
            <TextInput
              style={modalStyles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Phone Number</Text>
            <TextInput
              style={modalStyles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Problem / Complaint</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={problem}
              onChangeText={setProblem}
              placeholder="Describe the issue..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={modalStyles.submitBtn}>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={modalStyles.submitBtnText}>Add Patient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Write Prescription Modal ───────────────────────────────────────────────

const WritePrescriptionModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (patient: string, medicines: string, notes: string) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const [patient, setPatient] = useState('');
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!patient.trim() || !medicines.trim()) {
      Alert.alert('Required', 'Please fill patient name and medicines');
      return;
    }
    onSubmit(patient, medicines, notes);
    setPatient('');
    setMedicines('');
    setNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={[modalStyles.headerIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="receipt" size={20} color="#4F46E5" />
              </View>
              <Text style={modalStyles.title}>Write Prescription</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Patient Name *</Text>
            <TextInput
              style={modalStyles.input}
              value={patient}
              onChangeText={setPatient}
              placeholder="Select or enter patient"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Medicines *</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={medicines}
              onChangeText={setMedicines}
              placeholder="Tab. Amlodipine 5mg - 1-0-0&#10;Tab. Metformin 500mg - 1-0-1"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Doctor's Notes</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional instructions..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[modalStyles.submitBtn, { backgroundColor: '#4F46E5' }]}>
              <Ionicons name="create" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={modalStyles.submitBtnText}>Save Prescription</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── View Reports Modal ─────────────────────────────────────────────────────

const ViewReportsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={[modalStyles.headerIcon, { backgroundColor: '#E6F8F3' }]}>
                <Ionicons name="document-text" size={20} color="#0D9488" />
              </View>
              <Text style={modalStyles.title}>Lab Reports</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={modalStyles.reportItem}
                activeOpacity={0.7}
                onPress={() => Alert.alert('Report Details', `${report.testName}\nPatient: ${report.patientName}\nDate: ${report.date}\nStatus: ${report.status}`)}
              >
                <View style={modalStyles.reportIcon}>
                  <Ionicons name="flask" size={18} color="#0D9488" />
                </View>
                <View style={modalStyles.reportInfo}>
                  <Text style={modalStyles.reportName}>{report.testName}</Text>
                  <Text style={modalStyles.reportPatient}>{report.patientName} • {report.date}</Text>
                </View>
                <View style={[
                  modalStyles.reportStatusBadge,
                  { backgroundColor: report.status === 'Report Ready' ? '#E6F8F3' : '#FEF3C7' }
                ]}>
                  <Text style={[
                    modalStyles.reportStatusText,
                    { color: report.status === 'Report Ready' ? '#0D9488' : '#D97706' }
                  ]}>{report.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={[modalStyles.submitBtn, { marginTop: 16, backgroundColor: '#0D9488' }]}>
            <Text style={modalStyles.submitBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Diagnostics Modal ──────────────────────────────────────────────────────

const DiagnosticsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onOrderTest: (testName: string, patient: string) => void;
}> = ({ visible, onClose, onOrderTest }) => {
  const [testName, setTestName] = useState('');
  const [patient, setPatient] = useState('');

  const popularTests = ['Complete Blood Count', 'Lipid Profile', 'Thyroid Panel', 'Blood Sugar', 'Urine Test', 'Liver Function'];

  const handleOrder = () => {
    if (!testName.trim() || !patient.trim()) {
      Alert.alert('Required', 'Please fill test name and patient');
      return;
    }
    onOrderTest(testName, patient);
    setTestName('');
    setPatient('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <View style={[modalStyles.headerIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="flask" size={20} color="#D97706" />
              </View>
              <Text style={modalStyles.title}>Order Diagnostic Test</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={modalStyles.subLabel}>Popular Tests</Text>
          <View style={modalStyles.chipWrap}>
            {popularTests.map((test) => (
              <TouchableOpacity
                key={test}
                onPress={() => setTestName(test)}
                style={[modalStyles.testChip, testName === test && modalStyles.testChipSelected]}
              >
                <Text style={[modalStyles.testChipText, testName === test && modalStyles.testChipTextSelected]}>{test}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Test Name</Text>
            <TextInput
              style={modalStyles.input}
              value={testName}
              onChangeText={setTestName}
              placeholder="Or type custom test name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={modalStyles.inputGroup}>
            <Text style={modalStyles.label}>Patient Name *</Text>
            <TextInput
              style={modalStyles.input}
              value={patient}
              onChangeText={setPatient}
              placeholder="Enter patient name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={modalStyles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
              <Text style={modalStyles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOrder} style={[modalStyles.submitBtn, { backgroundColor: '#D97706' }]}>
              <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={modalStyles.submitBtnText}>Order Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Patient Detail Modal ───────────────────────────────────────────────────

const PatientInfoModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  patient: typeof recentPatients[0] | null;
}> = ({ visible, onClose, patient }) => {
  if (!patient) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <View style={modalStyles.headerLeft}>
              <Avatar name={patient.name} size={40} />
              <View style={{ marginLeft: 10 }}>
                <Text style={modalStyles.title}>{patient.name}</Text>
                <Text style={{ fontSize: 12, color: '#64748B' }}>{patient.gender}, {patient.age} yrs</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.detailRow}>
            <View style={modalStyles.detailItem}>
              <Ionicons name="calendar" size={16} color="#007AFF" />
              <Text style={modalStyles.detailLabel}>Last Visit</Text>
              <Text style={modalStyles.detailValue}>{patient.lastVisit}</Text>
            </View>
            <View style={modalStyles.detailItem}>
              <Ionicons name="medkit" size={16} color="#0D9488" />
              <Text style={modalStyles.detailLabel}>Condition</Text>
              <Text style={modalStyles.detailValue}>{patient.problem}</Text>
            </View>
          </View>

          <View style={modalStyles.actionRow}>
            <TouchableOpacity style={modalStyles.actionBtn} onPress={() => { onClose(); Alert.alert('Calling', `Calling ${patient.name}...`); }}>
              <Ionicons name="call" size={18} color="#007AFF" />
              <Text style={[modalStyles.actionBtnText, { color: '#007AFF' }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.actionBtn} onPress={() => { onClose(); Alert.alert('Prescription', `Writing prescription for ${patient.name}`); }}>
              <Ionicons name="receipt" size={18} color="#4F46E5" />
              <Text style={[modalStyles.actionBtnText, { color: '#4F46E5' }]}>Prescribe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.actionBtn} onPress={() => { onClose(); Alert.alert('History', `Viewing medical history for ${patient.name}`); }}>
              <Ionicons name="time" size={18} color="#0D9488" />
              <Text style={[modalStyles.actionBtnText, { color: '#0D9488' }]}>History</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={[modalStyles.submitBtn, { marginTop: 16 }]}>
            <Text style={modalStyles.submitBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Live Pulse Dot ─────────────────────────────────────────────────────────

const PulseDot: React.FC<{ color?: string }> = ({ color = '#0D9488' }) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  return (
    <View style={{ width: 10, height: 10, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[{
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
      }, animatedStyle]} />
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
      }} />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function DoctorDashboardScreen() {
  const router = useRouter();
  const { clinics, selectClinic, doctor, toastMessage, showToast } = useClinic();

  // Modal states
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<typeof recentPatients[0] | null>(null);
  const [patientDetailOpen, setPatientDetailOpen] = useState(false);

  // Notification expand state
  const [notifExpanded, setNotifExpanded] = useState(false);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Compute stats from clinic data
  const allClinicSchedules = clinics.map(c => c.schedules['2024-09-25']).filter(Boolean);
  const totalAppointmentsToday = allClinicSchedules.reduce((acc, sched) => {
    return acc + [...sched.morningSlots, ...sched.eveningSlots].filter(s => s.status === 'booked').length;
  }, 0);
  const totalSlotsToday = allClinicSchedules.reduce((acc, sched) => {
    return acc + sched.morningSlots.length + sched.eveningSlots.length;
  }, 0);
  const openSlotsToday = totalSlotsToday - totalAppointmentsToday;
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import { Clinic } from '../types/clinic';

import { LoginScreen } from '../components/auth/LoginScreen';
import { PatientRegistrationScreen } from '../components/auth/PatientRegistrationScreen';
import { RoleTopBar } from '../components/common/RoleTopBar';
import { PatientDashboard } from '../components/patient/PatientDashboard';
import { DoctorDashboard } from '../components/doctor/DoctorDashboard';
import { LabDashboard } from '../components/lab/LabDashboard';
import { ClinicDashboard } from '../components/clinic/ClinicDashboard';
import { OnboardingScreen, ONBOARDING_STORAGE_KEY } from '../components/onboarding/OnboardingScreen';

export default function AppEntry() {
  const router = useRouter();
  const { isAuthenticated, activeRole, isRestoring } = useAuth();
  const { selectClinic, toastMessage } = useClinic();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // During development, reset onboarding flag so it always shows on restart.
      // Remove this block (or set to false) before shipping to production.
      if (__DEV__) {
        await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      }
      const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (e) {
      setHasSeenOnboarding(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleOpenClinic = (clinic: Clinic) => {
    selectClinic(clinic.id);
    router.push({
      pathname: '/schedule-detail',
      params: { clinicId: clinic.id },
    });
  };

  const handleAddPatient = (name: string, phone: string, problem: string) => {
    showToast(`Patient "${name}" added successfully!`);
  };

  const handleSavePrescription = (patient: string, medicines: string, notes: string) => {
    showToast(`Prescription saved for ${patient}`);
  };

  const handleOrderTest = (test: string, patient: string) => {
    showToast(`${test} ordered for ${patient}`);
  };

  // Loading state: wait for onboarding check AND Supabase session restore
  if (isLoadingAuth || hasSeenOnboarding === null || isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0B8EF3" />
        <View style={styles.loadingCard}>
          <Ionicons name="medical" size={42} color="#0B8EF3" />
          <Text style={styles.loadingTitle}>Upchar Health</Text>
          <ActivityIndicator size="small" color="#0B8EF3" style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  // First-time open: show onboarding carousel
  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          setHasSeenOnboarding(true);
        }}
      />
    );
  }

  // If user is not yet logged in, show the tri-role login or registration screen
  if (!isAuthenticated) {
    if (authView === 'register') {
      return (
        <PatientRegistrationScreen
          onBackToLogin={() => setAuthView('login')}
          onSuccessRegistration={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthView('register')}
      />
    );
  }

  // Once authenticated, show the active role experience with the RoleTopBar
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Toast */}
      {/* Floating Toast Notification from ClinicContext */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ DOCTOR HEADER ═══ */}
        <AnimatedSection delay={0}>
          <DoctorHeader
            doctor={doctor}
            onAvatarPress={() =>
              router.push({ pathname: '/schedule-detail', params: { clinicId: 'city-care' } })
            }
          />
        </AnimatedSection>

        {/* ═══ LIVE STATUS BANNER ═══ */}
        <AnimatedSection delay={60}>
          <View style={styles.liveBanner}>
            <View style={styles.liveBannerLeft}>
              <PulseDot />
              <Text style={styles.liveBannerText}>Live OPD Active</Text>
            </View>
            <View style={styles.liveBannerRight}>
              <Text style={styles.liveBannerCount}>{totalAppointmentsToday} appointments</Text>
              <Text style={styles.liveBannerDot}> • </Text>
              <Text style={styles.liveBannerCount}>{openSlotsToday} slots open</Text>
            </View>
          </View>
        </AnimatedSection>

        {/* ═══ TODAY'S OVERVIEW STATS ═══ */}
        <AnimatedSection delay={120}>
          <SectionHeader title="Today's Overview" subtitle="Your day at a glance" />
          <View style={styles.statsGrid}>
            <StatCard
              title="Patients Today"
              value={totalAppointmentsToday}
              subtitle="across all clinics"
              iconName="people"
              color="#007AFF"
              onPress={() => showToast(`${totalAppointmentsToday} patients booked today`)}
            />
            <StatCard
              title="Open Slots"
              value={openSlotsToday}
              subtitle="available today"
              iconName="time-outline"
              color="#0D9488"
              onPress={() => showToast(`${openSlotsToday} slots available`)}
            />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <StatCard
              title="Revenue"
              value="₹12,450"
              subtitle="today's earnings"
              iconName="wallet-outline"
              color="#4F46E5"
              onPress={() => showToast('Revenue details: ₹12,450 earned today')}
            />
            <StatCard
              title="Rating"
              value="4.9 ★"
              subtitle="182 reviews"
              iconName="star"
              color="#D97706"
              onPress={() => showToast('Your rating: 4.9/5 from 182 reviews')}
            />
          </View>
        </AnimatedSection>

        {/* ═══ QUICK ACTIONS ═══ */}
        <AnimatedSection delay={200}>
          <SectionHeader title="Quick Actions" subtitle="Frequently used features" />
          <View style={styles.quickActionsRow}>
            <QuickAction
              label="Add Patient"
              iconName="person-add"
              color="#007AFF"
              onPress={() => setAddPatientOpen(true)}
            />
            <QuickAction
              label="Prescribe"
              iconName="receipt"
              color="#4F46E5"
              onPress={() => setPrescriptionOpen(true)}
            />
            <QuickAction
              label="Reports"
              iconName="document-text"
              color="#0D9488"
              onPress={() => setReportsOpen(true)}
            />
            <QuickAction
              label="Diagnostics"
              iconName="flask"
              color="#D97706"
              onPress={() => setDiagnosticsOpen(true)}
            />
          </View>
        </AnimatedSection>

        {/* ═══ TODAY'S APPOINTMENTS ═══ */}
        <AnimatedSection delay={280}>
          <SectionHeader
            title="Today's Appointments"
            subtitle="Current appointment queue"
            actionText="View All"
            onAction={() => handleOpenClinic(clinics[0])}
          />
          <View style={styles.appointmentsList}>
            {todayAppointments.map((appt, idx) => (
              <TouchableOpacity
                key={appt.id}
                activeOpacity={0.85}
                style={[
                  styles.appointmentCard,
                  appt.status === 'in-progress' && styles.appointmentCardActive,
                ]}
                onPress={() => {
                  if (appt.status === 'completed') {
                    showToast(`${appt.name}'s appointment is completed`);
                  } else if (appt.status === 'in-progress') {
                    Alert.alert('In Progress', `${appt.name} is currently being consulted.\n\nProblem: ${appt.problem}`);
                  } else {
                    Alert.alert('Patient Details', `Token #${appt.token}\n${appt.name}\nTime: ${appt.time}\nProblem: ${appt.problem}\n\nStatus: ${getStatusLabel(appt.status)}`);
                  }
                }}
              >
                <View style={styles.apptLeft}>
                  <View style={styles.apptTokenCircle}>
                    <Text style={styles.apptTokenText}>{appt.token}</Text>
                  </View>
                  <View style={styles.apptInfo}>
                    <Text style={styles.apptName}>{appt.name}</Text>
                    <Text style={styles.apptProblem} numberOfLines={1}>{appt.problem}</Text>
                  </View>
                </View>
                <View style={styles.apptRight}>
                  <Text style={styles.apptTime}>{appt.time}</Text>
                  <View style={[styles.apptStatusBadge, { backgroundColor: getStatusBg(appt.status) }]}>
                    {appt.status === 'in-progress' && <PulseDot color={getStatusColor(appt.status)} />}
                    <Text style={[styles.apptStatusText, { color: getStatusColor(appt.status), marginLeft: appt.status === 'in-progress' ? 4 : 0 }]}>
                      {getStatusLabel(appt.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        {/* ═══ EARNINGS CARD ═══ */}
        <AnimatedSection delay={360}>
          <View style={styles.earningsCard}>
            <View style={styles.earningsHeader}>
              <View style={styles.earningsIconWrap}>
                <Ionicons name="trending-up" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.earningsTextGroup}>
                <Text style={styles.earningsTitle}>Today's Revenue</Text>
                <Text style={styles.earningsAmount}>₹12,450</Text>
              </View>
              <View style={styles.earningsGrowth}>
                <Ionicons name="arrow-up" size={14} color="#0D9488" />
                <Text style={styles.earningsGrowthText}>+18%</Text>
              </View>
            </View>
            <View style={styles.earningsBreakdown}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemLabel}>Consultations</Text>
                <Text style={styles.earningsItemValue}>₹8,500</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemLabel}>Procedures</Text>
                <Text style={styles.earningsItemValue}>₹2,450</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsItemLabel}>Follow-ups</Text>
                <Text style={styles.earningsItemValue}>₹1,500</Text>
              </View>
            </View>
          </View>
        </AnimatedSection>

        {/* ═══ RECENT PATIENTS ═══ */}
        <AnimatedSection delay={420}>
          <SectionHeader
            title="Recent Patients"
            subtitle="Recently visited patients"
            actionText="See All"
            onAction={() => showToast('All patients list')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.patientScroll}>
            {recentPatients.map((pat) => (
              <TouchableOpacity
                key={pat.id}
                style={styles.patientChipCard}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedPatient(pat);
                  setPatientDetailOpen(true);
                }}
              >
                <Avatar name={pat.name} size={44} />
                <Text style={styles.patientChipName} numberOfLines={1}>{pat.name.split(' ')[0]}</Text>
                <Text style={styles.patientChipSub}>{pat.age}y, {pat.gender[0]}</Text>
                <View style={styles.patientChipVisit}>
                  <Text style={styles.patientChipVisitText}>{pat.lastVisit}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AnimatedSection>

        {/* ═══ PRESCRIPTIONS & REPORTS ═══ */}
        <AnimatedSection delay={480}>
          <SectionHeader
            title="Prescriptions & Reports"
            subtitle="Recent medical records"
          />
          <View style={styles.tabsRow}>
            <View style={styles.miniTabsContainer}>
              {/* Prescriptions */}
              {recentPrescriptions.map((rx) => (
                <TouchableOpacity
                  key={rx.id}
                  style={styles.rxCard}
                  activeOpacity={0.85}
                  onPress={() => Alert.alert('Prescription', `Patient: ${rx.patientName}\nDate: ${rx.date}\nMedicines: ${rx.meds}\nCondition: ${rx.problem}`)}
                >
                  <View style={styles.rxLeft}>
                    <View style={styles.rxIcon}>
                      <Ionicons name="receipt" size={16} color="#4F46E5" />
                    </View>
                    <View>
                      <Text style={styles.rxPatient}>{rx.patientName}</Text>
                      <Text style={styles.rxDetail}>{rx.meds} medications • {rx.problem}</Text>
                    </View>
                  </View>
                  <Text style={styles.rxDate}>{rx.date}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedSection>

        {/* ═══ DIAGNOSTIC RESULTS ═══ */}
        <AnimatedSection delay={540}>
          <SectionHeader
            title="Diagnostic Results"
            subtitle="Lab tests & reports"
            actionText="View All"
            onAction={() => setReportsOpen(true)}
          />
          {recentReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.diagCard}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Report', `${report.testName}\nPatient: ${report.patientName}\nDate: ${report.date}\nStatus: ${report.status}`)}
            >
              <View style={styles.diagLeft}>
                <View style={[styles.diagIconWrap, { backgroundColor: report.status === 'Report Ready' ? '#E6F8F3' : '#FEF3C7' }]}>
                  <Ionicons
                    name="flask"
                    size={18}
                    color={report.status === 'Report Ready' ? '#0D9488' : '#D97706'}
                  />
                </View>
                <View>
                  <Text style={styles.diagTestName}>{report.testName}</Text>
                  <Text style={styles.diagPatientName}>{report.patientName} • {report.date}</Text>
                </View>
              </View>
              <View style={[styles.diagStatusPill, { backgroundColor: report.status === 'Report Ready' ? '#E6F8F3' : '#FEF3C7' }]}>
                <Text style={[styles.diagStatusText, { color: report.status === 'Report Ready' ? '#0D9488' : '#D97706' }]}>
                  {report.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </AnimatedSection>

        {/* ═══ NOTIFICATIONS ═══ */}
        <AnimatedSection delay={600}>
          <SectionHeader
            title="Notifications"
            subtitle={`${notifications.length} recent updates`}
            actionText={notifExpanded ? 'Show Less' : 'Show All'}
            onAction={() => setNotifExpanded(!notifExpanded)}
          />
          <View style={styles.notifList}>
            {(notifExpanded ? notifications : notifications.slice(0, 2)).map((notif) => (
              <TouchableOpacity
                key={notif.id}
                style={styles.notifCard}
                activeOpacity={0.85}
                onPress={() => Alert.alert(notif.title, notif.message)}
              >
                <View style={[styles.notifIconWrap, { backgroundColor: `${getNotifColor(notif.type)}15` }]}>
                  <Ionicons name={getNotifIcon(notif.type)} size={18} color={getNotifColor(notif.type)} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifMessage} numberOfLines={1}>{notif.message}</Text>
                </View>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        {/* ═══ MY CLINICS ═══ */}
        <AnimatedSection delay={660}>
          <SectionHeader
            title="My Clinics"
            subtitle="Clinics you're currently associated with"
          />
          <View style={styles.clinicsList}>
            {clinics.map((clinic) => (
              <TouchableOpacity
                key={clinic.id}
                style={[styles.clinicMiniCard, clinic.isPrimary && styles.clinicMiniCardPrimary]}
                activeOpacity={0.88}
                onPress={() => handleOpenClinic(clinic)}
              >
                {clinic.isPrimary && <View style={styles.primaryBar} />}
                <View style={styles.clinicMiniTop}>
                  <View style={styles.clinicMiniIcon}>
                    <MaterialCommunityIcons name="hospital-box" size={22} color="#007AFF" />
                  </View>
                  <View style={styles.clinicMiniInfo}>
                    <Text style={styles.clinicMiniName} numberOfLines={1}>{clinic.name}</Text>
                    <View style={styles.clinicMiniLocRow}>
                      <Ionicons name="location-outline" size={12} color="#64748B" />
                      <Text style={styles.clinicMiniLoc}>{clinic.location}</Text>
                    </View>
                  </View>
                  <StatusBadge label="Active" variant="active" showDot />
                </View>
                <View style={styles.clinicMiniBottom}>
                  <View style={styles.clinicMiniChip}>
                    <Text style={styles.clinicMiniChipText}>{clinic.role}</Text>
                  </View>
                  <View style={styles.clinicMiniChip}>
                    <Ionicons name="calendar-outline" size={11} color="#475569" style={{ marginRight: 3 }} />
                    <Text style={styles.clinicMiniChipText}>{clinic.scheduleDays}</Text>
                  </View>
                </View>
                <View style={styles.clinicMiniSlot}>
                  <Ionicons name="time-outline" size={14} color="#007AFF" />
                  <Text style={styles.clinicMiniSlotLabel}>{clinic.nextSlotLabel}:</Text>
                  <Text style={styles.clinicMiniSlotTime}>{clinic.nextSlotText}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedSection>

        {/* Bottom Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═══ MODALS ═══ */}
      <AddPatientModal
        visible={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        onAdd={handleAddPatient}
      />
      <WritePrescriptionModal
        visible={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
        onSubmit={handleSavePrescription}
      />
      <ViewReportsModal
        visible={reportsOpen}
        onClose={() => setReportsOpen(false)}
      />
      <DiagnosticsModal
        visible={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        onOrderTest={handleOrderTest}
      />
      <PatientInfoModal
        visible={patientDetailOpen}
        onClose={() => { setPatientDetailOpen(false); setSelectedPatient(null); }}
        patient={selectedPatient}
      />
      {/* Top Role Switcher Bar: Allows instantaneous switching between Patient, Doctor, Clinic, and Lab */}
      <RoleTopBar />

      {/* Render the Active Role Experience */}
      <View style={styles.content}>
        {activeRole === 'patient' && (
          <PatientDashboard
            onNavigateToClinicDetail={(clinicId) => {
              selectClinic(clinicId);
              router.push({
                pathname: '/schedule-detail',
                params: { clinicId },
              });
            }}
          />
        )}

        {activeRole === 'clinic' && <ClinicDashboard />}

        {activeRole === 'doctor' && (
          <DoctorDashboard onOpenClinic={handleOpenClinic} />
        )}

        {activeRole === 'lab' && <LabDashboard />}
      </View>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN STYLES ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 12 : 6,
    paddingBottom: 60,
  content: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // Live Banner
  liveBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  liveBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  liveBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveBannerCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  liveBannerDot: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  // Appointments List
  appointmentsList: {
    marginBottom: 22,
    gap: 8,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  appointmentCardActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#FAFCFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  apptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  apptTokenCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  apptTokenText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#007AFF',
  },
  apptInfo: {
    flex: 1,
    marginRight: 10,
  },
  apptName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  apptProblem: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  apptRight: {
    alignItems: 'flex-end',
  },
  apptTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  apptStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  apptStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Earnings Card
  earningsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earningsTextGroup: {
    flex: 1,
  },
  earningsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  earningsGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 2,
  },
  earningsGrowthText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  earningsBreakdown: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsItem: {
    alignItems: 'center',
    flex: 1,
  },
  earningsItemLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  earningsItemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  earningsDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },

  // Patient Chips (horizontal)
  patientScroll: {
    marginBottom: 22,
  },
  patientChipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  patientChipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    textAlign: 'center',
  },
  patientChipSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  patientChipVisit: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  patientChipVisitText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF',
  },

  // Prescriptions
  tabsRow: {
    marginBottom: 22,
  },
  miniTabsContainer: {
    gap: 8,
  },
  rxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rxIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rxPatient: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rxDetail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rxDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Diagnostic Cards
  diagCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diagIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  diagTestName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  diagPatientName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  diagStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diagStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Notifications
  notifList: {
    gap: 8,
    marginBottom: 22,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notifIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notifContent: {
    flex: 1,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  notifMessage: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Clinics List (compact)
  clinicsList: {
    gap: 12,
    marginBottom: 8,
  },
  clinicMiniCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  clinicMiniCardPrimary: {
    borderColor: '#E0E7FF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.06,
  },
  primaryBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#007AFF',
  },
  clinicMiniTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  clinicMiniIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  clinicMiniInfo: {
    flex: 1,
  },
  clinicMiniName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  clinicMiniLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  clinicMiniLoc: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 3,
  },
  clinicMiniBottom: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  clinicMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clinicMiniChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  clinicMiniSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  clinicMiniSlotLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  clinicMiniSlotTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MODAL STYLES ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#F8FAFD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  testChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  testChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  testChipTextSelected: {
    color: '#FFFFFF',
  },

  // Report items in modal
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reportIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E6F8F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportPatient: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  reportStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reportStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Patient detail modal
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#F8FAFD',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

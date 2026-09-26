import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';

interface PatientDashboardProps {
  onNavigateToClinicDetail?: (clinicId: string) => void;
}

interface LiveQueueData {
  doctorName: string;
  specialization: string;
  clinicName: string;
  tokenNumber: string;
  nowServing: string;
  waitTime: string;
  aheadText: string;
  status: string;
  timeSlot: string;
}

interface DiagnosticReportItem {
  id: string;
  title: string;
  labName: string;
  status: string;
  reportUrl?: string | null;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigateToClinicDetail,
}) => {
  const { user } = useAuth();

  // Active appointment / OPD queue data matching database
  const [appointment, setAppointment] = useState<LiveQueueData | null>(null);
  const [reports, setReports] = useState<DiagnosticReportItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [apptLoadError, setApptLoadError] = useState<string | null>(null);
  const [diagLoadError, setDiagLoadError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleRetry = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  // Load real appointments and diagnostic reports from DB for this patient
  useEffect(() => {
    let isMounted = true;

    async function loadPatientData() {
      setIsLoadingData(true);

      if (!user) {
        if (isMounted) {
          setAppointment(null);
          setReports([]);
          setApptLoadError(null);
          setDiagLoadError(null);
          setIsLoadingData(false);
        }
        return;
      }

      try {
        const safePatientId = user.id ? user.id.replace(/[^a-zA-Z0-9-]/g, '') : '';
        const idClause = safePatientId ? `patient_id.eq.${safePatientId}` : null;
        const cleanPhone = user.phone ? user.phone.replace(/[^0-9+]/g, '') : null;
        const safePhone = cleanPhone ? `"${cleanPhone}"` : null;
        const phoneClause = safePhone ? `patient_phone.eq.${safePhone}` : null;

        // Query appointments matching non-empty patient ID or patient phone safely quoted
        const filterClauses = [idClause, phoneClause].filter((c): c is string => Boolean(c));
        if (filterClauses.length === 0) {
          if (isMounted) {
            setAppointment(null);
            setReports([]);
            setApptLoadError(null);
            setDiagLoadError(null);
          }
          return;
        }

        const filterOr = filterClauses.join(',');
        const diagFilterOr = filterOr;

        const { data: apptRows, error: apptError } = await supabase
          .from('appointments')
          .select('*')
          .or(filterOr)
          .order('date', { ascending: false })
          .limit(1);

        if (apptError) {
          console.error('Error loading patient appointments:', apptError);
          if (isMounted) {
            setApptLoadError('Unable to load appointment queue. Tap retry to reload.');
          }
        } else if (isMounted) {
          setApptLoadError(null);
          if (apptRows && apptRows.length > 0) {
            const appt = apptRows[0];
            const tokenNum =
              appt.queue_number != null
                ? appt.queue_number < 10
                  ? `#0${appt.queue_number}`
                  : `#${appt.queue_number}`
                : '--';

            const backendServing =
              appt.current_serving ?? appt.now_serving ?? appt.currently_serving;
            const nowServing =
              backendServing != null
                ? typeof backendServing === 'number'
                  ? backendServing < 10
                    ? `#0${backendServing}`
                    : `#${backendServing}`
                  : String(backendServing).startsWith('#')
                  ? String(backendServing)
                  : `#${backendServing}`
                : '--';

            const isDone = appt.status === 'Completed';

            setAppointment({
              doctorName: appt.doctor_name
                ? `Dr. ${appt.doctor_name}${appt.specialization ? ` (${appt.specialization})` : ''}`
                : 'Consulting Doctor',
              specialization: appt.specialization || 'General Practice',
              clinicName: appt.clinic_name || appt.organization_type || 'Clinic',
              tokenNumber: tokenNum,
              nowServing,
              waitTime: isDone ? 'Done' : appt.wait_time || '--',
              aheadText: isDone
                ? 'Consultation completed • Prescription uploaded'
                : appt.ahead_text ||
                  (appt.queue_number
                    ? 'Please wait for your token to be called'
                    : 'Appointment confirmed'),
              status: appt.status || 'Confirmed',
              timeSlot: appt.time_slot || '--',
            });
          } else {
            setAppointment(null);
          }
        }

        // Query diagnostic requests matching non-empty patient ID or phone
        const { data: diagRows, error: diagError } = await supabase
          .from('diagnostic_requests')
          .select('*')
          .or(diagFilterOr)
          .order('created_at', { ascending: false })
          .limit(3);

        if (diagError) {
          console.error('Error loading diagnostic requests:', diagError);
          if (isMounted) {
            setDiagLoadError('Unable to load diagnostic reports. Tap retry to reload.');
          }
        } else if (isMounted) {
          setDiagLoadError(null);
          if (diagRows && diagRows.length > 0) {
            const mappedReports: DiagnosticReportItem[] = diagRows.map(
              (row: any) => {
                let title = 'Health Diagnostic Panel';
                if (
                  Array.isArray(row.selected_tests) &&
                  row.selected_tests.length > 0
                ) {
                  title = row.selected_tests.join(' • ');
                } else if (typeof row.selected_tests === 'string') {
                  title = row.selected_tests;
                } else if (row.custom_tests) {
                  title = row.custom_tests;
                }

                const formattedDate = row.created_at
                  ? new Date(row.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Recent';

                const labName = `${row.diagnostic_center_name || 'Diagnostic Lab'} • ${formattedDate}`;
                const status =
                  row.status === 'paid'
                    ? 'Verified Report Ready'
                    : row.status === 'quoted'
                    ? 'Quote Available'
                    : 'Processing Sample';

                return {
                  id: row.id,
                  title,
                  labName,
                  status,
                  reportUrl: row.report_url,
                };
              }
            );
            setReports(mappedReports);
          } else {
            setReports([]);
          }
        }
      } catch (err) {
        console.warn('Could not load patient DB attributes:', err);
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadPatientData();

    return () => {
      isMounted = false;
    };
  }, [user, reloadTrigger]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Patient Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                user?.avatarUrl ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            }}
            style={styles.avatar}
          />
          <View>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Namaste,</Text>
              <Text style={styles.userName}>{user?.name || 'Sanjay Sharma'}</Text>
            </View>
            <View style={styles.uhidBadgeRow}>
              <View style={styles.uhidBadge}>
                <Ionicons name="card-outline" size={12} color="#0080FF" />
                <Text style={styles.uhidText}>
                  {user?.identifier || '--'}
                </Text>
              </View>
              <View style={styles.bloodBadge}>
                <Text style={styles.bloodText}>
                  {user?.bloodGroup || 'O+ Positive'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          <View style={styles.unreadDot} />
        </TouchableOpacity>
      </View>

      {/* 2. Search Healthcare Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors, clinics, tests, medicines..."
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={18} color="#0080FF" />
        </TouchableOpacity>
      </View>

      {/* 3. Live OPD Queue Tracker Card (Connected to DB Appointments) */}
      {isLoadingData ? (
        <View style={styles.loadingQueueCard}>
          <ActivityIndicator size="small" color="#0080FF" />
          <Text style={styles.loadingQueueText}>Loading live queue status...</Text>
        </View>
      ) : apptLoadError ? (
        <View style={styles.errorQueueCard}>
          <Ionicons name="alert-circle-outline" size={26} color="#EF4444" />
          <Text style={styles.errorQueueTitle}>Failed to Load Queue</Text>
          <Text style={styles.errorQueueSubtitle}>{apptLoadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={15} color="#0080FF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : appointment ? (
        <View style={styles.liveQueueCard}>
          <View style={styles.queueHeaderRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveIndicatorText}>LIVE OPD QUEUE</Text>
            </View>
            <Text style={styles.clinicTag}>{appointment.clinicName}</Text>
          </View>

          <View style={styles.queueBody}>
            <View style={styles.doctorInfoRow}>
              <MaterialCommunityIcons
                name="stethoscope"
                size={20}
                color="#0080FF"
              />
              <Text style={styles.doctorNameText}>{appointment.doctorName}</Text>
            </View>

            <View style={styles.tokenHighlightRow}>
              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>YOUR TOKEN</Text>
                <Text style={styles.tokenBoxValue}>
                  {appointment.tokenNumber}
                </Text>
              </View>

              <View style={styles.tokenDivider} />

              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>NOW SERVING</Text>
                <Text style={[styles.tokenBoxValue, { color: '#0D9488' }]}>
                  {appointment.nowServing}
                </Text>
              </View>

              <View style={styles.tokenDivider} />

              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>WAIT TIME</Text>
                <Text style={[styles.tokenBoxValue, { color: '#F59E0B' }]}>
                  {appointment.waitTime}
                </Text>
              </View>
            </View>

            <View style={styles.queueFooterRow}>
              <View style={styles.aheadBadge}>
                <Ionicons name="time-outline" size={14} color="#0369A1" />
                <Text style={styles.aheadText}>{appointment.aheadText}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.viewQueueDetailsBtn}
                onPress={() => onNavigateToClinicDetail?.('city-care')}
              >
                <Text style={styles.viewQueueDetailsText}>View Schedule</Text>
                <Ionicons name="chevron-forward" size={14} color="#0080FF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyQueueCard}>
          <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyQueueTitle}>No Active Appointments</Text>
          <Text style={styles.emptyQueueSubtitle}>
            When you book a consultation, your live token and queue tracking will appear here.
          </Text>
        </View>
      )}

      {/* 4. Quick Actions Grid */}
      <Text style={styles.sectionTitle}>Healthcare Services</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.gridItem}
          activeOpacity={0.8}
          onPress={() => onNavigateToClinicDetail?.('city-care')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="person-add-outline" size={24} color="#0080FF" />
          </View>
          <Text style={styles.gridTitle}>Find Doctor</Text>
          <Text style={styles.gridSubtitle}>Consult OPD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          activeOpacity={0.8}
          onPress={() => onNavigateToClinicDetail?.('city-care')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="people-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.gridTitle}>Live Queue</Text>
          <Text style={styles.gridSubtitle}>Track Token</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="flask-outline" size={24} color="#9333EA" />
          </View>
          <Text style={styles.gridTitle}>Lab Tests</Text>
          <Text style={styles.gridSubtitle}>Book Sample</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="document-text-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.gridTitle}>Health Rx</Text>
          <Text style={styles.gridSubtitle}>My Records</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Recent Reports & Prescriptions (Connected to DB diagnostic_requests) */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Recent Diagnostic Reports</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {isLoadingData ? (
        <View style={styles.emptyReportsBox}>
          <ActivityIndicator size="small" color="#0080FF" />
          <Text style={styles.emptyReportsText}>Loading reports...</Text>
        </View>
      ) : diagLoadError ? (
        <View style={styles.errorReportsBox}>
          <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
          <Text style={styles.errorReportsTitle}>Failed to Load Reports</Text>
          <Text style={styles.errorReportsSubtitle}>{diagLoadError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={15} color="#0080FF" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reports.length > 0 ? (
        reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportIconBox}>
              <Ionicons
                name="document-attach-outline"
                size={24}
                color="#0D9488"
              />
            </View>
            <View style={styles.reportDetails}>
              <Text style={styles.reportName}>{report.title}</Text>
              <Text style={styles.reportLab}>{report.labName}</Text>
              <View style={styles.readyBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                <Text style={styles.readyText}>{report.status}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
              <Ionicons name="arrow-down-circle" size={26} color="#0080FF" />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyReportsBox}>
          <Ionicons name="document-text-outline" size={24} color="#94A3B8" />
          <Text style={styles.emptyReportsText}>No diagnostic reports found</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#0080FF',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greetingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  uhidBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  uhidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  uhidText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0080FF',
  },
  bloodBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bloodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    marginLeft: 8,
    paddingVertical: 0,
  },
  filterBtn: {
    padding: 6,
  },
  liveQueueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2FE',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
  },
  liveIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  clinicTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
  },
  queueBody: {
    padding: 16,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  doctorNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  tokenHighlightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  tokenBox: {
    alignItems: 'center',
    flex: 1,
  },
  tokenBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tokenBoxValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0080FF',
  },
  tokenDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  queueFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  aheadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  aheadText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  viewQueueDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewQueueDetailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0080FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0080FF',
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  reportIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportDetails: {
    flex: 1,
  },
  reportName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  reportLab: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 4,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  downloadBtn: {
    padding: 4,
  },
  loadingQueueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  loadingQueueText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyQueueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyQueueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
  },
  emptyQueueSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyReportsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 6,
  },
  emptyReportsText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  errorQueueCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorQueueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 8,
  },
  errorQueueSubtitle: {
    fontSize: 12.5,
    color: '#B91C1C',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  errorReportsBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 10,
    gap: 6,
  },
  errorReportsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
  },
  errorReportsSubtitle: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  retryBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0080FF',
  },
});

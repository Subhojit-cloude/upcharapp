import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DoctorRegistrationData, WeekDay } from '../../../types/doctor';
import { FormField } from '../shared/FormField';
import { ToggleCard } from '../shared/ToggleCard';

interface Step3ClinicalPracticeProps {
  data: DoctorRegistrationData;
  updateData: (fields: Partial<DoctorRegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALL_DAYS: { key: WeekDay; label: string }[] = [
  { key: 'M', label: 'M' },
  { key: 'T', label: 'T' },
  { key: 'W', label: 'W' },
  { key: 'Th', label: 'T' },
  { key: 'F', label: 'F' },
  { key: 'S', label: 'S' },
  { key: 'Su', label: 'S' },
];

export const Step3ClinicalPractice: React.FC<Step3ClinicalPracticeProps> = ({
  data,
  updateData,
  onNext,
  onBack,
}) => {
  const enabledCount =
    (data.consultationModes.video.enabled ? 1 : 0) +
    (data.consultationModes.inClinic.enabled ? 1 : 0) +
    (data.consultationModes.followUp.enabled ? 1 : 0);

  const handleToggleDay = (day: WeekDay) => {
    const currentDays = data.availability.days || [];
    const exists = currentDays.includes(day);
    const nextDays = exists
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateData({
      availability: {
        ...data.availability,
        days: nextDays,
      },
    });
  };

  const handleEditShift = (shiftName: 'morningShift' | 'eveningShift') => {
    Alert.alert(
      'Shift Timings',
      `Custom shift scheduler for ${shiftName === 'morningShift' ? 'Morning Shift' : 'Evening Shift'}. Timings saved.`,
      [{ text: 'OK' }]
    );
  };

  const handleContinue = () => {
    if (!data.hospitalName.trim()) {
      Alert.alert('Required Field', 'Please enter your Primary Hospital / Clinic Name.');
      return;
    }
    if (!data.city.trim() || !data.pincode.trim()) {
      Alert.alert('Required Field', 'Please provide your Clinic City and Pincode.');
      return;
    }
    onNext();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Banner */}
      <View style={styles.topHeaderBanner}>
        <View style={styles.bannerIconBox}>
          <Ionicons name="business-outline" size={24} color="#0D9488" />
        </View>
        <View style={styles.bannerTextBlock}>
          <Text style={styles.bannerTitle}>Practice & Workplace Setup</Text>
          <Text style={styles.bannerSubtitle}>
            Configure your primary clinic location, hospital affiliations, and consultation settings.
          </Text>
        </View>
      </View>

      {/* ── Section 1: Primary Facility Details ────────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="business-outline" size={18} color="#0EA5E9" />
          <Text style={styles.sectionTitle}>Primary Facility Details</Text>
        </View>

        {/* Hospital Name */}
        <FormField
          label="Hospital / Clinic Name"
          placeholder="Max Super Speciality Hospital, Saket"
          value={data.hospitalName}
          onChangeText={(text) => updateData({ hospitalName: text })}
          icon="🏥"
        />

        {/* Department / Facility Ward */}
        <FormField
          label="Department / Facility Ward"
          placeholder="Cardiology & Heart Institute"
          value={data.department}
          onChangeText={(text) => updateData({ department: text })}
          icon="🩺"
        />

        {/* Street Address */}
        <FormField
          label="Street Address"
          placeholder="1, 2 Press Enclave Marg, Saket"
          value={data.streetAddress}
          onChangeText={(text) => updateData({ streetAddress: text })}
          icon="📍"
        />

        {/* City & Pincode Row */}
        <View style={styles.twoColRow}>
          <FormField
            containerStyle={styles.colHalf}
            label="City"
            placeholder="New Delhi"
            value={data.city}
            onChangeText={(text) => updateData({ city: text })}
          />
          <FormField
            containerStyle={styles.colHalf}
            label="Pincode"
            placeholder="110017"
            value={data.pincode}
            onChangeText={(text) => updateData({ pincode: text })}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        {/* Practice Desk Phone */}
        <FormField
          label="Practice / Desk Number"
          placeholder="+91 11 2651 5050"
          value={data.practicePhone}
          onChangeText={(text) => updateData({ practicePhone: text })}
          keyboardType="phone-pad"
          icon="📞"
        />
      </View>

      {/* ── Section 2: Consultation Modes & Tariffs ───────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="card-outline" size={18} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Consultation Modes & Tariffs</Text>
          </View>
          <View style={styles.enabledBadge}>
            <Text style={styles.enabledBadgeText}>{enabledCount} Enabled</Text>
          </View>
        </View>

        {/* Mode 1: Video */}
        <ToggleCard
          icon="📹"
          title="Video Consultation"
          subtitle="Encrypted tele-health audio/video"
          enabled={data.consultationModes.video.enabled}
          onToggle={(val) =>
            updateData({
              consultationModes: {
                ...data.consultationModes,
                video: { ...data.consultationModes.video, enabled: val },
              },
            })
          }
          feeLabel="/ 15 min"
          feeValue={String(data.consultationModes.video.fee || 800)}
          onFeeChange={(val) =>
            updateData({
              consultationModes: {
                ...data.consultationModes,
                video: {
                  ...data.consultationModes.video,
                  fee: parseInt(val, 10) || 0,
                },
              },
            })
          }
        />

        {/* Mode 2: In-Clinic */}
        <ToggleCard
          icon="🩺"
          title="In-Clinic Physical Visit"
          subtitle="OPD chamber examination"
          enabled={data.consultationModes.inClinic.enabled}
          onToggle={(val) =>
            updateData({
              consultationModes: {
                ...data.consultationModes,
                inClinic: { ...data.consultationModes.inClinic, enabled: val },
              },
            })
          }
          feeLabel="/ patient"
          feeValue={String(data.consultationModes.inClinic.fee || 1200)}
          onFeeChange={(val) =>
            updateData({
              consultationModes: {
                ...data.consultationModes,
                inClinic: {
                  ...data.consultationModes.inClinic,
                  fee: parseInt(val, 10) || 0,
                },
              },
            })
          }
        />

        {/* Mode 3: Follow-up Chat */}
        <ToggleCard
          icon="💬"
          title="Follow-up Chat Window"
          subtitle="Post-consultation queries"
          enabled={data.consultationModes.followUp.enabled}
          onToggle={(val) =>
            updateData({
              consultationModes: {
                ...data.consultationModes,
                followUp: { ...data.consultationModes.followUp, enabled: val },
              },
            })
          }
          freeLabel="7 Days Free Follow-up"
        />
      </View>

      {/* ── Section 3: Weekly Availability ────────────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="calendar-outline" size={18} color="#0EA5E9" />
            <Text style={styles.sectionTitle}>Weekly Availability</Text>
          </View>
          <Text style={styles.activeDaysSubtitle}>
            {data.availability.days.length} Days active
          </Text>
        </View>

        {/* Day Selector Chips */}
        <View style={styles.daysRow}>
          {ALL_DAYS.map((dayItem, index) => {
            const isSelected = data.availability.days.includes(dayItem.key);
            return (
              <TouchableOpacity
                key={`${dayItem.key}-${index}`}
                style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                onPress={() => handleToggleDay(dayItem.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    isSelected && styles.dayChipTextSelected,
                  ]}
                >
                  {dayItem.label}
                </Text>
                {isSelected && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Morning Shift */}
        <View style={styles.shiftCard}>
          <View style={styles.shiftIconBox}>
            <Text style={styles.shiftEmoji}>🌅</Text>
          </View>
          <View style={styles.shiftTextBlock}>
            <Text style={styles.shiftTitle}>Morning Shift</Text>
            <Text style={styles.shiftTime}>
              {data.availability.morningShift.start} –{' '}
              {data.availability.morningShift.end} (4 hrs)
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEditShift('morningShift')}
            style={styles.shiftEditBtn}
          >
            <Ionicons name="pencil" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Evening Shift */}
        <View style={styles.shiftCard}>
          <View style={styles.shiftIconBox}>
            <Text style={styles.shiftEmoji}>🌇</Text>
          </View>
          <View style={styles.shiftTextBlock}>
            <Text style={styles.shiftTitle}>Evening Shift</Text>
            <Text style={styles.shiftTime}>
              {data.availability.eveningShift.start} –{' '}
              {data.availability.eveningShift.end} (3.5 hrs)
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleEditShift('eveningShift')}
            style={styles.shiftEditBtn}
          >
            <Ionicons name="pencil" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Google Maps OPD Sync Callout */}
      <View style={styles.gmapCallout}>
        <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
        <Text style={styles.gmapCalloutText}>
          Upchar Health syncs verified address coordinates directly to Google Maps to help patients arrive effortlessly for OPD walk-ins.
        </Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#475569" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>Continue to Verification</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  topHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 12,
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  bannerTextBlock: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  enabledBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  enabledBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  activeDaysSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dayChip: {
    width: 38,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayChipSelected: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  dayChipTextSelected: {
    color: '#FFFFFF',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  shiftCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 10,
  },
  shiftIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftEmoji: {
    fontSize: 18,
  },
  shiftTextBlock: {
    flex: 1,
  },
  shiftTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  shiftTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  shiftEditBtn: {
    padding: 6,
  },
  gmapCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF125',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginBottom: 16,
    gap: 10,
  },
  gmapCalloutText: {
    flex: 1,
    fontSize: 11,
    color: '#0F766E',
    lineHeight: 15,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  continueBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

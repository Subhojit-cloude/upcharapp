import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export type UploadStatus = 'idle' | 'uploaded' | 'pending';

interface DocumentUploadCardProps {
  title: string;
  subtitle: string;
  status: UploadStatus;
  fileName?: string;
  fileSize?: string;
  fileNote?: string;
  onUpload: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  subtitle,
  status,
  fileName,
  fileSize,
  fileNote,
  onUpload,
}) => {
  const statusColor =
    status === 'uploaded' ? '#10B981' : status === 'pending' ? '#F59E0B' : '#94A3B8';
  const statusLabel =
    status === 'uploaded' ? '✅ Uploaded' : status === 'pending' ? '⚠️ Pending' : '📎 Not Uploaded';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {status === 'uploaded' && fileName ? (
        <View style={styles.fileRow}>
          <Text style={styles.fileIcon}>📄</Text>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
            {fileSize && <Text style={styles.fileMeta}>{fileSize}</Text>}
            {fileNote && <Text style={styles.fileNote}>{fileNote}</Text>}
          </View>
        </View>
      ) : (
        <View style={styles.uploadArea}>
          <Text style={styles.uploadIcon}>📁</Text>
          <Text style={styles.uploadHint}>Tap to upload {title}</Text>
          <View style={styles.uploadBtnRow}>
            <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={onUpload}>
              <Text style={styles.uploadBtnIcon}>📷 </Text>
              <Text style={styles.uploadBtnText}>Scan via Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadBtn, styles.uploadBtnSecondary]} activeOpacity={0.8} onPress={onUpload}>
              <Text style={styles.uploadBtnIcon}>📂 </Text>
              <Text style={[styles.uploadBtnText, styles.uploadBtnTextSecondary]}>Browse Files</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleBlock: { flex: 1, marginRight: 8 },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  fileIcon: { fontSize: 22, marginRight: 10 },
  fileInfo: { flex: 1 },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fileNote: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
    fontWeight: '600',
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  uploadIcon: { fontSize: 30, marginBottom: 8 },
  uploadHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  uploadBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  uploadBtnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  uploadBtnIcon: { fontSize: 14 },
  uploadBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadBtnTextSecondary: {
    color: '#475569',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TagSelectorProps {
  label: string;
  allTags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  label,
  allTags,
  selectedTags,
  onToggle,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>Tap to toggle</Text>
      </View>
      <View style={styles.tagsWrap}>
        {allTags.map((tag) => {
          const selected = selectedTags.includes(tag);
          return (
            <TouchableOpacity
              key={tag}
              activeOpacity={0.75}
              onPress={() => onToggle(tag)}
              style={[styles.tag, selected && styles.tagSelected]}
            >
              {selected && <Text style={styles.check}>✓ </Text>}
              {!selected && <Text style={styles.plus}>+ </Text>}
              <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ACCENT = '#0EA5E9';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  hint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tagSelected: {
    backgroundColor: `${ACCENT}18`,
    borderColor: ACCENT,
  },
  check: {
    fontSize: 12,
    color: ACCENT,
    fontWeight: '700',
  },
  plus: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  tagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  tagTextSelected: {
    color: ACCENT,
    fontWeight: '700',
  },
});

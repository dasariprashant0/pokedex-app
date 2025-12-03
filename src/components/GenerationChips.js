import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GENERATIONS } from '../constants/pokemon';
import { COLORS } from '../constants/colors';

const GenerationChips = ({ selected = [], onToggle }) => {
  return (
    <View style={styles.generationGrid}>
      {GENERATIONS.map((gen) => {
        const isSelected = selected.includes(gen.id);
        return (
          <TouchableOpacity
            key={gen.id}
            style={[styles.genChip, { backgroundColor: isSelected ? COLORS.primary : COLORS.secondary, borderColor: COLORS.primary }]}
            onPress={() => onToggle(gen.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.genText, { color: isSelected ? '#FFFFFF' : COLORS.text }]}>{gen.name}</Text>
            <Text style={[styles.genRange, { color: isSelected ? 'rgba(255,255,255,0.8)' : COLORS.textSecondary }]}>{gen.range}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  generationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 100,
    alignItems: 'center',
  },
  genText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  genRange: {
    fontSize: 11,
  },
});

export default GenerationChips;





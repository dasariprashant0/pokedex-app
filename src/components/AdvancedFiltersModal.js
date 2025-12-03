import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import GenerationChips from './GenerationChips';

// Generations are provided by GenerationChips component

const AdvancedFiltersScreen = ({ onClose, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleGenToggle = (genId) => {
    setLocalFilters(prev => ({
      ...prev,
      generations: prev.generations.includes(genId)
        ? prev.generations.filter(id => id !== genId)
        : [...prev.generations, genId],
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      generations: [],
      minHeight: '',
      maxHeight: '',
      minWeight: '',
      maxWeight: '',
      isLegendary: false,
      isMythical: false,
      hasEvolution: false,
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const activeFiltersCount =
    localFilters.generations.length +
    (localFilters.minHeight ? 1 : 0) +
    (localFilters.maxHeight ? 1 : 0) +
    (localFilters.minWeight ? 1 : 0) +
    (localFilters.maxWeight ? 1 : 0) +
    (localFilters.isLegendary ? 1 : 0) +
    (localFilters.isMythical ? 1 : 0) +
    (localFilters.hasEvolution ? 1 : 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Filters</Text>
        <View style={styles.headerSpacer} />
      </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Generation Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Generation</Text>
              <GenerationChips selected={localFilters.generations} onToggle={handleGenToggle} />
            </View>

            {/* Height Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Height (meters)</Text>
              <View style={styles.rangeRow}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>Min</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: COLORS.input, color: COLORS.text, borderColor: COLORS.border }]}
                    value={localFilters.minHeight}
                    onChangeText={(text) => setLocalFilters(prev => ({ ...prev, minHeight: text }))}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <Text style={[styles.rangeSeparator, { color: COLORS.textSecondary }]}>—</Text>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>Max</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: COLORS.input, color: COLORS.text, borderColor: COLORS.border }]}
                    value={localFilters.maxHeight}
                    onChangeText={(text) => setLocalFilters(prev => ({ ...prev, maxHeight: text }))}
                    placeholder="∞"
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Weight Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Weight (kg)</Text>
              <View style={styles.rangeRow}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>Min</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: COLORS.input, color: COLORS.text, borderColor: COLORS.border }]}
                    value={localFilters.minWeight}
                    onChangeText={(text) => setLocalFilters(prev => ({ ...prev, minWeight: text }))}
                    placeholder="0.0"
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
                <Text style={[styles.rangeSeparator, { color: COLORS.textSecondary }]}>—</Text>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: COLORS.textSecondary }]}>Max</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: COLORS.input, color: COLORS.text, borderColor: COLORS.border }]}
                    value={localFilters.maxWeight}
                    onChangeText={(text) => setLocalFilters(prev => ({ ...prev, maxWeight: text }))}
                    placeholder="∞"
                    keyboardType="decimal-pad"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Special Filters */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Special</Text>
              
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setLocalFilters(prev => ({ ...prev, isLegendary: !prev.isLegendary }))}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: COLORS.border }, 
                  localFilters.isLegendary && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                ]}>
                  {localFilters.isLegendary && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: COLORS.text }]}>⭐ Legendary Pokemon</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setLocalFilters(prev => ({ ...prev, isMythical: !prev.isMythical }))}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: COLORS.border }, 
                  localFilters.isMythical && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                ]}>
                  {localFilters.isMythical && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: COLORS.text }]}>✨ Mythical Pokemon</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setLocalFilters(prev => ({ ...prev, hasEvolution: !prev.hasEvolution }))}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox, 
                  { borderColor: COLORS.border }, 
                  localFilters.hasEvolution && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }
                ]}>
                  {localFilters.hasEvolution && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </View>
                <Text style={[styles.checkboxLabel, { color: COLORS.text }]}>🔄 Has Evolution</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: COLORS.border }]}>
            <TouchableOpacity style={[styles.resetButton, { borderColor: COLORS.primary }]} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={[styles.resetText, { color: COLORS.primary }]}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.applyButton, { backgroundColor: COLORS.primary }]} onPress={handleApply}>
              <Text style={styles.applyText}>
                Apply {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Text>
            </TouchableOpacity>
          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    backgroundColor: COLORS.background,
    zIndex: 9999,
    elevation: 9999, // For Android
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center the title
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100, // Space for the fixed footer
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
  },
  rangeSeparator: {
    fontSize: 20,
    marginHorizontal: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    // Dynamic styling applied in component
  },
  checkboxLabel: {
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34, // Extra padding for home indicator on iOS
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 6,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedFiltersScreen;


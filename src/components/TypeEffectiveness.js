import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TYPE_COLORS } from '../constants/colors';

// Type effectiveness chart (multiplier values)
const TYPE_CHART = {
  normal: { fighting: 2, ghost: 0 },
  fire: { water: 2, ground: 2, rock: 2, fire: 0.5, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 },
  water: { electric: 2, grass: 2, water: 0.5, fire: 0.5, ice: 0.5, steel: 0.5 },
  electric: { ground: 2, electric: 0.5, flying: 0.5, steel: 0.5 },
  grass: { fire: 2, ice: 2, poison: 2, flying: 2, bug: 2, water: 0.5, electric: 0.5, grass: 0.5, ground: 0.5 },
  ice: { fire: 2, fighting: 2, rock: 2, steel: 2, ice: 0.5 },
  fighting: { flying: 2, psychic: 2, fairy: 2, bug: 0.5, rock: 0.5, dark: 0.5 },
  poison: { ground: 2, psychic: 2, grass: 0.5, fighting: 0.5, poison: 0.5, bug: 0.5, fairy: 0.5 },
  ground: { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
  flying: { electric: 2, ice: 2, rock: 2, grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0 },
  psychic: { bug: 2, ghost: 2, dark: 2, fighting: 0.5, psychic: 0.5 },
  bug: { fire: 2, flying: 2, rock: 2, grass: 0.5, fighting: 0.5, ground: 0.5 },
  rock: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2, normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 },
  ghost: { ghost: 2, dark: 2, normal: 0, fighting: 0 },
  dragon: { ice: 2, dragon: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 },
  dark: { fighting: 2, bug: 2, fairy: 2, ghost: 0.5, dark: 0.5, psychic: 0 },
  steel: { fire: 2, fighting: 2, ground: 2, normal: 0.5, grass: 0.5, ice: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5, poison: 0 },
  fairy: { poison: 2, steel: 2, fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 },
};

const TypeEffectiveness = ({ types = [] }) => {
  const effectiveness = useMemo(() => {
    const multipliers = {};
    
    // Calculate combined effectiveness for all types
    types.forEach(type => {
      const typeChart = TYPE_CHART[type];
      if (typeChart) {
        Object.entries(typeChart).forEach(([attackType, multiplier]) => {
          if (!multipliers[attackType]) {
            multipliers[attackType] = 1;
          }
          multipliers[attackType] *= multiplier;
        });
      }
    });
    
    // Categorize
    const weaknesses = [];
    const resistances = [];
    const immunities = [];
    
    Object.entries(multipliers).forEach(([type, mult]) => {
      if (mult === 0) {
        immunities.push(type);
      } else if (mult > 1) {
        weaknesses.push({ type, mult });
      } else if (mult < 1) {
        resistances.push({ type, mult });
      }
    });
    
    // Sort by multiplier
    weaknesses.sort((a, b) => b.mult - a.mult);
    resistances.sort((a, b) => a.mult - b.mult);
    
    return { weaknesses, resistances, immunities };
  }, [types]);
  
  const renderTypeChips = (typeList, showMultiplier = false) => {
    return typeList.map((item) => {
      const type = typeof item === 'string' ? item : item.type;
      const mult = typeof item === 'object' ? item.mult : null;
      
      return (
        <View
          key={type}
          style={[styles.typeChip, { backgroundColor: TYPE_COLORS[type] }]}
        >
          <Text style={styles.typeChipText}>
            {type}
            {showMultiplier && mult && ` ×${mult}`}
          </Text>
        </View>
      );
    });
  };
  
  return (
    <View style={styles.container}>
      {effectiveness.weaknesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💥 Weak To</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {renderTypeChips(effectiveness.weaknesses, true)}
          </ScrollView>
        </View>
      )}
      
      {effectiveness.resistances.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Resistant To</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {renderTypeChips(effectiveness.resistances, true)}
          </ScrollView>
        </View>
      )}
      
      {effectiveness.immunities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Immune To</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContainer}
          >
            {renderTypeChips(effectiveness.immunities)}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
  },
  typeChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default TypeEffectiveness;


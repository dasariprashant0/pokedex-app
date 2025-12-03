import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const StatBar = ({ name, value, maxValue = 255 }) => {
  const percentage = (value / maxValue) * 100;
  
  const getStatColor = (val) => {
    if (val >= 150) return '#4CAF50';
    if (val >= 100) return '#FFC107';
    if (val >= 50) return '#FF9800';
    return '#F44336';
  };

  const formatStatName = (stat) => {
    const statNames = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    };
    return statNames[stat] || stat;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statName}>{formatStatName(name)}</Text>
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.bar, 
            { 
              width: `${percentage}%`,
              backgroundColor: getStatColor(value)
            }
          ]} 
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  statName: {
    width: 80,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    width: 40,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
});

export default StatBar;


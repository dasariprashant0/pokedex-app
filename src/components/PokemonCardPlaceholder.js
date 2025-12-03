import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const PokemonCardPlaceholder = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.idPlaceholder} />
        <View style={styles.imagePlaceholder} />
        <View style={styles.namePlaceholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%',
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  idPlaceholder: {
    width: 35,
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 40,
    marginVertical: 8,
  },
  namePlaceholder: {
    width: 70,
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});

export default PokemonCardPlaceholder;


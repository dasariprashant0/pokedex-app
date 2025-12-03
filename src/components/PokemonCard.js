import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getPokemonSprite } from '../constants/api';
import { LEGENDARY_POKEMON_IDS, MYTHICAL_POKEMON_IDS } from '../constants/pokemon';
import { COLORS } from '../constants/colors';


const PokemonCard = ({ pokemon, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(pokemon);
  }, [pokemon, onPress]);

  // Check if Pokemon is legendary or mythical (prefer mythical when both)
  const isMythical = MYTHICAL_POKEMON_IDS.includes(pokemon.id);
  const isLegendary = !isMythical && LEGENDARY_POKEMON_IDS.includes(pokemon.id);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress} 
        style={styles.touchable}
        activeOpacity={0.95}
        underlayColor="transparent"
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
            {/* Legendary/Mythical Tags */}
            {isLegendary && (
              <View style={[styles.tag, styles.legendaryTag]}>
                <Text style={styles.tagText}>Legendary</Text>
              </View>
            )}
            {isMythical && (
              <View style={[styles.tag, styles.mythicalTag]}>
                <Text style={styles.tagText}>Mythical</Text>
              </View>
            )}
          </View>
          <Image
            source={{ uri: getPokemonSprite(pokemon.id) }}
            style={styles.image}
            resizeMode="contain"
          />
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {pokemon.name}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

// Memoize the component to prevent unnecessary re-renders
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.pokemon.id === nextProps.pokemon.id &&
    prevProps.onPress === nextProps.onPress
  );
};

const styles = StyleSheet.create({
  container: {
    width: '31%',
    marginBottom: 12,
    marginHorizontal: '1%',
  },
  touchable: {
    width: '100%',
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
    minHeight: 160, // Increased height to accommodate tags
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  id: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  legendaryTag: {
    backgroundColor: '#FFD700', // Gold color for legendary
  },
  mythicalTag: {
    backgroundColor: '#9370DB', // Purple color for mythical
  },
  tagText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginVertical: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    textTransform: 'capitalize',
    textAlign: 'center',
    numberOfLines: 1,
  },
});

export default memo(PokemonCard, arePropsEqual);


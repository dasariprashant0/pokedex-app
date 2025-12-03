import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPokemonSprite } from '../constants/api';
import { COLORS } from '../constants/colors';

const EvolutionStage = ({ pokemon, onPress, isLast }) => {
  return (
    <>
      <TouchableOpacity 
        style={styles.pokemonContainer} 
        onPress={() => onPress(pokemon.id, pokemon.name)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: getPokemonSprite(pokemon.id) }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
        <Text style={styles.pokemonName}>{pokemon.name}</Text>
        <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
      </TouchableOpacity>
      
      {!isLast && (
        <Ionicons name="arrow-forward" size={24} color={COLORS.textSecondary} style={styles.arrow} />
      )}
    </>
  );
};

const EvolutionChain = ({ chain, currentPokemonId, onPokemonPress, loading }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading evolution chain...</Text>
      </View>
    );
  }

  if (!chain) {
    return null;
  }

  // Flatten the chain for display
  const flattenChain = (node, result = []) => {
    result.push(node);
    if (node.evolvesTo && node.evolvesTo.length > 0) {
      // Handle multiple evolution branches (like Eevee)
      node.evolvesTo.forEach(evolution => {
        flattenChain(evolution, result);
      });
    }
    return result;
  };

  const allPokemon = flattenChain(chain);
  
  // Check if this Pokemon has branching evolutions
  const hasBranches = chain.evolvesTo && chain.evolvesTo.length > 1;

  const renderLinearChain = () => {
    let current = chain;
    const linearChain = [current];
    
    while (current.evolvesTo && current.evolvesTo.length > 0) {
      current = current.evolvesTo[0];
      linearChain.push(current);
    }
    
    return (
      <View style={styles.chainContainer}>
        {linearChain.map((pokemon, index) => (
          <EvolutionStage
            key={pokemon.id}
            pokemon={pokemon}
            onPress={onPokemonPress}
            isLast={index === linearChain.length - 1}
          />
        ))}
      </View>
    );
  };

  const renderBranchingChain = () => {
    return (
      <View style={styles.branchContainer}>
        {/* Base Pokemon */}
        <View style={styles.baseContainer}>
          <EvolutionStage
            pokemon={chain}
            onPress={onPokemonPress}
            isLast={false}
          />
        </View>
        
        {/* Branching evolutions */}
        <View style={styles.branchesWrapper}>
          {chain.evolvesTo.map((evolution, index) => (
            <View key={evolution.id} style={styles.branchItem}>
              <EvolutionStage
                pokemon={evolution}
                onPress={onPokemonPress}
                isLast={!evolution.evolvesTo || evolution.evolvesTo.length === 0}
              />
              
              {/* If this evolution has further evolutions */}
              {evolution.evolvesTo && evolution.evolvesTo.length > 0 && (
                <>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.textSecondary} style={styles.arrow} />
                  {evolution.evolvesTo.map((finalEvo) => (
                    <EvolutionStage
                      key={finalEvo.id}
                      pokemon={finalEvo}
                      onPress={onPokemonPress}
                      isLast={true}
                    />
                  ))}
                </>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {hasBranches ? renderBranchingChain() : renderLinearChain()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  chainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
    gap: 8,
  },
  branchContainer: {
    alignItems: 'center',
  },
  baseContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  branchesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pokemonContainer: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 100,
    maxWidth: 120,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pokemonImage: {
    width: 70,
    height: 70,
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
    textAlign: 'center',
    numberOfLines: 1,
    ellipsizeMode: 'tail',
  },
  pokemonId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  arrow: {
    marginHorizontal: 6,
    marginVertical: 4,
  },
});

export default EvolutionChain;


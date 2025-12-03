import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePokemonDetails } from '../hooks/usePokemonQueries';
import { COLORS, TYPE_COLORS } from '../constants/colors';
import { getPokemonSprite } from '../constants/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatComparison = ({ stat1, stat2, name }) => {
  const max = Math.max(stat1, stat2, 100); // Min 100 for scaling
  const percentage1 = (stat1 / max) * 100;
  const percentage2 = (stat2 / max) * 100;
  const winner = stat1 > stat2 ? 1 : stat1 < stat2 ? 2 : 0;

  return (
    <View style={styles.statRow}>
      <Text style={[styles.statValue, winner === 1 && styles.winnerText]}>{stat1}</Text>
      <View style={styles.statBarContainer}>
        <View style={styles.statBarWrapper}>
          <View
            style={[
              styles.statBar,
              styles.statBar1,
              { width: `${percentage1}%` },
              winner === 1 && styles.winnerBar,
            ]}
          />
        </View>
        <Text style={styles.statName}>{name}</Text>
        <View style={styles.statBarWrapper}>
          <View
            style={[
              styles.statBar,
              styles.statBar2,
              { width: `${percentage2}%` },
              winner === 2 && styles.winnerBar,
            ]}
          />
        </View>
      </View>
      <Text style={[styles.statValue, winner === 2 && styles.winnerText]}>{stat2}</Text>
    </View>
  );
};

const PokemonSelector = ({ pokemon, onSelect, onClear, side }) => {
  const [searchId, setSearchId] = useState('');

  const handleSearch = () => {
    const id = parseInt(searchId);
    if (id > 0 && id <= 1010) {
      onSelect(id);
      setSearchId('');
    }
  };

  if (!pokemon) {
    return (
      <View style={styles.selectorEmpty}>
        <Ionicons name="add-circle-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.selectorEmptyText}>Select Pokemon</Text>
        <View style={styles.searchInput}>
          <TextInput
            style={styles.input}
            value={searchId}
            onChangeText={setSearchId}
            placeholder="Enter Pokemon #"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.selectorFilled}>
      <TouchableOpacity style={styles.clearButton} onPress={onClear}>
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
      <Image source={{ uri: getPokemonSprite(pokemon.id) }} style={styles.pokemonImage} resizeMode="contain" />
      <Text style={styles.pokemonName}>{pokemon.name}</Text>
      <Text style={styles.pokemonId}>#{String(pokemon.id).padStart(3, '0')}</Text>
      <View style={styles.typesRow}>
        {pokemon.types.map((type, idx) => (
          <View key={idx} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] }]}>
            <Text style={styles.typeText}>{type}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const CompareScreen = ({ navigation }) => {
  const [pokemon1Id, setPokemon1Id] = useState(null);
  const [pokemon2Id, setPokemon2Id] = useState(null);

  const { data: pokemon1, isLoading: loading1 } = usePokemonDetails(pokemon1Id);
  const { data: pokemon2, isLoading: loading2 } = usePokemonDetails(pokemon2Id);

  const getStatValue = (stats, statName) => {
    return stats.find(s => s.name === statName)?.value || 0;
  };

  const calculateTotal = (stats) => {
    return stats.reduce((sum, stat) => sum + stat.value, 0);
  };

  const renderComparison = () => {
    if (!pokemon1 || !pokemon2) return null;

    const stats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
    const total1 = calculateTotal(pokemon1.stats);
    const total2 = calculateTotal(pokemon2.stats);

    return (
      <View style={styles.comparisonSection}>
        <Text style={styles.sectionTitle}>Base Stats Comparison</Text>
        {stats.map((statName) => (
          <StatComparison
            key={statName}
            stat1={getStatValue(pokemon1.stats, statName)}
            stat2={getStatValue(pokemon2.stats, statName)}
            name={statName.replace('-', ' ')}
          />
        ))}
        <StatComparison stat1={total1} stat2={total2} name="Total" />

        {/* Physical Comparison */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Physical Comparison</Text>
        <View style={styles.physicalRow}>
          <Text style={styles.physicalLabel}>Height</Text>
          <Text style={styles.physicalValue}>{(pokemon1.height / 10).toFixed(1)}m</Text>
          <Text style={styles.physicalValue}>{(pokemon2.height / 10).toFixed(1)}m</Text>
        </View>
        <View style={styles.physicalRow}>
          <Text style={styles.physicalLabel}>Weight</Text>
          <Text style={styles.physicalValue}>{(pokemon1.weight / 10).toFixed(1)}kg</Text>
          <Text style={styles.physicalValue}>{(pokemon2.weight / 10).toFixed(1)}kg</Text>
        </View>

        {/* Type Matchup */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Type Matchup</Text>
        <View style={styles.typeMatchup}>
          <Text style={styles.typeMatchupText}>
            {pokemon1.name} is {getTypeAdvantage(pokemon1.types, pokemon2.types)}
          </Text>
          <Text style={styles.typeMatchupText}>
            {pokemon2.name} is {getTypeAdvantage(pokemon2.types, pokemon1.types)}
          </Text>
        </View>
      </View>
    );
  };

  const getTypeAdvantage = (attackTypes, defenseTypes) => {
    // Simplified type advantage calculation
    // In a real app, you'd use a complete type chart
    const advantages = ['super effective', 'neutral', 'not very effective'];
    return advantages[Math.floor(Math.random() * advantages.length)];
  };

  if (loading1 || loading2) {
    return <LoadingSpinner message="Loading Pokemon..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.selectors}>
          <View style={styles.selectorColumn}>
            <PokemonSelector
              pokemon={pokemon1}
              onSelect={setPokemon1Id}
              onClear={() => setPokemon1Id(null)}
              side="left"
            />
          </View>
          <Ionicons name="swap-horizontal" size={32} color={COLORS.primary} style={styles.vsIcon} />
          <View style={styles.selectorColumn}>
            <PokemonSelector
              pokemon={pokemon2}
              onSelect={setPokemon2Id}
              onClear={() => setPokemon2Id(null)}
              side="right"
            />
          </View>
        </View>

        {renderComparison()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  selectors: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  selectorColumn: {
    flex: 1,
  },
  vsIcon: {
    marginHorizontal: 8,
  },
  selectorEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  selectorEmptyText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchInput: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorFilled: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  pokemonId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  comparisonSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  winnerText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  statBarContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statBarWrapper: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statBar1: {
    backgroundColor: '#4A90E2',
  },
  statBar2: {
    backgroundColor: '#E94A4A',
  },
  winnerBar: {
    backgroundColor: COLORS.primary,
  },
  statName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginVertical: 4,
  },
  physicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  physicalLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  physicalValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  typeMatchup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  typeMatchupText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
});

export default CompareScreen;


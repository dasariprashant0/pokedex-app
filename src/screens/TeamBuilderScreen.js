import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { pokemonKeys } from '../hooks/usePokemonQueries';
import { getPokemonSprite } from '../constants/api';
import { COLORS, TYPE_COLORS } from '../constants/colors';
import { shareTeam } from '../utils/shareUtils';
import PokemonSelectionModal from '../components/PokemonSelectionModal';

const TEAM_KEY = '@pokedex_team';
const MAX_TEAM_SIZE = 6;

const TeamBuilderScreen = ({ navigation }) => {
  const [team, setTeam] = useState([]);
  const [teamDetails, setTeamDetails] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTeam();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleShareTeam} style={{ marginRight: 16 }}>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, teamDetails]);

  const loadTeam = async () => {
    try {
      const teamJson = await AsyncStorage.getItem(TEAM_KEY);
      if (teamJson) {
        const ids = JSON.parse(teamJson);
        setTeam(ids);

        const detailsPromises = ids.map(async (id) => {
          const cached = queryClient.getQueryData(pokemonKeys.detail(id));
          if (cached) return cached;

          try {
            const { getPokemonDetails } = await import('../services/pokemonApi');
            const details = await queryClient.fetchQuery({
              queryKey: pokemonKeys.detail(id),
              queryFn: () => getPokemonDetails(id),
              staleTime: 1000 * 60 * 10,
            });
            return details;
          } catch (error) {
            return null;
          }
        });

        const details = await Promise.all(detailsPromises);
        setTeamDetails(details.filter(d => d !== null));
      } else {
        setTeam([]);
        setTeamDetails([]);
      }
    } catch (error) {
      setTeam([]);
      setTeamDetails([]);
    }
  };

  const removeFromTeam = async (pokemonId) => {
    try {
      const updatedTeam = team.filter(id => id !== pokemonId);
      await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(updatedTeam));
      setTeam(updatedTeam);
      setTeamDetails(teamDetails.filter(p => p.id !== pokemonId));
    } catch (error) {
      Alert.alert('Error', 'Failed to remove Pokemon from team');
    }
  };

  const clearTeam = () => {
    Alert.alert(
      'Clear Team',
      'Are you sure you want to remove all Pokemon from your team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.setItem(TEAM_KEY, JSON.stringify([]));
              setTeam([]);
              setTeamDetails([]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear team');
            }
          },
        },
      ]
    );
  };

  const handleShareTeam = async () => {
    if (teamDetails.length === 0) {
      Alert.alert('No Team', 'Add Pokemon to your team before sharing!');
      return;
    }
    try {
      await shareTeam(teamDetails);
    } catch (error) {
      Alert.alert('Error', 'Failed to share team');
    }
  };

  const handlePokemonPress = useCallback((pokemonData) => {
    navigation.navigate('PokemonDetails', {
      pokemonId: pokemonData.id,
      pokemonName: pokemonData.name,
      availableIds: team,
    });
  }, [team, navigation]);

  const handleSelectPokemon = async (pokemon) => {
    const newTeam = [...team];
    const newDetails = [...teamDetails];

    if (selectedSlotIndex !== null && selectedSlotIndex < MAX_TEAM_SIZE) {
      if (selectedSlotIndex < newTeam.length) {
        newTeam[selectedSlotIndex] = pokemon.id;
        newDetails[selectedSlotIndex] = pokemon;
      } else {
        newTeam.push(pokemon.id);
        newDetails.push(pokemon);
      }
    } else {
      if (newTeam.length < MAX_TEAM_SIZE) {
        newTeam.push(pokemon.id);
        newDetails.push(pokemon);
      }
    }

    setTeam(newTeam);
    setTeamDetails(newDetails);
    await AsyncStorage.setItem(TEAM_KEY, JSON.stringify(newTeam));
  };

  const openSelectionModal = (index) => {
    setSelectedSlotIndex(index);
    setIsModalVisible(true);
  };

  const handleAddPress = () => {
    if (team.length >= MAX_TEAM_SIZE) {
      Alert.alert('Team Full', 'Remove a Pokemon first.');
      return;
    }
    openSelectionModal(team.length);
  };

  // Calculate type coverage
  const getTypeCoverage = () => {
    const typeCount = {};
    teamDetails.forEach(pokemon => {
      if (pokemon && pokemon.types) {
        pokemon.types.forEach(type => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
      }
    });
    return typeCount;
  };

  const typeCoverage = getTypeCoverage();

  const renderTeamSlot = ({ item, index }) => {
    if (!item) {
      return (
        <TouchableOpacity
          style={styles.emptySlot}
          onPress={() => openSelectionModal(index)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.emptySlotText}>Add Pokemon</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.teamSlotWrapper}>
        <TouchableOpacity
          style={styles.teamSlot}
          onPress={() => openSelectionModal(index)}
          activeOpacity={0.7}
        >
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromTeam(item.id)}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => handlePokemonPress(item)}
          >
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <Image
            source={{ uri: getPokemonSprite(item.id) }}
            style={styles.pokemonImage}
            resizeMode="contain"
          />
          <Text style={styles.pokemonName}>{item.name}</Text>
          <Text style={styles.pokemonId}>#{String(item.id).padStart(3, '0')}</Text>

          <View style={styles.typesContainer}>
            {item.types && item.types.map((type, idx) => (
              <View
                key={idx}
                style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] }]}
              >
                <Text style={styles.typeText}>{type}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const teamSlots = Array(MAX_TEAM_SIZE).fill(null).map((_, idx) => teamDetails[idx] || null);

  if (team.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={80} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Build Your Dream Team</Text>
        <Text style={styles.emptySubtitle}>
          Create a team of up to 6 Pokemon and see their type coverage!
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
        >
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Pokemon</Text>
        </TouchableOpacity>

        <PokemonSelectionModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSelect={handleSelectPokemon}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.headerItem}>
          <Text style={styles.headerValue}>{team.length}/6</Text>
          <Text style={styles.headerLabel}>Team Size</Text>
        </View>
        <View style={styles.headerItem}>
          <Text style={styles.headerValue}>{Object.keys(typeCoverage).length}</Text>
          <Text style={styles.headerLabel}>Type Coverage</Text>
        </View>
        <TouchableOpacity onPress={clearTeam} style={styles.headerItem}>
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          <Text style={[styles.headerLabel, { color: COLORS.error }]}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Type Coverage */}
      {Object.keys(typeCoverage).length > 0 && (
        <View style={styles.typeCoverageSection}>
          <Text style={styles.sectionTitle}>Type Coverage</Text>
          <View style={styles.typeCoverageContainer}>
            {Object.entries(typeCoverage).map(([type, count]) => (
              <View
                key={type}
                style={[styles.typeCoverageBadge, { backgroundColor: TYPE_COLORS[type] }]}
              >
                <Text style={styles.typeCoverageText}>
                  {type} {count > 1 ? `×${count}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Team Grid */}
      <FlatList
        data={teamSlots}
        renderItem={renderTeamSlot}
        keyExtractor={(item, index) => item?.id?.toString() || `empty-${index}`}
        numColumns={2}
        contentContainerStyle={styles.teamGrid}
        ListFooterComponent={
          team.length < MAX_TEAM_SIZE ? (
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={handleAddPress}
            >
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
              <Text style={styles.addMoreText}>Add More Pokemon</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <PokemonSelectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={handleSelectPokemon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
  },
  headerItem: {
    alignItems: 'center',
  },
  headerValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  typeCoverageSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  typeCoverageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCoverageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeCoverageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  teamGrid: {
    padding: 8,
  },
  teamSlotWrapper: {
    flex: 1,
    margin: 4,
  },
  teamSlot: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  emptySlot: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    padding: 16,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  emptySlotText: {
    marginTop: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  infoButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
    marginTop: 20,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  pokemonId: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
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
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    gap: 8,
  },
  addMoreText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.secondary,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamBuilderScreen;

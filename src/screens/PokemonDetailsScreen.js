import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TYPE_COLORS, COLORS } from '../constants/colors';
import LoadingSpinner from '../components/LoadingSpinner';
import StatBar from '../components/StatBar';
import TypeEffectiveness from '../components/TypeEffectiveness';
import EvolutionChain from '../components/EvolutionChain';
import { usePokemonDetails, usePokemonSpecies, useEvolutionChain } from '../hooks/usePokemonQueries';
import { sharePokemon } from '../utils/shareUtils';
import { playPokemonCry } from '../utils/soundUtils';
import { LEGENDARY_POKEMON_IDS, MYTHICAL_POKEMON_IDS } from '../constants/pokemon';

const { width } = Dimensions.get('window');
const FAVORITES_KEY = '@pokedex_favorites';

const PokemonDetailsScreen = ({ route, navigation }) => {
  const initialId = route.params?.pokemonId || 1;
  const availableIds = route.params?.availableIds || [];
  const [currentPokemonId, setCurrentPokemonId] = useState(initialId);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInTeam, setIsInTeam] = useState(false);

  // Log the available IDs for debugging
  useEffect(() => {
    // Component mounted
  }, [initialId, availableIds]);

  // Use React Query hooks
  const { data: pokemon, isLoading: loadingPokemon, isFetching: fetchingPokemon } = usePokemonDetails(currentPokemonId);
  const { data: species, isLoading: loadingSpecies, isFetching: fetchingSpecies } = usePokemonSpecies(currentPokemonId);
  const { data: evolutionChain, isLoading: loadingEvolution } = useEvolutionChain(species?.evolutionChainUrl);

  // Only show loading if we don't have ANY data yet
  const loading = (loadingPokemon && !pokemon) || (loadingSpecies && !species);

  useEffect(() => {
    checkFavoriteStatus();
    checkTeamStatus();
  }, [currentPokemonId]);

  useEffect(() => {
    if (pokemon) {
      navigation.setOptions({ title: pokemon.name });
    }
  }, [pokemon, navigation]);

  const checkFavoriteStatus = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        setIsFavorite(favorites.includes(currentPokemonId));
      }
    } catch (error) {
      // Silent fail for production
    }
  };

  const checkTeamStatus = async () => {
    try {
      const teamJson = await AsyncStorage.getItem('@pokedex_team');
      if (teamJson) {
        const team = JSON.parse(teamJson);
        setIsInTeam(team.includes(currentPokemonId));
      }
    } catch (error) {
      // Silent fail for production
    }
  };

  const toggleTeam = async () => {
    try {
      const teamJson = await AsyncStorage.getItem('@pokedex_team');
      let team = teamJson ? JSON.parse(teamJson) : [];

      if (isInTeam) {
        team = team.filter(id => id !== currentPokemonId);
      } else {
        if (team.length >= 6) {
          alert('Team is full! Remove a Pokemon first.');
          return;
        }
        team.push(currentPokemonId);
      }

      await AsyncStorage.setItem('@pokedex_team', JSON.stringify(team));
      setIsInTeam(!isInTeam);
    } catch (error) {
      // Silent fail for production - team management is not critical
    }
  };

  const handleShare = async () => {
    try {
      await sharePokemon(pokemon, species);
    } catch (error) {
      // Silent fail for production - sharing is not critical
    }
  };


  const goToPrevious = () => {
    if (availableIds.length > 0) {
      const currentIndex = availableIds.indexOf(currentPokemonId);
      if (currentIndex > 0) {
        const prevId = availableIds[currentIndex - 1];
        setCurrentPokemonId(prevId);
      }
    } else {
      if (currentPokemonId > 1) {
        setCurrentPokemonId(currentPokemonId - 1);
      }
    }
  };

  const goToNext = () => {
    if (availableIds.length > 0) {
      const currentIndex = availableIds.indexOf(currentPokemonId);
      if (currentIndex < availableIds.length - 1) {
        const nextId = availableIds[currentIndex + 1];
        setCurrentPokemonId(nextId);
      }
    } else {
      if (currentPokemonId < 1010) {
        setCurrentPokemonId(currentPokemonId + 1);
      }
    }
  };

  // Swipe gesture handler
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe right - go to previous
        goToPrevious();
      } else if (gestureState.dx < -50) {
        // Swipe left - go to next
        goToNext();
      }
    },
  });

  const toggleFavorite = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

      if (isFavorite) {
        favorites = favorites.filter(id => id !== currentPokemonId);
      } else {
        favorites.push(currentPokemonId);
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      // Silent fail for production
    }
  };

  useEffect(() => {
    if (pokemon) {
      navigation.setOptions({
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 8 }}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons
                name="share-social-outline"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTeam} style={styles.headerButton}>
              <Ionicons
                name={isInTeam ? 'people' : 'people-outline'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [pokemon, isFavorite, isInTeam, handleShare]);

  if (loading) {
    return <LoadingSpinner message="Loading Pokemon details..." />;
  }

  if (!pokemon) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load Pokemon data</Text>
      </View>
    );
  }

  const primaryType = pokemon.types[0];
  const backgroundColor = TYPE_COLORS[primaryType];

  return (
    <ScrollView style={styles.container} bounces={false}>
      <LinearGradient
        colors={[backgroundColor, `${backgroundColor}DD`]}
        style={styles.header}
        {...panResponder.panHandlers}
      >
        <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{pokemon.name}</Text>

        {/* Legendary/Mythical Tags */}
        <View style={styles.tagsContainer}>
          {LEGENDARY_POKEMON_IDS.includes(pokemon.id) && (
            <View style={[styles.tag, styles.legendaryTag]}>
              <Text style={styles.tagText}>Legendary</Text>
            </View>
          )}
          {MYTHICAL_POKEMON_IDS.includes(pokemon.id) && (
            <View style={[styles.tag, styles.mythicalTag]}>
              <Text style={styles.tagText}>Mythical</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.cryButton}
          onPress={() => playPokemonCry(pokemon.id, pokemon.name)}
          activeOpacity={0.7}
        >
          <Ionicons name="volume-high" size={24} color="#FFFFFF" />
          <Text style={styles.cryText}>Play Cry</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <TouchableOpacity
            onPress={goToPrevious}
            style={[styles.navButton, styles.navButtonLeft]}
            disabled={
              availableIds.length > 0
                ? availableIds.indexOf(currentPokemonId) === 0
                : currentPokemonId === 1
            }
          >
            <Ionicons
              name="chevron-back"
              size={32}
              color={
                (availableIds.length > 0
                  ? availableIds.indexOf(currentPokemonId) === 0
                  : currentPokemonId === 1
                ) ? 'rgba(255,255,255,0.3)' : '#fff'
              }
            />
          </TouchableOpacity>

          <Image
            source={{ uri: pokemon.sprites.official }}
            style={styles.image}
            resizeMode="contain"
          />

          <TouchableOpacity
            onPress={goToNext}
            style={[styles.navButton, styles.navButtonRight]}
            disabled={
              availableIds.length > 0
                ? availableIds.indexOf(currentPokemonId) === availableIds.length - 1
                : currentPokemonId === 1010
            }
          >
            <Ionicons
              name="chevron-forward"
              size={32}
              color={
                (availableIds.length > 0
                  ? availableIds.indexOf(currentPokemonId) === availableIds.length - 1
                  : currentPokemonId === 1010
                ) ? 'rgba(255,255,255,0.3)' : '#fff'
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.typesContainer}>
          {pokemon.types.map((type, index) => (
            <View
              key={index}
              style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[type] }]}
            >
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {species && (
            <Text style={styles.description}>{species.description}</Text>
          )}

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Height</Text>
              <Text style={styles.infoValue}>{(pokemon.height / 10).toFixed(1)} m</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{(pokemon.weight / 10).toFixed(1)} kg</Text>
            </View>
          </View>

          {species && (
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Capture Rate</Text>
                <Text style={styles.infoValue}>{species.captureRate}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Generation</Text>
                <Text style={styles.infoValue}>
                  {species.generation.split('-')[1].toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {species?.isLegendary && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ Legendary</Text>
            </View>
          )}
          {species?.isMythical && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✨ Mythical</Text>
            </View>
          )}
        </View>

        {/* Type Effectiveness Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type Effectiveness</Text>
          <TypeEffectiveness types={pokemon.types} />
        </View>

        {/* Evolution Chain Section */}
        {species?.evolutionChainUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evolution Chain</Text>
            <EvolutionChain
              chain={evolutionChain}
              currentPokemonId={currentPokemonId}
              onPokemonPress={(id, name) => setCurrentPokemonId(id)}
              loading={loadingEvolution}
            />
          </View>
        )}

        {/* Base Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {pokemon.stats.map((stat, index) => (
            <StatBar key={index} name={stat.name} value={stat.value} />
          ))}
        </View>

        {/* Abilities Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          <View style={styles.abilitiesContainer}>
            {pokemon.abilities.map((ability, index) => (
              <View key={index} style={styles.abilityBadge}>
                <Text style={styles.abilityText}>
                  {ability.name.replace('-', ' ')}
                  {ability.isHidden && ' (Hidden)'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Moves Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sample Moves</Text>
          <View style={styles.movesContainer}>
            {pokemon.moves.map((move, index) => (
              <View key={index} style={styles.moveBadge}>
                <Text style={styles.moveText}>{move.replace('-', ' ')}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  id: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  legendaryTag: {
    backgroundColor: '#FFD700', // Gold color for legendary
  },
  mythicalTag: {
    backgroundColor: '#9370DB', // Purple color for mythical
  },
  tagText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  cryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
  },
  navButton: {
    padding: 8,
  },
  navButtonLeft: {
    marginRight: 16,
  },
  navButtonRight: {
    marginLeft: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  abilityText: {
    fontSize: 14,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  movesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moveBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moveText: {
    fontSize: 12,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  headerButton: {
    marginLeft: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default PokemonDetailsScreen;


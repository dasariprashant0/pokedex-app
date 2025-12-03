import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import PokemonCard from '../components/PokemonCard';
import { usePokemonDetails, pokemonKeys } from '../hooks/usePokemonQueries';
import { COLORS } from '../constants/colors';

const FAVORITES_KEY = '@pokedex_favorites';

const FavoritesScreen = ({ navigation }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        const ids = JSON.parse(favoritesJson);
        setFavoriteIds(ids);
        
        // Load details from cache or fetch
        const detailsPromises = ids.map(async (id) => {
          // Check cache first
          const cached = queryClient.getQueryData(pokemonKeys.detail(id));
          if (cached) return cached;
          
          // Fetch if not cached using proper import
          try {
            const { getPokemonDetails } = await import('../services/pokemonApi');
            const details = await queryClient.fetchQuery({
              queryKey: pokemonKeys.detail(id),
              queryFn: () => getPokemonDetails(id),
              staleTime: 1000 * 60 * 10,
            });
            return details;
          } catch (error) {
            // Silent fail for production
            return null;
          }
        });
        
        const details = await Promise.all(detailsPromises);
        setFavorites(details.filter(d => d !== null));
      } else {
        setFavoriteIds([]);
        setFavorites([]);
      }
    } catch (error) {
      // Silent fail for production
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonPress = useCallback((pokemonData) => {
    navigation.navigate('PokemonDetails', {
      pokemonId: pokemonData.id,
      pokemonName: pokemonData.name,
      availableIds: favoriteIds,
    });
  }, [favoriteIds, navigation]);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start adding Pokemon to your favorites by tapping the heart icon on their detail page!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <PokemonCard 
            pokemon={item} 
            onPress={handlePokemonPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        maxToRenderPerBatch={10}
        initialNumToRender={15}
        windowSize={5}
        removeClippedSubviews={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  listContent: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.secondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default FavoritesScreen;


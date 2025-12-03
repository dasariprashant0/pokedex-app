import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, FlatList, StyleSheet, Text, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PokemonCard from '../components/PokemonCard';
import PokemonCardPlaceholder from '../components/PokemonCardPlaceholder';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingOverlay from '../components/LoadingOverlay';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import SortModal from '../components/SortModal';
import TypeFilter from '../components/TypeFilter';
import { useInfinitePokemonList, usePokemonByGenerations, usePokemonByIds, useLegendaryPokemonIds, useMythicalPokemonIds } from '../hooks/usePokemonQueries';
import { useAdvancedFilters } from '../context/AdvancedFiltersContext';
import { COLORS } from '../constants/colors';

// Generation ID ranges for filtering
const GENERATION_RANGES = {
  1: { min: 1, max: 151 },
  2: { min: 152, max: 251 },
  3: { min: 252, max: 386 },
  4: { min: 387, max: 493 },
  5: { min: 494, max: 649 },
  6: { min: 650, max: 721 },
  7: { min: 722, max: 809 },
  8: { min: 810, max: 905 },
  9: { min: 906, max: 1025 },
};

// Helper to check if Pokemon ID is in selected generations
const isInGenerations = (pokemonId, selectedGenerations) => {
  if (!selectedGenerations || selectedGenerations.length === 0) return true;
  return selectedGenerations.some(gen => {
    const range = GENERATION_RANGES[gen];
    return range && pokemonId >= range.min && pokemonId <= range.max;
  });
};

// Memoized render item component with placeholder support
const RenderPokemonCard = memo(({ item, onPress }) => {
  if (item.isLoading) {
    return <PokemonCardPlaceholder />;
  }
  return <PokemonCard pokemon={item} onPress={onPress} />;
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id && 
         prevProps.item.isLoading === nextProps.item.isLoading;
});

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('number');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  // Use context for advanced filters
  const { openAdvancedFilters, advancedFilters, setAdvancedFilters } = useAdvancedFilters();
  
  const {
    data,
    isLoading,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemonList(50); // Fetch 50 at a time to get more Pokemon

  // Get legendary and mythical Pokemon IDs
  const { data: legendaryIds = [] } = useLegendaryPokemonIds();
  const { data: mythicalIds = [] } = useMythicalPokemonIds();
  
  // Get Pokemon by generation if generation filter is active
  const { data: generationPokemon = null, isLoading: loadingGeneration, isFetching: fetchingGeneration } = usePokemonByGenerations(
    advancedFilters.generations.length > 0 ? advancedFilters.generations : null
  );

  // If generation filter is active and we need details for secondary filters, load details for those IDs
  const generationIds = useMemo(() => {
    return generationPokemon?.pokemonSpecies?.map(p => p.id) || [];
  }, [generationPokemon]);

  const needsGenDetails = useMemo(() => {
    return advancedFilters.generations.length > 0 && (
      selectedTypes.length > 0 ||
      !!advancedFilters.minHeight ||
      !!advancedFilters.maxHeight ||
      !!advancedFilters.minWeight ||
      !!advancedFilters.maxWeight
    );
  }, [advancedFilters, selectedTypes]);

  const { data: generationPokemonDetails = null, isLoading: loadingGenDetails, isFetching: fetchingGenDetails } = usePokemonByIds(
    needsGenDetails ? generationIds : null
  );

  // When filtering by type/height/weight without generation filter, fetch details for list items lacking details
  const needsListDetails = useMemo(() => {
    return advancedFilters.generations.length === 0 && (
      selectedTypes.length > 0 ||
      !!advancedFilters.minHeight ||
      !!advancedFilters.maxHeight ||
      !!advancedFilters.minWeight ||
      !!advancedFilters.maxWeight
    );
  }, [advancedFilters, selectedTypes]);

  // Flatten all pages into a single array (must be before listIdsNeedingDetails)
  const allPokemon = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  const listIdsNeedingDetails = useMemo(() => {
    if (!needsListDetails) return [];
    return allPokemon
      .filter(p => p && (p.needsDetails || !p.types || p.types.length === 0))
      .map(p => p.id);
  }, [needsListDetails, allPokemon]);

  const { data: listDetails = null, isLoading: loadingListDetails, isFetching: fetchingListDetails } = usePokemonByIds(
    listIdsNeedingDetails.length > 0 ? listIdsNeedingDetails : null
  );

  // Get legendary Pokemon directly when filter is active
  const { data: legendaryPokemon = null, isLoading: loadingLegendary, isFetching: fetchingLegendary } = usePokemonByIds(
    advancedFilters.isLegendary ? legendaryIds : null
  );

  // Get mythical Pokemon directly when filter is active
  const { data: mythicalPokemon = null, isLoading: loadingMythical, isFetching: fetchingMythical } = usePokemonByIds(
    advancedFilters.isMythical ? mythicalIds : null
  );

  // Apply search, type, and sort filters
  const filteredPokemon = useMemo(() => {
    // Merge any fetched details into the base list
    const detailsMap = new Map();
    if (generationPokemonDetails?.results) {
      generationPokemonDetails.results.forEach(p => detailsMap.set(p.id, p));
    }
    if (listDetails?.results) {
      listDetails.results.forEach(p => detailsMap.set(p.id, p));
    }

    const baseList = allPokemon.map(p => detailsMap.get(p.id) || p);

    let filtered = baseList;
    
    // STEP 1: Apply legendary/mythical filter (with generation filtering built-in)
    const hasGenerationFilter = advancedFilters.generations.length > 0;
    const wantsLegendary = advancedFilters.isLegendary && legendaryPokemon;
    const wantsMythical = advancedFilters.isMythical && mythicalPokemon;
    
    if (wantsLegendary || wantsMythical) {
      // Combine legendary and mythical if both are selected
      let combinedResults = [];
      
      if (wantsLegendary) {
        let legendaryResults = legendaryPokemon.results || [];
        if (hasGenerationFilter) {
          legendaryResults = legendaryResults.filter(p => isInGenerations(p.id, advancedFilters.generations));
        }
        combinedResults = [...combinedResults, ...legendaryResults];
      }
      
      if (wantsMythical) {
        let mythicalResults = mythicalPokemon.results || [];
        if (hasGenerationFilter) {
          mythicalResults = mythicalResults.filter(p => isInGenerations(p.id, advancedFilters.generations));
        }
        combinedResults = [...combinedResults, ...mythicalResults];
      }
      
      // Remove duplicates (in case a Pokemon is in both lists)
      const uniqueIds = new Set();
      filtered = combinedResults.filter(p => {
        if (uniqueIds.has(p.id)) return false;
        uniqueIds.add(p.id);
        return true;
      });
    } else if (hasGenerationFilter && generationPokemon) {
      // Generation-only filter (no legendary/mythical)
      if (needsGenDetails && generationPokemonDetails) {
        filtered = generationPokemonDetails.results || [];
      } else {
        const generationPokemonData = generationPokemon.pokemonSpecies.map(p => ({
          id: p.id,
          name: p.name,
          types: [],
          height: 0,
          weight: 0,
          isLoading: false,
          fromGenerationAPI: true,
        }));
        filtered = generationPokemonData;
      }
    }
    
    // SECONDARY FILTERS: These apply to the current filtered set
    
    // Apply search filter (exclude loading items)
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        !p.isLoading && p.name && p.id && (
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toString().includes(searchQuery)
        )
      );
    }
    
    // Apply type filter (only if we have type data available)
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => {
        // Skip Pokemon still loading
        if (p.isLoading) return false;
        // If Pokemon has types loaded, filter by selected types
        if (p.types && p.types.length > 0) {
          return p.types.some(type => selectedTypes.includes(type));
        }
        // If types not loaded yet, exclude from results (will appear after details load)
        return false;
      });
    }

    // Apply advanced filters (generation filter is handled above with direct API)

    // Height filter
    if (advancedFilters.minHeight) {
      const minHeight = parseFloat(advancedFilters.minHeight) * 10; // Convert m to decimeters
      filtered = filtered.filter(p => !p.isLoading && p.height && p.height >= minHeight);
    }
    if (advancedFilters.maxHeight) {
      const maxHeight = parseFloat(advancedFilters.maxHeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.height && p.height <= maxHeight);
    }

    // Weight filter
    if (advancedFilters.minWeight) {
      const minWeight = parseFloat(advancedFilters.minWeight) * 10; // Convert kg to hectograms
      filtered = filtered.filter(p => !p.isLoading && p.weight && p.weight >= minWeight);
    }
    if (advancedFilters.maxWeight) {
      const maxWeight = parseFloat(advancedFilters.maxWeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.weight && p.weight <= maxWeight);
    }
    
    if (advancedFilters.hasEvolution) {
      // Filter out Pokemon that don't evolve (simplified - exclude some known non-evolving Pokemon)
      // These are Pokemon that don't evolve in the first 100
      const nonEvolvingIds = [83, 84, 85, 108, 113, 115, 128, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151];
      filtered = filtered.filter(p => !p.isLoading && !nonEvolvingIds.includes(p.id));
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'number') {
        return (a.id || 0) - (b.id || 0);
      } else {
        // Keep loading items at end when sorting by name
        if (a.isLoading) return 1;
        if (b.isLoading) return -1;
        return (a.name || '').localeCompare(b.name || '');
      }
    });
    
    return sorted;
  }, [
    allPokemon,
    searchQuery,
    sortBy,
    selectedTypes,
    advancedFilters,
    generationPokemon,
    legendaryPokemon,
    mythicalPokemon,
    generationPokemonDetails,
    listDetails,
  ]);

  const handlePokemonPress = useCallback((pokemonData) => {
    // Don't navigate if still loading or missing data
    if (pokemonData.isLoading || !pokemonData.id || !pokemonData.name) return;
    
    // Get the filtered Pokemon IDs for swiping
    const filteredIds = filteredPokemon
      .filter(p => !p.isLoading && p.id) // Only include loaded Pokemon with valid IDs
      .map(p => p.id)
      .sort((a, b) => {
        // Sort by the same criteria as the display
        if (sortBy === 'number') {
          return a - b;
        } else {
          const pokemonA = filteredPokemon.find(p => p.id === a);
          const pokemonB = filteredPokemon.find(p => p.id === b);
          return (pokemonA?.name || '').localeCompare(pokemonB?.name || '');
        }
      });
    
    navigation.navigate('PokemonDetails', {
      pokemonId: pokemonData.id,
      pokemonName: pokemonData.name,
      availableIds: filteredIds, // Pass the filtered IDs for swiping
    });
  }, [navigation, filteredPokemon, sortBy]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleTypeToggle = useCallback((type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Memoized render function
  const renderItem = useCallback(({ item }) => (
    <RenderPokemonCard item={item} onPress={handlePokemonPress} />
  ), [handlePokemonPress]);

  // Memoized key extractor
  const keyExtractor = useCallback((item) => item.id.toString(), []);

  if (isLoading || loadingLegendary || loadingMythical) {
    return <LoadingSpinner message="Loading Pokemon..." />;
  }

  // Overlay state for filter-driven fetches
  const showGenerationOverlay = advancedFilters.generations.length > 0 && (loadingGeneration || fetchingGeneration || loadingGenDetails || fetchingGenDetails);
  const showListDetailsOverlay = needsListDetails && (loadingListDetails || fetchingListDetails);
  const showLegendaryOverlay = advancedFilters.isLegendary && (loadingLegendary || fetchingLegendary);
  const showMythicalOverlay = advancedFilters.isMythical && (loadingMythical || fetchingMythical);
  const shouldShowOverlay = showGenerationOverlay || showLegendaryOverlay || showMythicalOverlay || showListDetailsOverlay;
  const overlayMessage = showGenerationOverlay
    ? 'Loading selected generations...'
    : showLegendaryOverlay
    ? 'Loading legendary Pokémon...'
    : showMythicalOverlay
    ? 'Loading mythical Pokémon...'
    : showListDetailsOverlay
    ? 'Loading Pokémon details for filter...'
    : 'Loading...';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="ellipse-outline" size={32} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Pokédex</Text>
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder="Search"
            />
          </View>
                  <TouchableOpacity
                    style={styles.filterButton}
                    onPress={openAdvancedFilters}
                  >
            <Ionicons name="options-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.filterIcon}>{sortBy === 'number' ? '#' : 'A'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Type Filter */}
      <TypeFilter
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
      />

      <FlatList
        data={filteredPokemon}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={3}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={100}
        windowSize={10}
        removeClippedSubviews={false}
        initialNumToRender={15}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          filteredPokemon.length === 0 && !shouldShowOverlay ? (
            <EmptyState
              title="No Pokemon found"
              message={
                advancedFilters.isLegendary || advancedFilters.isMythical
                  ? 'No legendary/mythical Pokemon found. Try loading more Pokemon.'
                  : advancedFilters.generations.length > 0
                  ? 'Loading Pokemon from selected generations...'
                  : searchQuery.trim() !== '' || selectedTypes.length > 0 || advancedFilters.minHeight || advancedFilters.maxHeight || advancedFilters.minWeight || advancedFilters.maxWeight || advancedFilters.hasEvolution
                  ? 'Try adjusting your search or filters'
                  : 'Loading Pokemon...'
              }
            />
          ) : null
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : null
        }
      />
      <LoadingOverlay visible={shouldShowOverlay} message={overlayMessage} />
      
      <SortModal
        visible={showSortModal}
        onClose={() => setShowSortModal(false)}
        sortBy={sortBy}
        onSortChange={handleSortChange}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: 1,
    marginRight: 12,
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterIcon: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  listContent: {
    padding: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    marginTop: 8,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
      emptySubtext: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
      },
});

export default HomeScreen;


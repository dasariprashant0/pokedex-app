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
import { useInfinitePokemonList, usePokemonByGenerations, usePokemonByTypes, usePokemonByIds, useLegendaryPokemonIds, useMythicalPokemonIds } from '../hooks/usePokemonQueries';
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

  // Get Pokemon by type if type filter is active
  const { data: typePokemon = null, isLoading: loadingType, isFetching: fetchingType } = usePokemonByTypes(
    selectedTypes
  );

  // Helper to get IDs from a pokemon list result
  const getIdsFromList = (list) => list?.pokemonSpecies?.map(p => p.id) || [];

  const generationIds = useMemo(() => getIdsFromList(generationPokemon), [generationPokemon]);
  const typeIds = useMemo(() => getIdsFromList(typePokemon), [typePokemon]);

  // Determine if we need to fetch details for specific lists
  const needsDetailsFromMetadata = useMemo(() => {
    return !!advancedFilters.minHeight ||
      !!advancedFilters.maxHeight ||
      !!advancedFilters.minWeight ||
      !!advancedFilters.maxWeight ||
      advancedFilters.hasEvolution;
    // Note: If we are showing "Type" results, we already know they match the type, 
    // but we don't have height/weight.
  }, [advancedFilters]);

  // If we have generation or type filters, we might need details for them
  const idsNeedingDetails = useMemo(() => {
    let idsToFetch = new Set();

    // If filtering by generation, we might need details
    if (generationIds.length > 0 && needsDetailsFromMetadata) {
      generationIds.forEach(id => idsToFetch.add(id));
    }

    // If filtering by type, we ALWAYS need details if we also filter by stats,
    // OR if we just want to show the full card info nicely (types, etc are missing in basic list).
    // Actually the basic list from API type endpoint gives {name, url}. 
    // Our card needs types to display the chips. So we pretty much ALWAYS need details for type results
    // unless we want to show placeholders.
    // Let's fetch details for type results if they are active.
    if (typeIds.length > 0) {
      typeIds.forEach(id => idsToFetch.add(id));
    }

    return Array.from(idsToFetch);
  }, [generationIds, typeIds, needsDetailsFromMetadata]);

  // Fetch details for the filtered sets (Generation / Type)
  const { data: filteredDetails = null, isLoading: loadingFilteredDetails, isFetching: fetchingFilteredDetails } = usePokemonByIds(
    idsNeedingDetails.length > 0 ? idsNeedingDetails : null
  );

  // When NOT filtering by gen/type (pure list or search), check if visible items need details
  // This applies when using the Infinite List + Height/Weight/Type filters (Type is now separate though)
  const needsListDetails = useMemo(() => {
    return advancedFilters.generations.length === 0 && selectedTypes.length === 0 && needsDetailsFromMetadata;
  }, [advancedFilters, selectedTypes, needsDetailsFromMetadata]);

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
    if (filteredDetails?.results) {
      filteredDetails.results.forEach(p => detailsMap.set(p.id, p));
    }
    if (listDetails?.results) {
      listDetails.results.forEach(p => detailsMap.set(p.id, p));
    }

    // Determine the base set of Pokemon to filter
    let candidates = [];
    const hasGenerationFilter = advancedFilters.generations.length > 0;
    const hasTypeFilter = selectedTypes.length > 0;
    const wantsLegendary = advancedFilters.isLegendary;
    const wantsMythical = advancedFilters.isMythical;

    // STRATEGY: 
    // 1. If Gen, Type, Legendary, or Mythical filters are active, start with those dedicated lists (Union/Intersection).
    // 2. If NO such filters, start with "allPokemon" (infinite scroll list).

    if (hasGenerationFilter || hasTypeFilter || wantsLegendary || wantsMythical) {
      // We are in "Special Filter Mode"

      // Collect valid sets
      let validSets = [];

      if (hasGenerationFilter && generationPokemon) {
        // Adapt to common format
        const genSet = generationPokemon.pokemonSpecies.map(p => ({ ...p, fromGen: true }));
        validSets.push(genSet);
      }

      if (hasTypeFilter && typePokemon) {
        const typeSet = typePokemon.pokemonSpecies.map(p => ({ ...p, fromType: true }));
        validSets.push(typeSet);
      }

      if (wantsLegendary && legendaryPokemon?.results) {
        validSets.push(legendaryPokemon.results);
      }

      if (wantsMythical && mythicalPokemon?.results) {
        validSets.push(mythicalPokemon.results);
      }

      // If we have sets, INTERSECT them (Finding Pokemon that match ALL active criteria? Or UNION?)
      // Use Cases:
      // Gen 1 + Fire -> Charizard (Intersection)
      // Legendary + Fire -> Moltres (Intersection)
      // Fire + Water -> Volcanion (Union of types usually, but here 'typePokemon' is already Union of selected types via API)

      // So: We INTERSECT the major categories (Gen AND Type AND (Legendary OR Mythical?))
      // Actually standard filter behavior:
      // (Gen A OR Gen B) AND (Type A OR Type B) AND (Is Legendary OR Is Mythical)

      // My `typePokemon` is configured as Union (Any of selected types).
      // My `generationPokemon` is configured as Union (Any of selected gens).

      // So I need to INTERSECT `validSets`.
      // But wait, Legendary/Mythical are checkboxes. "Show Legendary", "Show Mythical".
      // If both unchecked -> Show any.
      // If Legendary checked -> Must be Legendary. 
      // If Mythical checked -> Must be Mythical.
      // If both checked -> Legendary OR Mythical (usually).

      // Let's refine the "Special Sets":
      // Base Pool = Intersection of (Gen Pool if active) AND (Type Pool if active).
      // Then apply Legendary/Mythical filters on that Pool.

      let basePool = null;

      if (hasGenerationFilter && generationPokemon) {
        basePool = generationPokemon.pokemonSpecies;
      }

      if (hasTypeFilter && typePokemon) {
        if (basePool) {
          // Intersect
          const typeIds = new Set(typePokemon.pokemonSpecies.map(p => p.id));
          basePool = basePool.filter(p => typeIds.has(p.id));
        } else {
          basePool = typePokemon.pokemonSpecies;
        }
      }

      // If no Gen/Type filter but Legendary/Mythical active
      if (!basePool && (wantsLegendary || wantsMythical)) {
        // Start with empty and add
        basePool = [];
        if (wantsLegendary && legendaryPokemon) basePool = [...basePool, ...legendaryPokemon.results];
        if (wantsMythical && mythicalPokemon) basePool = [...basePool, ...mythicalPokemon.results];

        // Remove dupes
        basePool = Array.from(new Map(basePool.map(p => [p.id, p])).values());
      } else if (basePool && (wantsLegendary || wantsMythical)) {
        // Filter the existing pool
        // Logic: If (L) -> allow L. If (M) -> allow M. If (L & M) -> allow (L or M).
        const legIds = new Set(legendaryIds);
        const mythIds = new Set(mythicalIds);

        basePool = basePool.filter(p => {
          const isLeg = legIds.has(Number(p.id));
          const isMyth = mythIds.has(Number(p.id));
          if (wantsLegendary && wantsMythical) return isLeg || isMyth;
          if (wantsLegendary) return isLeg;
          if (wantsMythical) return isMyth;
          return true;
        });
      }

      candidates = basePool || [];

      // Map to full details if available
      candidates = candidates.map(p => detailsMap.get(p.id) || {
        ...p,
        types: [], // Missing details
        height: 0,
        weight: 0,
        isLoading: !p.name, // If we just have ID, it's loading? Actually from API we have name.
      });

    } else {
      // Normal list mode (Infinite Scroll)
      const baseList = allPokemon.map(p => detailsMap.get(p.id) || p);
      candidates = baseList;
    }

    let filtered = candidates;

    // SECONDARY FILTERS

    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p =>
        p.name && p.id && (
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toString().includes(searchQuery)
        )
      );
    }

    // Height filter
    if (advancedFilters.minHeight) {
      const minHeight = parseFloat(advancedFilters.minHeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.height && p.height >= minHeight);
    }
    if (advancedFilters.maxHeight) {
      const maxHeight = parseFloat(advancedFilters.maxHeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.height && p.height <= maxHeight);
    }

    // Weight filter
    if (advancedFilters.minWeight) {
      const minWeight = parseFloat(advancedFilters.minWeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.weight && p.weight >= minWeight);
    }
    if (advancedFilters.maxWeight) {
      const maxWeight = parseFloat(advancedFilters.maxWeight) * 10;
      filtered = filtered.filter(p => !p.isLoading && p.weight && p.weight <= maxHeight);
    }

    if (advancedFilters.hasEvolution) {
      const nonEvolvingIds = [83, 84, 85, 108, 113, 115, 128, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151];
      filtered = filtered.filter(p => !p.isLoading && !nonEvolvingIds.includes(p.id));
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'number') {
        return (a.id || 0) - (b.id || 0);
      } else {
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
    typePokemon,
    legendaryPokemon,
    mythicalPokemon,
    filteredDetails,
    listDetails,
    legendaryIds,
    mythicalIds
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
  const showGenerationOverlay = advancedFilters.generations.length > 0 && (loadingGeneration || fetchingGeneration || loadingFilteredDetails || fetchingFilteredDetails);
  const showTypeOverlay = selectedTypes.length > 0 && (loadingType || fetchingType || loadingFilteredDetails || fetchingFilteredDetails);
  const showListDetailsOverlay = needsListDetails && (loadingListDetails || fetchingListDetails);
  const showLegendaryOverlay = advancedFilters.isLegendary && (loadingLegendary || fetchingLegendary);
  const showMythicalOverlay = advancedFilters.isMythical && (loadingMythical || fetchingMythical);
  const shouldShowOverlay = showGenerationOverlay || showTypeOverlay || showLegendaryOverlay || showMythicalOverlay || showListDetailsOverlay;
  const overlayMessage = showGenerationOverlay
    ? 'Loading selected generations...'
    : showTypeOverlay
      ? 'Loading selected types...'
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
              placeholder="Search your Pokémon ..."
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
                    : selectedTypes.length > 0
                      ? 'Loading Pokemon from selected types...'
                      : searchQuery.trim() !== '' || advancedFilters.minHeight || advancedFilters.maxHeight || advancedFilters.minWeight || advancedFilters.maxWeight || advancedFilters.hasEvolution
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


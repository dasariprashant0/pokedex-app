import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  getPokemonListWithBasicDetails,
  getPokemonDetails,
  getPokemonSpecies,
  getEvolutionChain,
  getMoveDetails,
  getTypeDetails,
  getPokemonByGenerations,
  getPokemonByTypes,
} from '../services/pokemonApi';
import api from '../services/pokemonApi';
import { ENDPOINTS, getPokemonSprite } from '../constants/api';
import { LEGENDARY_POKEMON_IDS, MYTHICAL_POKEMON_IDS } from '../constants/pokemon';

// ============================================================================
// QUERY KEY FACTORY - Consistent key structure for cache management
// ============================================================================

export const pokemonKeys = {
  all: ['pokemon'],
  lists: () => [...pokemonKeys.all, 'list'],
  infiniteList: (limit) => [...pokemonKeys.lists(), 'infinite', limit],
  details: () => [...pokemonKeys.all, 'detail'],
  detail: (id) => [...pokemonKeys.details(), id],
  species: (id) => [...pokemonKeys.all, 'species', id],
  evolution: (url) => [...pokemonKeys.all, 'evolution', url],
  move: (id) => [...pokemonKeys.all, 'move', id],
  type: (name) => [...pokemonKeys.all, 'type', name],
  generations: (ids) => [...pokemonKeys.all, 'generations', ids],
  types: (ids) => [...pokemonKeys.all, 'types', ids],
  byIds: (ids) => [...pokemonKeys.all, 'byIds', ids?.join(',')],
};

// ============================================================================
// CORE POKEMON HOOKS
// ============================================================================

// Fetch single Pokemon details
export const usePokemonDetails = (pokemonId) => {
  return useQuery({
    queryKey: pokemonKeys.detail(pokemonId),
    queryFn: () => getPokemonDetails(pokemonId),
    enabled: !!pokemonId,
  });
};

// Fetch Pokemon species data
export const usePokemonSpecies = (pokemonId) => {
  return useQuery({
    queryKey: pokemonKeys.species(pokemonId),
    queryFn: () => getPokemonSpecies(pokemonId),
    enabled: !!pokemonId,
  });
};

// Fetch evolution chain
export const useEvolutionChain = (evolutionChainUrl) => {
  return useQuery({
    queryKey: pokemonKeys.evolution(evolutionChainUrl),
    queryFn: () => getEvolutionChain(evolutionChainUrl),
    enabled: !!evolutionChainUrl,
    staleTime: Infinity, // Evolution chains never change
  });
};

// ============================================================================
// LIST HOOKS
// ============================================================================

// Infinite scrolling Pokemon list
export const useInfinitePokemonList = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: pokemonKeys.infiniteList(limit),
    queryFn: ({ pageParam = 0 }) => getPokemonListWithBasicDetails(pageParam, limit),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      const url = new URL(lastPage.next);
      return parseInt(url.searchParams.get('offset'));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Load Pokemon by array of IDs (for filters)
export const usePokemonByIds = (pokemonIds) => {
  return useQuery({
    queryKey: pokemonKeys.byIds(pokemonIds),
    queryFn: async () => {
      if (!pokemonIds?.length) return { results: [] };

      const results = await Promise.all(
        pokemonIds.map(async (id) => {
          try {
            const { data } = await api.get(`${ENDPOINTS.POKEMON}/${id}`);
            return {
              id: data.id,
              name: data.name,
              height: data.height,
              weight: data.weight,
              types: data.types.map(t => t.type.name),
              sprites: {
                default: data.sprites.front_default,
                official: getPokemonSprite(data.id),
              },
              isLoading: false,
            };
          } catch {
            // Return minimal fallback on error
            return {
              id,
              name: `Pokemon ${id}`,
              types: [],
              sprites: { official: getPokemonSprite(id) },
              isLoading: false,
            };
          }
        })
      );
      return { results };
    },
    enabled: Boolean(pokemonIds?.length),
  });
};

// ============================================================================
// FILTER HOOKS
// ============================================================================

// Fetch Pokemon by generation(s)
export const usePokemonByGenerations = (generationIds) => {
  return useQuery({
    queryKey: pokemonKeys.generations(generationIds),
    queryFn: () => getPokemonByGenerations(generationIds),
    enabled: Boolean(generationIds?.length),
    staleTime: Infinity, // Generations never change
  });
};

// Fetch Pokemon by type(s)
export const usePokemonByTypes = (types) => {
  return useQuery({
    queryKey: pokemonKeys.types(types),
    queryFn: () => getPokemonByTypes(types),
    enabled: Boolean(types?.length),
    staleTime: 1000 * 60 * 60, // Types don't change often
  });
};

// Return legendary Pokemon IDs (instant - no API call needed)
export const useLegendaryPokemonIds = () => {
  return useQuery({
    queryKey: ['pokemon', 'legendary'],
    queryFn: () => LEGENDARY_POKEMON_IDS,
    staleTime: Infinity,
    initialData: LEGENDARY_POKEMON_IDS,
  });
};

// Return mythical Pokemon IDs (instant - no API call needed)
export const useMythicalPokemonIds = () => {
  return useQuery({
    queryKey: ['pokemon', 'mythical'],
    queryFn: () => MYTHICAL_POKEMON_IDS,
    staleTime: Infinity,
    initialData: MYTHICAL_POKEMON_IDS,
  });
};

// ============================================================================
// BATTLE & MOVES HOOKS
// ============================================================================

export const useMoveDetails = (moveNameOrId) => {
  return useQuery({
    queryKey: pokemonKeys.move(moveNameOrId),
    queryFn: () => getMoveDetails(moveNameOrId),
    enabled: !!moveNameOrId,
    staleTime: Infinity, // Move data never changes
  });
};

export const useTypeDetails = (typeName) => {
  return useQuery({
    queryKey: pokemonKeys.type(typeName),
    queryFn: () => getTypeDetails(typeName),
    enabled: !!typeName,
    staleTime: Infinity, // Type data never changes
  });
};

// ============================================================================
// PREFETCHING
// ============================================================================

export const usePrefetchAdjacentPokemon = () => {
  const queryClient = useQueryClient();

  const prefetchAdjacent = (currentId, availableIds = []) => {
    const ids = availableIds.length > 0 ? availableIds : null;
    const currentIndex = ids?.indexOf(currentId) ?? -1;

    const prevId = ids
      ? (currentIndex > 0 ? ids[currentIndex - 1] : null)
      : (currentId > 1 ? currentId - 1 : null);

    const nextId = ids
      ? (currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null)
      : (currentId < 1010 ? currentId + 1 : null);

    // Prefetch both adjacent Pokemon
    [prevId, nextId].filter(Boolean).forEach(id => {
      queryClient.prefetchQuery({
        queryKey: pokemonKeys.detail(id),
        queryFn: () => getPokemonDetails(id),
      });
    });
  };

  return { prefetchAdjacent };
};

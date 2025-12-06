import { useQuery } from '@tanstack/react-query';
import api from '../services/pokemonApi';
import { ENDPOINTS, LIMITS, getPokemonIdFromUrl } from '../constants/api';

const fetchAllPokemonSimple = async () => {
    try {
        const response = await api.get(`${ENDPOINTS.POKEMON}?limit=${LIMITS.TOTAL_POKEMON}`);
        return response.data.results.map(p => ({
            name: p.name,
            id: getPokemonIdFromUrl(p.url),
        }));
    } catch (error) {
        console.warn('Failed to fetch all pokemon list for autocomplete', error);
        return [];
    }
};

export const useAllPokemonSimple = () => {
    return useQuery({
        queryKey: ['allPokemonSimple'],
        queryFn: fetchAllPokemonSimple,
        staleTime: Infinity, // Never stale, names don't change
        gcTime: Infinity, // Keep in cache
    });
};

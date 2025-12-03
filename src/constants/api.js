export const BASE_URL = 'https://pokeapi.co/api/v2';

export const ENDPOINTS = {
  POKEMON: '/pokemon',
  POKEMON_SPECIES: '/pokemon-species',
  TYPE: '/type',
  GENERATION: '/generation',
  ABILITY: '/ability',
};

export const LIMITS = {
  POKEMON_PER_PAGE: 20,
  TOTAL_POKEMON: 1010, // Total number of Pokemon available
};

// Helper to get Pokemon sprite
export const getPokemonSprite = (id) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};

// Helper to get Pokemon ID from URL
export const getPokemonIdFromUrl = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 2];
};


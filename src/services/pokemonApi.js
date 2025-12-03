import axios from 'axios';
import { BASE_URL, ENDPOINTS, getPokemonIdFromUrl, getPokemonSprite } from '../constants/api';
import { LEGENDARY_POKEMON_IDS, MYTHICAL_POKEMON_IDS } from '../constants/pokemon';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds for slower connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// BASIC POKEMON DATA
// ============================================================================

// Get list of Pokemon with pagination (basic data only)
export const getPokemonList = async (offset = 0, limit = 20) => {
  try {
    const response = await api.get(`${ENDPOINTS.POKEMON}?offset=${offset}&limit=${limit}`);
    return {
      results: response.data.results.map(pokemon => ({
        ...pokemon,
        id: getPokemonIdFromUrl(pokemon.url),
      })),
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    // Return empty results for production
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
    };
  }
};

// Get detailed Pokemon data (includes species data for generation, legendary status, etc.)
export const getPokemonDetails = async (idOrName) => {
  try {
    const response = await api.get(`${ENDPOINTS.POKEMON}/${idOrName}`);
    const pokemon = response.data;
    
    // Also fetch species data for generation, legendary status, etc.
    let speciesData = null;
    try {
      const speciesResponse = await api.get(`${ENDPOINTS.POKEMON_SPECIES}/${idOrName}`);
      const species = speciesResponse.data;
      
      // Get English description
      const englishEntry = species.flavor_text_entries.find(
        entry => entry.language.name === 'en'
      );
      
      speciesData = {
        generation: species.generation.name,
        description: englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : '',
        isLegendary: species.is_legendary,
        isMythical: species.is_mythical,
        captureRate: species.capture_rate,
        habitat: species.habitat?.name,
        evolutionChainUrl: species.evolution_chain?.url,
      };
    } catch (speciesError) {
      // Silent fail for production - species data is optional
    }
    
    return {
      id: pokemon.id,
      name: pokemon.name,
      height: pokemon.height,
      weight: pokemon.weight,
      types: pokemon.types.map(type => type.type.name),
      abilities: pokemon.abilities.map(ability => ({
        name: ability.ability.name,
        isHidden: ability.is_hidden,
      })),
      stats: pokemon.stats.map(stat => ({
        name: stat.stat.name,
        value: stat.base_stat,
      })),
      sprites: {
        default: pokemon.sprites.front_default,
        official: getPokemonSprite(pokemon.id),
        shiny: pokemon.sprites.front_shiny,
      },
      moves: pokemon.moves.slice(0, 10).map(move => move.move.name),
      // Include species data if available
      ...(speciesData && {
        generation: speciesData.generation,
        description: speciesData.description,
        isLegendary: speciesData.isLegendary,
        isMythical: speciesData.isMythical,
        captureRate: speciesData.captureRate,
        habitat: speciesData.habitat,
        evolutionChainUrl: speciesData.evolutionChainUrl,
      }),
    };
  } catch (error) {
    // Return null for production - let React Query handle retries
    return null;
  }
};


// Get list of Pokemon with basic data only (FAST - no individual API calls)
export const getPokemonListWithBasicDetails = async (offset = 0, limit = 20) => {
  try {
    const response = await api.get(`${ENDPOINTS.POKEMON}?offset=${offset}&limit=${limit}`);
    const pokemonList = response.data.results;
    
    // Convert to our format without individual API calls - MUCH FASTER!
    const pokemonWithBasicDetails = pokemonList.map((pokemon, index) => {
      const pokemonId = getPokemonIdFromUrl(pokemon.url);
      
      return {
        id: pokemonId,
        name: pokemon.name,
        height: 0, // Will be loaded later if needed
        weight: 0, // Will be loaded later if needed
        types: [], // Will be loaded later if needed
        sprites: {
          default: getPokemonSprite(pokemonId),
          official: getPokemonSprite(pokemonId),
          shiny: getPokemonSprite(pokemonId, 'shiny'),
        },
        isLoading: false, // Not loading - we have basic data
        needsDetails: true, // Mark that we need to load full details later
      };
    });
    
    return {
      results: pokemonWithBasicDetails,
      count: response.data.count,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    // Return empty results for production
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
    };
  }
};

// ============================================================================
// FILTERING & SEARCH
// ============================================================================

// Get Pokemon by generation (direct API call)
export const getPokemonByGeneration = async (generationId) => {
  try {
    const response = await api.get(`/generation/${generationId}/`);
    const generationData = response.data;
    
    // Extract Pokemon species from the generation
    const pokemonSpecies = generationData.pokemon_species.map(species => ({
      id: getPokemonIdFromUrl(species.url),
      name: species.name,
      url: species.url,
    }));
    
    return {
      generation: generationData.name,
      pokemonSpecies,
      count: pokemonSpecies.length,
    };
  } catch (error) {
    // Return empty results for production
    return {
      generation: `generation-${generationId}`,
      pokemonSpecies: [],
      count: 0,
    };
  }
};

// Get Pokemon by multiple generations
export const getPokemonByGenerations = async (generationIds) => {
  try {
    const generationPromises = generationIds.map(id => getPokemonByGeneration(id));
    const results = await Promise.all(generationPromises);
    
    // Combine all Pokemon from all generations
    const allPokemon = results.flatMap(result => result.pokemonSpecies);
    
    // Remove duplicates (in case a Pokemon appears in multiple generations)
    const uniquePokemon = allPokemon.filter((pokemon, index, self) => 
      index === self.findIndex(p => p.id === pokemon.id)
    );
    
    return {
      generations: results.map(r => r.generation),
      pokemonSpecies: uniquePokemon,
      count: uniquePokemon.length,
    };
  } catch (error) {
    // Return empty results for production
    return {
      generations: generationIds.map(id => `generation-${id}`),
      pokemonSpecies: [],
      count: 0,
    };
  }
};

// Get legendary Pokemon IDs (instant - hardcoded for performance)
export const getLegendaryPokemonIds = async () => {
  return LEGENDARY_POKEMON_IDS;
};

// Get mythical Pokemon IDs (instant - hardcoded for performance)  
export const getMythicalPokemonIds = async () => {
  return MYTHICAL_POKEMON_IDS;
};

// ============================================================================
// EVOLUTION & SPECIES DATA
// ============================================================================

// Get Pokemon species data (for evolution chain, descriptions, etc.)
export const getPokemonSpecies = async (id) => {
  try {
    const response = await api.get(`${ENDPOINTS.POKEMON_SPECIES}/${id}`);
    const species = response.data;
    
    // Get English description
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    return {
      id: species.id,
      name: species.name,
      description: englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : '',
      generation: species.generation.name,
      evolutionChainUrl: species.evolution_chain?.url,
      captureRate: species.capture_rate,
      genderRate: species.gender_rate,
      habitat: species.habitat?.name,
      isLegendary: species.is_legendary,
      isMythical: species.is_mythical,
    };
  } catch (error) {
    // Return null for production - let React Query handle retries
    return null;
  }
};

// Get evolution chain data
export const getEvolutionChain = async (url) => {
  try {
    const response = await axios.get(url);
    const chain = response.data.chain;
    
    // Parse evolution chain recursively
    const parseChain = (chainLink) => {
      const pokemon = {
        name: chainLink.species.name,
        id: getPokemonIdFromUrl(chainLink.species.url),
        evolvesTo: [],
      };
      
      if (chainLink.evolves_to && chainLink.evolves_to.length > 0) {
        pokemon.evolvesTo = chainLink.evolves_to.map(parseChain);
      }
      
      return pokemon;
    };
    
    return parseChain(chain);
  } catch (error) {
    // Return null for production - let React Query handle retries
    return null;
  }
};

// ============================================================================
// MOVES & BATTLE DATA
// ============================================================================

// Get move details
export const getMoveDetails = async (nameOrId) => {
  try {
    const response = await api.get(`/move/${nameOrId}`);
    const move = response.data;
    
    return {
      id: move.id,
      name: move.name,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      type: move.type.name,
      damageClass: move.damage_class.name,
      description: move.effect_entries.find(e => e.language.name === 'en')?.short_effect || '',
    };
  } catch (error) {
    // Return null for production - let React Query handle retries
    return null;
  }
};

// ============================================================================
// TYPE EFFECTIVENESS
// ============================================================================

// Get type details and effectiveness
export const getTypeDetails = async (typeName) => {
  try {
    const response = await api.get(`/type/${typeName}`);
    const type = response.data;
    
    return {
      id: type.id,
      name: type.name,
      damageRelations: {
        doubleDamageFrom: type.damage_relations.double_damage_from.map(t => t.name),
        doubleDamageTo: type.damage_relations.double_damage_to.map(t => t.name),
        halfDamageFrom: type.damage_relations.half_damage_from.map(t => t.name),
        halfDamageTo: type.damage_relations.half_damage_to.map(t => t.name),
        noDamageFrom: type.damage_relations.no_damage_from.map(t => t.name),
        noDamageTo: type.damage_relations.no_damage_to.map(t => t.name),
      },
    };
  } catch (error) {
    // Return null for production - let React Query handle retries
    return null;
  }
};

export default api;
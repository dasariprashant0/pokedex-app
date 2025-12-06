import { Share, Platform } from 'react-native';

export const sharePokemon = async (pokemon, species) => {
  try {
    const types = pokemon.types.join(', ');
    const stats = pokemon.stats
      .map(stat => `${stat.name}: ${stat.value}`)
      .join('\n');

    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    const message = `Check out ${pokemon.name.toUpperCase()}! 🌟\n\n` +
      `#${String(pokemon.id).padStart(3, '0')}\n` +
      `──────────────────\n` +
      `🧬 Types: ${types}\n` +
      `📏 Height: ${(pokemon.height / 10).toFixed(1)}m\n` +
      `⚖️ Weight: ${(pokemon.weight / 10).toFixed(1)}kg\n` +
      `──────────────────\n` +
      `📊 Base Stats:\n${stats}\n\n` +
      (species?.description ? `📝 ${species.description}\n\n` : '') +
      (species?.isLegendary ? '⭐ Legendary Pokemon!\n' : '') +
      (species?.isMythical ? '✨ Mythical Pokemon!\n' : '') +
      `\n🔗 View details: https://pokeapi.co/api/v2/pokemon/${pokemon.id}\n` +
      `\n🖼️ Image: ${imageUrl}\n` +
      `\n📱 Shared from Pokédex App`;

    const result = await Share.share(
      {
        message,
        url: imageUrl, // iOS: Adds image/URL to share sheet
        title: `${pokemon.name} - Pokemon Details`, // Android: Title
      },
      {
        subject: `${pokemon.name} - Pokemon Details`,
        dialogTitle: `Share ${pokemon.name}`, // Android
      }
    );

    if (result.action === Share.sharedAction) {
      // Shared successfully - silent success for production
    } else if (result.action === Share.dismissedAction) {
      // Share dismissed - silent dismiss for production
    }

    return result;
  } catch (error) {
    // Silent fail for production
    throw error;
  }
};

export const shareTeam = async (teamDetails) => {
  try {
    if (!teamDetails || teamDetails.length === 0) {
      throw new Error('No team to share');
    }

    const teamList = teamDetails
      .map((pokemon, index) =>
        `${index + 1}. ${pokemon.name.toUpperCase()} (#${String(pokemon.id).padStart(3, '0')}) - ${pokemon.types.join(', ')}`
      )
      .join('\n');

    const typeCoverage = {};
    teamDetails.forEach(pokemon => {
      pokemon.types.forEach(type => {
        typeCoverage[type] = (typeCoverage[type] || 0) + 1;
      });
    });

    const coverageList = Object.entries(typeCoverage)
      .map(([type, count]) => `${type}${count > 1 ? ` x${count}` : ''}`)
      .join(', ');

    const message = `My Pokemon Team! 🌟\n\n` +
      `${teamList}\n\n` +
      `Type Coverage: ${coverageList}\n\n` +
      `Team Size: ${teamDetails.length}/6\n\n` +
      `Shared from Pokédex App`;

    const result = await Share.share(
      {
        message,
      },
      {
        subject: 'My Pokemon Team',
      }
    );

    return result;
  } catch (error) {
    console.error('Share error:', error);
    // Silent fail for production
    throw error;
  }
};


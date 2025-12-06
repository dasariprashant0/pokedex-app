import { createAudioPlayer } from 'expo-audio';

export const playPokemonCry = async (pokemonId, pokemonName) => {
    try {
        // 1. Determine Source (Pokemon Showdown MP3)
        let cleanName = (pokemonName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!cleanName && pokemonId) {
            cleanName = String(pokemonId);
        }
        const uri = `https://play.pokemonshowdown.com/audio/cries/${cleanName}.mp3`;

        // 2. Play Audio using createAudioPlayer factory
        const player = createAudioPlayer({ uri });
        player.play();

        return true;
    } catch (error) {
        console.warn('Failed to play cry:', error);
        return false;
    }
};

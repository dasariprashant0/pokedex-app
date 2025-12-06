import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAllPokemonSimple } from '../hooks/useAllPokemon';

const AutocompleteInput = ({ onSelect, placeholder = "Search Pokemon..." }) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data: allPokemon = [] } = useAllPokemonSimple();

    const filteredData = useMemo(() => {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return allPokemon.filter(p =>
            p.name.includes(lowerQuery) || p.id.toString().startsWith(lowerQuery)
        ).slice(0, 5); // Limit to 5 suggestions
    }, [query, allPokemon]);

    const handleSelect = (item) => {
        setQuery('');
        setQuery(item.name); // Optional: Set to name, or clear
        setShowSuggestions(false);
        onSelect(item.id); // Or item.name, but ID is safer
        Keyboard.dismiss();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        setShowSuggestions(true);
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    autoCapitalize="none"
                    onBlur={() => {
                        // Delay hiding to allow click
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => {
                        if (query) onSelect(query.toLowerCase());
                    }}
                >
                    <Ionicons name="search" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {showSuggestions && filteredData.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    {filteredData.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.suggestionItem}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.suggestionText}>
                                <Text style={styles.suggestionId}>#{item.id} </Text>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        zIndex: 100, // Important for overlay
    },
    inputContainer: {
        flexDirection: 'row',
        gap: 6,
        width: '100%',
    },
    input: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 13,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        color: COLORS.text,
    },
    searchButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        width: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 999, // High z-index to float over other content
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    suggestionText: {
        fontSize: 14,
        color: COLORS.text,
        textTransform: 'capitalize',
    },
    suggestionId: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
});

export default AutocompleteInput;

import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAllPokemonSimple } from '../hooks/useAllPokemon';

const SearchBar = ({ value, onChangeText, placeholder = 'Search Pokemon...' }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: allPokemon = [] } = useAllPokemonSimple();

  const filteredData = useMemo(() => {
    if (!value || value.length < 2) return [];
    const lowerQuery = value.toLowerCase();
    return allPokemon.filter(p =>
      p.name.includes(lowerQuery) || p.id.toString().startsWith(lowerQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  }, [value, allPokemon]);

  const handleSelect = (item) => {
    onChangeText(item.name);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color={COLORS.primary} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowSuggestions(true);
          }}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay closing to allow click
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {value.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color={COLORS.textSecondary}
            style={styles.clearIcon}
            onPress={() => {
              onChangeText('');
              setShowSuggestions(false);
            }}
          />
        )}
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
  wrapper: {
    width: '100%',
    zIndex: 100,
    position: 'relative',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    marginLeft: 8,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60, // Below the search bar
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 999,
  },
  suggestionItem: {
    padding: 12,
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

export default SearchBar;


import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInfinitePokemonList, usePokemonByIds } from '../hooks/usePokemonQueries';
import { useAllPokemonSimple } from '../hooks/useAllPokemon';
import PokemonCard from './PokemonCard';
import PokemonCardPlaceholder from './PokemonCardPlaceholder'; // Assuming this exists or use null
import { COLORS } from '../constants/colors';

const PokemonSelectionModal = ({ visible, onClose, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Browse Mode: Infinite List
    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingInfinite,
    } = useInfinitePokemonList(20);

    const infinitePokemon = useMemo(() => {
        if (!infiniteData?.pages) return [];
        return infiniteData.pages.flatMap(page => page.results);
    }, [infiniteData]);

    // 2. Search Mode: Filter All Names -> Fetch Details
    const { data: allPokemonList } = useAllPokemonSimple();

    const searchResultsIds = useMemo(() => {
        if (!searchQuery || !allPokemonList) return [];
        const lowerQuery = searchQuery.toLowerCase();
        return allPokemonList
            .filter(p => p.name.includes(lowerQuery) || String(p.id).includes(lowerQuery))
            .map(p => p.id)
            .slice(0, 20); // Limit to 20 results for performance
    }, [searchQuery, allPokemonList]);

    const {
        data: searchResultsDetails,
        isLoading: isLoadingSearch
    } = usePokemonByIds(searchQuery.length > 0 ? searchResultsIds : null);

    // 3. Determine what to show
    const isSearching = searchQuery.length > 0;
    const dataToShow = isSearching ? searchResultsDetails || [] : infinitePokemon;
    const isLoading = isSearching ? isLoadingSearch : isLoadingInfinite;

    const renderItem = ({ item }) => (
        <PokemonCard
            pokemon={item}
            onPress={() => {
                onSelect(item);
                onClose();
                setSearchQuery('');
            }}
            disabled={false}
        />
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Select Pokemon</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>

                {isLoading && !isFetchingNextPage && dataToShow.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={dataToShow}
                        renderItem={renderItem}
                        keyExtractor={item => String(item.id)}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        onEndReached={() => {
                            if (!isSearching && hasNextPage) {
                                fetchNextPage();
                            }
                        }}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isFetchingNextPage ? (
                                <ActivityIndicator color={COLORS.primary} style={{ margin: 10 }} />
                            ) : null
                        }
                        ListEmptyComponent={
                            !isLoading && (
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>No Pokemon found</Text>
                                </View>
                            )
                        }
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
    },
    listContent: {
        padding: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textSecondary,
    },
});

export default PokemonSelectionModal;

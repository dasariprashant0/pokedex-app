import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AdvancedFiltersProvider, useAdvancedFilters } from './src/context/AdvancedFiltersContext';
import AdvancedFiltersScreen from './src/components/AdvancedFiltersModal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 min - Pokemon data doesn't change often
      gcTime: 1000 * 60 * 30,    // 30 min cache retention
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { showAdvancedFilters, closeAdvancedFilters, advancedFilters, setAdvancedFilters } = useAdvancedFilters();

  return (
    <>
      <AppNavigator />
      {showAdvancedFilters && (
        <AdvancedFiltersScreen
          onClose={closeAdvancedFilters}
          filters={advancedFilters}
          onApplyFilters={setAdvancedFilters}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AdvancedFiltersProvider>
            <StatusBar style="light" />
            <AppContent />
          </AdvancedFiltersProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}


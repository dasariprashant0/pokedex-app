import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { AdvancedFiltersProvider, useAdvancedFilters } from './src/context/AdvancedFiltersContext';
import AdvancedFiltersScreen from './src/components/AdvancedFiltersModal';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from './src/utils/notificationUtils';

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
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        console.log('Expo Push Token:', token);

        // TODO: In production, send this token to your backend API
        // Example: await fetch('https://your-api.com/register-token', {
        //   method: 'POST',
        //   body: JSON.stringify({ token, userId: 'user123' })
        // });

        // For now, save locally for testing
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('@expo_push_token', token);
        } catch (e) {
          console.log('Could not save token locally');
        }
      }
    });

    // Listen for incoming notifications while app is in foreground
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interaction with notifications
    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data?.type === 'team_update') {
        // Could navigate to Team Builder screen
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

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

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PokemonDetailsScreen from '../screens/PokemonDetailsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import TeamBuilderScreen from '../screens/TeamBuilderScreen';
import CompareScreen from '../screens/CompareScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="PokemonDetails" 
        component={PokemonDetailsScreen}
        options={({ route }) => ({ 
          title: route.params?.pokemonName || 'Pokemon Details',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}

// Favorites Stack Navigator
function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="FavoritesMain" 
        component={FavoritesScreen} 
        options={{ title: 'Favorites' }}
      />
      <Stack.Screen 
        name="PokemonDetails" 
        component={PokemonDetailsScreen}
        options={({ route }) => ({ 
          title: route.params?.pokemonName || 'Pokemon Details',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}

// Team Builder Stack Navigator
function TeamStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TeamMain" 
        component={TeamBuilderScreen} 
        options={{ title: 'Team Builder (Beta)' }}
      />
      <Stack.Screen 
        name="PokemonDetails" 
        component={PokemonDetailsScreen}
        options={({ route }) => ({ 
          title: route.params?.pokemonName || 'Pokemon Details',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Team') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Compare') {
            iconName = focused ? 'git-compare' : 'git-compare-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Favorites" component={FavoritesStack} />
      <Tab.Screen name="Team" component={TeamStack} />
      <Tab.Screen 
        name="Compare" 
        component={CompareScreen} 
        options={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          title: 'Compare Pokemon',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}


# 🌟 React Native Pokédex

A feature-rich, production-ready Pokédex application built with React Native and Expo. Browse, search, filter, and manage your favorite Pokemon with a beautiful, modern UI and smooth animations.

![Expo SDK 54](https://img.shields.io/badge/Expo-54.0.0-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🏠 Home Screen
- **Infinite Scroll**: Smoothly browse through all 1010+ Pokemon with progressive loading
- **Smart Search**: Search Pokemon by name or Pokédex number
- **Type Filtering**: Filter by any Pokemon type with beautiful type chips
- **Sorting**: Sort by number or name with a sleek modal interface
- **Staggered Animations**: Cards fade in with smooth spring animations
- **Optimized Performance**: React Query caching and FlatList optimizations

### 📊 Pokemon Details
- **Comprehensive Info**: View stats, abilities, types, height, weight, and more
- **Type Effectiveness**: See weaknesses, resistances, and immunities at a glance
- **Evolution Chain**: Interactive evolution tree with all branching paths
- **Swipe Navigation**: Swipe left/right or use arrow buttons to navigate
- **Pokemon Cries**: Play authentic Pokemon cries with one tap
- **Share**: Share Pokemon details with friends via native sharing
- **Add to Team**: Quickly add Pokemon to your team builder
- **Context-Aware**: Smart navigation when viewing from favorites or team

### ❤️ Favorites
- **Persistent Storage**: Favorites saved across app sessions
- **Quick Access**: Dedicated favorites tab for easy access
- **Context Navigation**: Swipe only through favorited Pokemon in details

### 👥 Team Builder
- **6-Pokemon Team**: Build your dream team with up to 6 Pokemon
- **Type Coverage**: Visual breakdown of team type distribution
- **Team Management**: Easy add/remove with long-press
- **Share Team**: Share your team composition with others
- **Visual Stats**: See team size and type coverage at a glance

### 🔍 Advanced Features
- **Advanced Filters**: Filter by generation, height, weight, legendary/mythical status
- **Compare Mode**: Side-by-side Pokemon comparison with stat analysis
- **Dark Mode**: System-aware theme with persistent preference

### 🎨 UI/UX Features
- **Beautiful Animations**: Smooth card entrance and transition animations
- **Type Colors**: Dynamic colors based on Pokemon primary type
- **Responsive Design**: Optimized for all screen sizes
- **Loading States**: Skeleton placeholders for smooth loading experience
- **Error Handling**: Graceful error boundaries and fallbacks
- **Native Feel**: Platform-specific optimizations for iOS and Android

## 📱 Tech Stack

### Core
- **React Native**: 0.81.5
- **Expo**: 54.0.0
- **React**: 19.1.0
- **React Navigation**: Bottom tabs + Stack navigation

### Data Management
- **@tanstack/react-query**: Data fetching, caching, and synchronization
- **AsyncStorage**: Persistent local storage for favorites and team
- **Axios**: HTTP client with 60s timeout for slower connections

### UI Components
- **expo-linear-gradient**: Beautiful gradient backgrounds
- **@expo/vector-icons**: 1000+ Ionicons for consistent iconography
- **Animated API**: Native-driven animations for smooth 60fps performance

### Features
- **react-native-safe-area-context**: Safe area handling
- **Share API**: Native sharing capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- npm or yarn
- Expo Go app on your mobile device
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd react-native-pokedex

# Install dependencies
npm install

# Start the development server
npm start

# Or use tunnel mode for remote connections
npm run start:tunnel

# Clear cache if needed
npm run start:clear
```

### Running on Device

1. Install **Expo Go** from App Store or Play Store
2. Scan the QR code displayed in terminal
3. Wait for the bundle to load
4. Enjoy exploring Pokemon!

### Running on Simulator

```bash
# iOS
npm run ios

# Android
npm run android
```

## 📖 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── PokemonCard.js          # Animated Pokemon card
│   ├── PokemonCardPlaceholder.js
│   ├── TypeFilter.js           # Type filter chips
│   ├── TypeEffectiveness.js    # Type chart display
│   ├── EvolutionChain.js       # Evolution tree
│   ├── SearchBar.js
│   ├── SortModal.js
│   ├── StatBar.js
│   ├── LoadingSpinner.js
│   └── ErrorBoundary.js
├── screens/             # Main app screens
│   ├── HomeScreen.js           # Browse all Pokemon
│   ├── PokemonDetailsScreen.js # Detailed Pokemon view
│   ├── FavoritesScreen.js      # Favorited Pokemon
│   └── TeamBuilderScreen.js    # Team management
├── navigation/          # Navigation configuration
│   └── AppNavigator.js
├── hooks/              # Custom React Query hooks
│   └── usePokemonQueries.js    # Data fetching hooks
├── services/           # API services
│   └── pokemonApi.js
├── utils/              # Utility functions
│   ├── shareUtils.js           # Share functionality
└── constants/          # App constants
    ├── api.js
    └── colors.js
```

## 🎯 Key Implementation Highlights

### React Query Integration
- **Smart Caching**: 10-minute stale time, 60-minute garbage collection
- **Prefetching**: Adjacent Pokemon prefetched for instant navigation
- **Progressive Loading**: Show cached data immediately, update in background
- **Infinite Queries**: Efficient pagination with automatic load more

### Performance Optimizations
- **Memoization**: `React.memo`, `useCallback`, `useMemo` throughout
- **FlatList Props**: Optimized rendering with proper configurations
- **Native Animations**: All animations use `useNativeDriver: true`
- **Image Optimization**: Proper sizing and `resizeMode` for sprites

### Data Flow
```
PokeAPI → pokemonApi.js → React Query Hooks → Screens/Components
                ↓
           AsyncStorage (Favorites & Team)
```

### State Management
- **Server State**: React Query for API data
- **Local State**: AsyncStorage for favorites and team
- **Component State**: React hooks for UI state

## 🎨 Design System

### Colors
- **Primary Red**: #DC0A2D (Pokemon brand color)
- **Type Colors**: 18 distinct colors for Pokemon types
- **Neutrals**: Clean grays for text and backgrounds
- **Dynamic**: Type-based gradients in detail screen

### Typography
- **Headers**: Bold, 28-32px
- **Body**: Regular, 14-16px
- **Labels**: 10-12px for secondary info

### Spacing
- Consistent 8px grid system
- Cards: 12px padding, 12px margins
- Sections: 24px spacing

## 📊 API Usage

### Endpoints
- `GET /pokemon?offset={n}&limit={n}` - Pokemon list
- `GET /pokemon/{id}` - Pokemon details
- `GET /pokemon-species/{id}` - Species data
- `GET /evolution-chain/{id}` - Evolution data
- `GET /move/{id}` - Move information

### Rate Limiting
- 60-second timeout for slow connections
- Smart retry logic (max 2 retries)
- Graceful error handling

## 🌟 App Highlights

### New Features (Recently Added)
- ✅ **Advanced Filters Modal** - Filter by generation (I-IX), height/weight ranges, legendary/mythical status
- ✅ **Compare Mode** - Side-by-side Pokemon comparison with stat bars and type advantages
- ✅ **Dark Mode** - Beautiful dark theme with persistent preference and theme toggle button
- ✅ **Type Filtering** - Visible type chips with improved styling

### Quality Improvements
- Removed shiny toggle (simplified UI)
- Enhanced type filter visibility
- Improved theme consistency across all screens
- Better color contrast in dark mode

## 🐛 Known Issues

None at the moment! 🎉

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Credits

- Pokemon data from [PokeAPI](https://pokeapi.co/)
- Official Pokemon artwork and sprites
- Pokemon cries from PokeAPI GitHub repository
- Built with ❤️ using React Native and Expo

## 📞 Support

If you encounter any issues:
1. Try `npm run start:clear` to clear Metro cache
2. Use `npm run start:tunnel` if local network issues
3. Check Node.js version (24+ required)
4. Verify Expo Go app is up to date

---

**Made with ⚡ by a Pokemon Trainer**

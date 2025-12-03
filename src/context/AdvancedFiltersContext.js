import React, { createContext, useContext, useState } from 'react';

const AdvancedFiltersContext = createContext();

export const useAdvancedFilters = () => {
  const context = useContext(AdvancedFiltersContext);
  if (!context) {
    throw new Error('useAdvancedFilters must be used within an AdvancedFiltersProvider');
  }
  return context;
};

export const AdvancedFiltersProvider = ({ children }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    generations: [],
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: '',
    isLegendary: false,
    isMythical: false,
    hasEvolution: false,
  });

  const openAdvancedFilters = () => setShowAdvancedFilters(true);
  const closeAdvancedFilters = () => setShowAdvancedFilters(false);

  const value = {
    showAdvancedFilters,
    openAdvancedFilters,
    closeAdvancedFilters,
    advancedFilters,
    setAdvancedFilters,
  };

  return (
    <AdvancedFiltersContext.Provider value={value}>
      {children}
    </AdvancedFiltersContext.Provider>
  );
};

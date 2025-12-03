// Legendary Pokemon IDs (hardcoded for performance)
// These are TRUE legendaries only - NOT mythical Pokemon
export const LEGENDARY_POKEMON_IDS = [
  // Gen 1: Legendary Birds + Mewtwo (NOT Mew - Mew is Mythical)
  144, 145, 146, 150,
  // Gen 2: Legendary Beasts + Tower Duo
  243, 244, 245, 249, 250,
  // Gen 3: Regis + Eon Duo + Weather Trio (NOT Jirachi/Deoxys - they are Mythical)
  377, 378, 379, 380, 381, 382, 383, 384,
  // Gen 4: Lake Trio + Creation Trio + Heatran, Regigigas, Giratina, Cresselia (NOT Phione/Manaphy/Darkrai/Shaymin/Arceus - Mythical)
  480, 481, 482, 483, 484, 485, 486, 487, 488,
  // Gen 5: Swords of Justice + Forces of Nature + Tao Trio (NOT Victini/Keldeo/Meloetta/Genesect - Mythical)
  638, 639, 640, 641, 642, 643, 644, 645, 646,
  // Gen 6: Aura Trio (NOT Diancie/Hoopa/Volcanion - Mythical)
  716, 717, 718,
  // Gen 7: Tapu guardians + Cosmog line + Necrozma + Ultra Beasts (NOT Magearna/Marshadow/Zeraora/Meltan/Melmetal - Mythical)
  785, 786, 787, 788, 789, 790, 791, 792, 800,
  // Gen 8: Zacian, Zamazenta, Eternatus, Kubfu, Urshifu, Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
  888, 889, 890, 891, 892, 894, 895, 896, 897, 898,
  // Gen 9: Koraidon, Miraidon, etc.
  1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1024, 1025,
];

// Mythical Pokemon IDs (hardcoded for performance)
// These are special event-only Pokemon distinct from Legendaries
export const MYTHICAL_POKEMON_IDS = [
  151,  // Mew (Gen 1)
  251,  // Celebi (Gen 2)
  385, 386,  // Jirachi, Deoxys (Gen 3)
  489, 490, 491, 492, 493,  // Phione, Manaphy, Darkrai, Shaymin, Arceus (Gen 4)
  494, 647, 648, 649,  // Victini, Keldeo, Meloetta, Genesect (Gen 5)
  719, 720, 721,  // Diancie, Hoopa, Volcanion (Gen 6)
  801, 802, 807, 808, 809,  // Magearna, Marshadow, Zeraora, Meltan, Melmetal (Gen 7)
  893,  // Zarude (Gen 8)
  1025, // Pecharunt (Gen 9)
];

// Generation metadata for UI
export const GENERATIONS = [
  { id: 1, name: 'Gen I', range: '1-151' },
  { id: 2, name: 'Gen II', range: '152-251' },
  { id: 3, name: 'Gen III', range: '252-386' },
  { id: 4, name: 'Gen IV', range: '387-493' },
  { id: 5, name: 'Gen V', range: '494-649' },
  { id: 6, name: 'Gen VI', range: '650-721' },
  { id: 7, name: 'Gen VII', range: '722-809' },
  { id: 8, name: 'Gen VIII', range: '810-905' },
  { id: 9, name: 'Gen IX', range: '906-1010' },
];





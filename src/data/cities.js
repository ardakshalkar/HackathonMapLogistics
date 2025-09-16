// Major cities dataset for search functionality
export const cities = [
  // Kazakhstan
  { name: "Almaty", country: "Kazakhstan", lat: 43.2380, lng: 76.9452 },
  { name: "Nur-Sultan", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
  { name: "Astana", country: "Kazakhstan", lat: 51.1694, lng: 71.4491 },
  { name: "Shymkent", country: "Kazakhstan", lat: 42.3000, lng: 69.5980 },
  { name: "Aktobe", country: "Kazakhstan", lat: 50.2839, lng: 57.1670 },
  { name: "Taraz", country: "Kazakhstan", lat: 42.9000, lng: 71.3667 },
  { name: "Pavlodar", country: "Kazakhstan", lat: 52.2978, lng: 76.9478 },
  { name: "Ust-Kamenogorsk", country: "Kazakhstan", lat: 49.9480, lng: 82.6279 },
  { name: "Semey", country: "Kazakhstan", lat: 50.4119, lng: 80.2275 },
  { name: "Atyrau", country: "Kazakhstan", lat: 47.1164, lng: 51.8815 },
  { name: "Kostanay", country: "Kazakhstan", lat: 53.2133, lng: 63.6246 },
  { name: "Kyzylorda", country: "Kazakhstan", lat: 44.8479, lng: 65.5093 },
  { name: "Aktau", country: "Kazakhstan", lat: 43.6564, lng: 51.1735 },
  { name: "Petropavl", country: "Kazakhstan", lat: 54.8667, lng: 69.1500 },
  { name: "Oral", country: "Kazakhstan", lat: 51.2333, lng: 51.3667 },
  { name: "Temirtau", country: "Kazakhstan", lat: 50.0548, lng: 72.9636 },
  { name: "Turkestan", country: "Kazakhstan", lat: 43.2975, lng: 68.2517 },
  { name: "Karaganda", country: "Kazakhstan", lat: 49.8047, lng: 73.1094 },

  // Russia
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6176 },
  { name: "St. Petersburg", country: "Russia", lat: 59.9311, lng: 30.3609 },
  { name: "Novosibirsk", country: "Russia", lat: 55.0084, lng: 82.9357 },
  { name: "Yekaterinburg", country: "Russia", lat: 56.8431, lng: 60.6454 },
  { name: "Nizhny Novgorod", country: "Russia", lat: 56.2965, lng: 43.9361 },
  { name: "Kazan", country: "Russia", lat: 55.8304, lng: 49.0661 },
  { name: "Chelyabinsk", country: "Russia", lat: 55.1644, lng: 61.4368 },
  { name: "Omsk", country: "Russia", lat: 54.9885, lng: 73.3242 },
  { name: "Samara", country: "Russia", lat: 53.2001, lng: 50.1500 },
  { name: "Rostov-on-Don", country: "Russia", lat: 47.2357, lng: 39.7015 },
  { name: "Ufa", country: "Russia", lat: 54.7388, lng: 55.9721 },
  { name: "Krasnoyarsk", country: "Russia", lat: 56.0184, lng: 92.8672 },
  { name: "Perm", country: "Russia", lat: 58.0105, lng: 56.2502 },
  { name: "Voronezh", country: "Russia", lat: 51.6720, lng: 39.1843 },
  { name: "Volgograd", country: "Russia", lat: 48.7080, lng: 44.5133 },

  // Central Asia
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lng: 69.2401 },
  { name: "Samarkand", country: "Uzbekistan", lat: 39.6270, lng: 66.9750 },
  { name: "Bukhara", country: "Uzbekistan", lat: 39.7675, lng: 64.4286 },
  { name: "Bishkek", country: "Kyrgyzstan", lat: 42.8746, lng: 74.5698 },
  { name: "Osh", country: "Kyrgyzstan", lat: 40.5283, lng: 72.7985 },
  { name: "Dushanbe", country: "Tajikistan", lat: 38.5358, lng: 68.7791 },
  { name: "Ashgabat", country: "Turkmenistan", lat: 37.9601, lng: 58.3261 },

  // Europe
  { name: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050 },
  { name: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lng: -3.7038 },
  { name: "Rome", country: "Italy", lat: 41.9028, lng: 12.4964 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lng: 16.3738 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lng: 21.0122 },
  { name: "Prague", country: "Czech Republic", lat: 50.0755, lng: 14.4378 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lng: 19.0402 },

  // Asia
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503 },
  { name: "Beijing", country: "China", lat: 39.9042, lng: 116.4074 },
  { name: "Shanghai", country: "China", lat: 31.2304, lng: 121.4737 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lng: 126.9780 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Mumbai", country: "India", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi", country: "India", lat: 28.7041, lng: 77.1025 },
  { name: "Bangalore", country: "India", lat: 12.9716, lng: 77.5946 },

  // Americas
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lng: -99.1332 },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6118, lng: -58.3960 },

  // Africa & Middle East
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lng: 46.6753 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lng: 51.3890 },
  { name: "Baku", country: "Azerbaijan", lat: 40.4093, lng: 49.8671 },
  { name: "Tbilisi", country: "Georgia", lat: 41.7151, lng: 44.8271 },
  { name: "Yerevan", country: "Armenia", lat: 40.1792, lng: 44.4991 }
];

// Function to search cities by name
export const searchCities = (query, limit = 10) => {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return cities
    .filter(city => 
      city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery)
    )
    .sort((a, b) => {
      // Prioritize exact matches and matches at the beginning
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      if (aName.startsWith(normalizedQuery) && !bName.startsWith(normalizedQuery)) return -1;
      if (!aName.startsWith(normalizedQuery) && bName.startsWith(normalizedQuery)) return 1;
      
      return aName.localeCompare(bName);
    })
    .slice(0, limit);
};

// Function to get city by exact name
export const getCityByName = (name) => {
  return cities.find(city => 
    city.name.toLowerCase() === name.toLowerCase()
  );
};

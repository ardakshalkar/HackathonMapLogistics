import React, { useState, useEffect, useRef } from 'react';
import { searchCities } from '../data/cities';
import './SearchableLocationInput.css';

const SearchableLocationInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Search for a city...",
  useYandexGeocoding = true 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Update query when value changes
  useEffect(() => {
    if (value && value.name) {
      setQuery(value.name);
    }
  }, [value]);

  // Yandex Geocoding API search
  const searchWithYandexGeocoding = async (searchQuery) => {
    if (!window.ymaps || !searchQuery || searchQuery.length < 3) return [];

    try {
      return new Promise((resolve) => {
        window.ymaps.geocode(searchQuery, {
          results: 8,
          kind: 'locality' // Only cities
        }).then((res) => {
          const results = [];
          const geoObjects = res.geoObjects;
          
          for (let i = 0; i < geoObjects.getLength(); i++) {
            const obj = geoObjects.get(i);
            const coords = obj.geometry.getCoordinates();
            const name = obj.getAddressLine();
            const description = obj.properties.get('description') || '';
            
            results.push({
              name: name,
              description: description,
              lat: coords[0],
              lng: coords[1],
              source: 'yandex'
            });
          }
          
          resolve(results);
        });
      });
    } catch (error) {
      console.error('Yandex geocoding error:', error);
      return [];
    }
  };

  // Combined search function
  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    let results = [];

    // First, search local dataset
    const localResults = searchCities(searchQuery, 5).map(city => ({
      ...city,
      displayName: `${city.name}, ${city.country}`,
      source: 'local'
    }));

    results = [...localResults];

    // If Yandex geocoding is enabled and available, add those results
    if (useYandexGeocoding && window.ymaps) {
      try {
        const yandexResults = await searchWithYandexGeocoding(searchQuery);
        
        // Filter out duplicates and add Yandex results
        const filteredYandexResults = yandexResults.filter(yandexResult => 
          !results.some(localResult => 
            Math.abs(localResult.lat - yandexResult.lat) < 0.1 &&
            Math.abs(localResult.lng - yandexResult.lng) < 0.1
          )
        );

        results = [...results, ...filteredYandexResults];
      } catch (error) {
        console.error('Error with Yandex geocoding:', error);
      }
    }

    setSuggestions(results.slice(0, 10));
    setIsLoading(false);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      performSearch(newQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const location = {
      name: suggestion.displayName || suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng,
      source: suggestion.source
    };
    
    setQuery(location.name);
    setIsOpen(false);
    onChange(location);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (query) {
      performSearch(query);
    }
  };

  // Handle input blur (with delay for click events)
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="searchable-location-input">
      <label className="location-label">{label}</label>
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="location-input"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="suggestion-name">
                  {suggestion.displayName || suggestion.name}
                </div>
                {suggestion.description && (
                  <div className="suggestion-description">
                    {suggestion.description}
                  </div>
                )}
                <div className="suggestion-source">
                  {suggestion.source === 'local' ? '📍 Database' : '🌐 Yandex'}
                </div>
              </div>
            ))}
          </div>
        )}

        {isOpen && !isLoading && suggestions.length === 0 && query.length >= 2 && (
          <div className="suggestions-dropdown">
            <div className="no-results">
              No cities found for "{query}"
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableLocationInput;

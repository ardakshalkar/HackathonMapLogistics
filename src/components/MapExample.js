import React, { useState } from 'react';
import YandexMapPath from './YandexMapPath';
import SearchableLocationInput from './SearchableLocationInput';
import './MapExample.css';

const MapExample = () => {
  const [startLocation, setStartLocation] = useState({
    lat: 55.7558,
    lng: 37.6176,
    name: 'Moscow, Russia'
  });

  const [endLocation, setEndLocation] = useState({
    lat: 59.9311,
    lng: 30.3609,
    name: 'St. Petersburg, Russia'
  });

  const predefinedLocations = [
    { lat: 55.7558, lng: 37.6176, name: 'Moscow, Russia' },
    { lat: 59.9311, lng: 30.3609, name: 'St. Petersburg, Russia' },
    { lat: 43.2380, lng: 76.9452, name: 'Almaty, Kazakhstan' },
    { lat: 51.1694, lng: 71.4491, name: 'Nur-Sultan, Kazakhstan' },
    { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }
  ];

  const handleMapReady = (map) => {
    console.log('Map is ready:', map);
  };

  const handleRouteReady = (route) => {
    console.log('Route is ready:', route);
  };

  return (
    <div className="map-example">
      <div className="map-example-header">
        <h1>Yandex Maps Path Component</h1>
        <p>Select two locations to see the path between them</p>
      </div>

      <div className="map-example-controls">
        <div className="location-controls">
          <div className="location-group">
            <SearchableLocationInput
              label="Start Location"
              value={startLocation}
              onChange={(location) => setStartLocation(location)}
              placeholder="Search for start city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(0, 4).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => setStartLocation(location)}
                  >
                    {location.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="location-group">
            <SearchableLocationInput
              label="End Location"
              value={endLocation}
              onChange={(location) => setEndLocation(location)}
              placeholder="Search for destination city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(4, 8).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => setEndLocation(location)}
                  >
                    {location.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="map-container">
        <YandexMapPath
          startLocation={startLocation}
          endLocation={endLocation}
          width="100%"
          height="500px"
          zoom={6}
          onMapReady={handleMapReady}
          onRouteReady={handleRouteReady}
        />
      </div>

      <div className="map-info">
        <h3>Current Route</h3>
        <p><strong>From:</strong> {startLocation.name} ({startLocation.lat}, {startLocation.lng})</p>
        <p><strong>To:</strong> {endLocation.name} ({endLocation.lat}, {endLocation.lng})</p>
      </div>
    </div>
  );
};

export default MapExample;

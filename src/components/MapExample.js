import React, { useState } from 'react';
import YandexMapPath from './YandexMapPath';
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

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const predefinedLocations = [
    { lat: 55.7558, lng: 37.6176, name: 'Moscow, Russia' },
    { lat: 59.9311, lng: 30.3609, name: 'St. Petersburg, Russia' },
    { lat: 40.7128, lng: -74.0060, name: 'New York, USA' },
    { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }
  ];

  const handleLocationChange = (type, location) => {
    if (type === 'start') {
      setStartLocation(location);
    } else {
      setEndLocation(location);
    }
  };

  const handleCustomLocation = (type, coords) => {
    const [lat, lng] = coords.split(',').map(coord => parseFloat(coord.trim()));
    if (!isNaN(lat) && !isNaN(lng)) {
      const location = { lat, lng, name: `Custom ${type}` };
      if (type === 'start') {
        setStartLocation(location);
      } else {
        setEndLocation(location);
      }
    }
  };

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
            <h3>Start Location</h3>
            <div className="location-selector">
              <select 
                value={startLocation.name} 
                onChange={(e) => {
                  const location = predefinedLocations.find(loc => loc.name === e.target.value);
                  if (location) handleLocationChange('start', location);
                }}
              >
                {predefinedLocations.map((location, index) => (
                  <option key={index} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="custom-coords">
              <input
                type="text"
                placeholder="Custom coordinates (lat, lng)"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <button 
                onClick={() => handleCustomLocation('start', customStart)}
                disabled={!customStart}
              >
                Set Start
              </button>
            </div>
          </div>

          <div className="location-group">
            <h3>End Location</h3>
            <div className="location-selector">
              <select 
                value={endLocation.name} 
                onChange={(e) => {
                  const location = predefinedLocations.find(loc => loc.name === e.target.value);
                  if (location) handleLocationChange('end', location);
                }}
              >
                {predefinedLocations.map((location, index) => (
                  <option key={index} value={location.name}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="custom-coords">
              <input
                type="text"
                placeholder="Custom coordinates (lat, lng)"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button 
                onClick={() => handleCustomLocation('end', customEnd)}
                disabled={!customEnd}
              >
                Set End
              </button>
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

import React, { useState } from 'react';
import YandexMapPath from './YandexMapPath';
import SearchableLocationInput from './SearchableLocationInput';
import RouteInfo from './RouteInfo';
import RoutePrediction from './RoutePrediction';
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

  const [waypoints, setWaypoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Force map recreation

  // Clear route data when locations change
  const handleStartLocationChange = (location) => {
    console.log('=== START LOCATION CHANGE ===');
    console.log('New start location:', location);
    console.log('Previous start location:', startLocation);
    console.log('Current waypoints before clear:', waypoints.length);
    console.log('Current routeInfo before clear:', !!routeInfo);
    
    setWaypoints([]);
    setRouteInfo(null);
    setStartLocation(location);
    
    console.log('State cleared and new location set');
  };

  const handleEndLocationChange = (location) => {
    console.log('=== END LOCATION CHANGE ===');
    console.log('New end location:', location);
    console.log('Previous end location:', endLocation);
    console.log('Current waypoints before clear:', waypoints.length);
    console.log('Current routeInfo before clear:', !!routeInfo);
    
    setWaypoints([]);
    setRouteInfo(null);
    setEndLocation(location);
    
    console.log('State cleared and new location set');
  };

  const predefinedLocations = [
    { lat: 55.7558, lng: 37.6176, name: 'Moscow, Russia' },
    { lat: 59.9311, lng: 30.3609, name: 'St. Petersburg, Russia' },
    { lat: 43.2380, lng: 76.9452, name: 'Almaty, Kazakhstan' },
    { lat: 51.1694, lng: 71.4491, name: 'Nur-Sultan, Kazakhstan' },
    { lat: 41.0082, lng: 28.9784, name: 'Istanbul, Turkey' },
    { lat: 51.5074, lng: -0.1278, name: 'London, UK' },
    { lat: 48.8566, lng: 2.3522, name: 'Paris, France' },
    { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }
  ];

  const handleMapReady = (map) => {
    console.log('Map is ready:', map);
  };

  const handleRouteReady = (route, waypoints, routeInfo) => {
    console.log('=== HANDLE ROUTE READY CALLED ===');
    console.log('Route parameter:', route);
    console.log('Waypoints parameter:', waypoints);
    console.log('RouteInfo parameter:', routeInfo);
    console.log('Waypoints received:', waypoints?.length || 0);
    console.log('Route info received:', !!routeInfo);
    console.log('Current start location:', startLocation?.name);
    console.log('Current end location:', endLocation?.name);
    
    if (!waypoints || waypoints.length === 0) {
      console.error('ERROR: No waypoints received in handleRouteReady!');
      console.log('This means waypoints were lost between extraction and callback');
      return;
    }
    
    // Update waypoints with current location names
    const updatedWaypoints = waypoints?.map((waypoint, index) => {
      if (waypoint.type === 'start') {
        return { ...waypoint, name: startLocation?.name || waypoint.name };
      } else if (waypoint.type === 'end') {
        return { ...waypoint, name: endLocation?.name || waypoint.name };
      }
      return waypoint;
    }) || [];
    
    console.log('Updated waypoints being set:', updatedWaypoints);
    setWaypoints(updatedWaypoints);
    setRouteInfo(routeInfo || null);
  };

  const handleRefreshRoute = () => {
    console.log('=== MANUAL ROUTE REFRESH TRIGGERED ===');
    console.log('Current locations:', { start: startLocation?.name, end: endLocation?.name });
    console.log('Current waypoints:', waypoints.map(w => ({ name: w.name, lat: w.lat, lng: w.lng, type: w.type })));
    console.log('Current routeInfo:', routeInfo);
    
    // Clear everything aggressively
    setWaypoints([]);
    setRouteInfo(null);
    
    // Clear any potential browser storage
    if (typeof Storage !== "undefined") {
      localStorage.removeItem('yandex_route_cache');
      sessionStorage.removeItem('yandex_route_cache');
      console.log('Cleared browser storage caches');
    }
    
    // Force complete component recreation
    console.log('Forcing complete map recreation...');
    setMapKey(Date.now());
    
    // Force a complete refresh by triggering location change handlers
    setTimeout(() => {
      console.log('Triggering location changes...');
      handleStartLocationChange({ ...startLocation });
      setTimeout(() => {
        handleEndLocationChange({ ...endLocation });
      }, 100);
    }, 200);
  };

  return (
    <div className="map-example">
      <div className="map-example-header">
        <h1>Yandex Maps Path Component</h1>
        <p>Select two locations to see the path between them and 8-hour predictions</p>
        <button 
          onClick={handleRefreshRoute}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          🔄 Refresh Route & Predictions
        </button>
      </div>

      <div className="map-example-controls">
        <div className="location-controls">
          <div className="location-group">
            <SearchableLocationInput
              label="Start Location"
              value={startLocation}
              onChange={handleStartLocationChange}
              placeholder="Search for start city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(0, 4).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => handleStartLocationChange(location)}
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
              onChange={handleEndLocationChange}
              placeholder="Search for destination city..."
            />
            
            <div className="quick-select">
              <label>Quick select:</label>
              <div className="quick-buttons">
                {predefinedLocations.slice(4, 8).map((location, index) => (
                  <button
                    key={index}
                    className="quick-button"
                    onClick={() => handleEndLocationChange(location)}
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
          key={mapKey}
          startLocation={startLocation}
          endLocation={endLocation}
          width="100%"
          height="500px"
          zoom={6}
          onMapReady={handleMapReady}
          onRouteReady={handleRouteReady}
        />
      </div>

      <RouteInfo waypoints={waypoints} routeInfo={routeInfo} />
      
      <RoutePrediction waypoints={waypoints} routeInfo={routeInfo} />
    </div>
  );
};

export default MapExample;

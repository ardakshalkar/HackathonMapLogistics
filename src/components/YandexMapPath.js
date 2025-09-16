import React, { useEffect, useRef, useState } from 'react';
import './YandexMapPath.css';

const YandexMapPath = ({ 
  startLocation, 
  endLocation, 
  width = '100%', 
  height = '400px',
  zoom = 10,
  onMapReady = () => {},
  onRouteReady = () => {}
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Callback ref to ensure we know when the element is mounted
  const setMapRef = (element) => {
    console.log('setMapRef called with:', element);
    mapRef.current = element;
    if (element && !initialized) {
      console.log('Map container element set successfully');
      // Trigger initialization when container is ready
      setTimeout(() => {
        if (!initialized) {
          initializeMapWhenReady();
        }
      }, 100);
    }
  };

  const initializeMapWhenReady = () => {
    if (initialized) {
      console.log('Map already initialized, skipping...');
      return;
    }

    try {
      // Find the container element
      let container = mapRef.current;
      if (!container) {
        console.log('Container not found in ref');
        return;
      }

      console.log('Container found:', container);

      // Get container dimensions
      const rect = container.getBoundingClientRect();
      console.log('Container dimensions:', rect.width, 'x', rect.height);
      
      if (rect.width === 0 || rect.height === 0) {
        setError(`Map container has no dimensions: ${rect.width}x${rect.height}. Check CSS styling.`);
        setIsLoading(false);
        return;
      }

      if (!window.ymaps) {
        console.log('Waiting for Yandex Maps API...');
        setTimeout(initializeMapWhenReady, 100);
        return;
      }

      window.ymaps.ready(() => {
        if (!container || map) {
          return; // Prevent double initialization if map already exists
        }

        setInitialized(true); // Mark as initialized

        const center = startLocation ? 
          [startLocation.lat, startLocation.lng] : 
          [55.7558, 37.6176]; // Default to Moscow

        console.log('Creating map with center:', center);

        const newMap = new window.ymaps.Map(container, {
          center: center,
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
        });

        console.log('Map created successfully');
        setMap(newMap);
        setIsLoading(false);
        onMapReady(newMap);
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Error initializing map: ' + err.message);
      setIsLoading(false);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (map) {
        try {
          map.destroy();
        } catch (err) {
          console.warn('Error destroying map:', err);
        }
      }
    };
  }, [map]);

  // Update route when locations change
  useEffect(() => {
    if (map && startLocation && endLocation) {
      createRoute();
    }
  }, [map, startLocation, endLocation]);


  const createRoute = () => {
    if (!map || !startLocation || !endLocation) return;

    // Clear existing route
    if (route) {
      map.geoObjects.remove(route);
    }

    // Create multi-route
    const multiRoute = new window.ymaps.multiRouter.MultiRoute({
      referencePoints: [
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ],
      params: {
        routingMode: 'auto' // 'auto', 'walking', 'driving', 'transit'
      }
    }, {
      boundsAutoApply: true,
      routeActiveStrokeWidth: 6,
      routeActiveStrokeColor: '#003dff',
      routeStrokeWidth: 4,
      routeStrokeColor: '#666666'
    });

    // Add route to map
    map.geoObjects.add(multiRoute);
    setRoute(multiRoute);

    // Add markers for start and end points
    const startMarker = new window.ymaps.Placemark(
      [startLocation.lat, startLocation.lng],
      {
        balloonContent: `Start: ${startLocation.name || 'Start Location'}`,
        iconCaption: 'Start'
      },
      {
        preset: 'islands#greenDotIcon',
        iconColor: '#00ff00'
      }
    );

    const endMarker = new window.ymaps.Placemark(
      [endLocation.lat, endLocation.lng],
      {
        balloonContent: `End: ${endLocation.name || 'End Location'}`,
        iconCaption: 'End'
      },
      {
        preset: 'islands#redDotIcon',
        iconColor: '#ff0000'
      }
    );

    map.geoObjects.add(startMarker);
    map.geoObjects.add(endMarker);

    // Fit map to show the entire route
    multiRoute.model.events.add('requestsuccess', () => {
      const routes = multiRoute.getRoutes();
      if (routes.length > 0) {
        const route = routes.get(0);
        const properties = route.properties.getAll();
        
        if (properties.boundedBy) {
          map.setBounds(properties.boundedBy, {
            checkZoomRange: true,
            zoomMargin: 50
          });
        }
      }
      onRouteReady(multiRoute);
    });

    // Handle route errors
    multiRoute.model.events.add('requesterror', (event) => {
      setError('Error creating route: ' + event.get('error').message);
    });
  };

  return (
    <div className="yandex-map-container">
      <div 
        ref={setMapRef} 
        id={`yandex-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
        className="yandex-map" 
        style={{ width, height }}
      >
        {isLoading && (
          <div className="map-loading-overlay">
            <div className="loading-spinner">
              Loading map...
              <br />
              <small>Yandex Maps API: {window.ymaps ? 'Loaded' : 'Loading...'}</small>
              <br />
              <small>Container: {mapRef.current ? 'Ready' : 'Waiting...'}</small>
            </div>
          </div>
        )}
        
        {error && (
          <div className="map-error-overlay">
            <div className="error-message">
              <h3>Map Error</h3>
              <p>{error}</p>
              {error.includes('API key') && (
                <div className="api-key-help">
                  <p><strong>To fix this:</strong></p>
                  <ol>
                    <li>Get a valid API key from <a href="https://developer.tech.yandex.ru/" target="_blank" rel="noopener noreferrer">Yandex Developer Console</a></li>
                    <li>Replace <code>YOUR_API_KEY</code> in <code>public/index.html</code></li>
                    <li>Restart the application</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YandexMapPath;

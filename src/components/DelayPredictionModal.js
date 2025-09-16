import React, { useState } from 'react';
import './DelayPredictionModal.css';

const DelayPredictionModal = ({ isOpen, onClose, waypoints, routeInfo }) => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState('');
  const [newsData, setNewsData] = useState('');
  const [error, setError] = useState('');

  const handlePredictDelay = async () => {
    setLoading(true);
    setError('');
    setWeatherData('');
    setNewsData('');

    try {
      // Call weather API first
      console.log('Calling weather API...');
      const weatherResponse = await callWeatherAPI(waypoints, routeInfo);
      setWeatherData(weatherResponse);
      console.log('Weather API response received, calling news API...');
      
      // Only call news API after weather API completes
      const newsResponse = await callNewsAPI(waypoints);
      setNewsData(newsResponse);
      console.log('News API response received');
      
    } catch (err) {
      setError('Failed to get delay predictions. Please try again.');
      console.error('Delay prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format waypoints for weather API (route format)
  const formatRouteForWeatherAPI = (waypoints) => {
    if (!waypoints || waypoints.length === 0) return '';
    return waypoints
      .filter(wp => wp.lat && wp.lng)
      .map(wp => `${wp.lat},${wp.lng}`)
      .join(';');
  };

  // Format waypoints for news API (coords array)
  const formatCoordsForNewsAPI = (waypoints) => {
    if (!waypoints || waypoints.length === 0) return [];
    return waypoints
      .filter(wp => wp.lat && wp.lng)
      .map(wp => ({ lat: wp.lat, lon: wp.lng }));
  };

  // Call Weather and Other Conditions API
  const callWeatherAPI = async (waypoints, routeInfo) => {
    const route = formatRouteForWeatherAPI(waypoints);
    if (!route) throw new Error('No valid waypoints for weather API');

    const response = await fetch('http://194.31.159.170:9000/api/plugins/v1/8bcd54b558aab7237b63df2ea650c125', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Analyze weather conditions and potential delays for transportation route. Route distance: ${routeInfo?.totalDistanceText || 'unknown'}, duration: ${routeInfo?.totalDurationText || 'unknown'}`,
        language: 'russian',
        data: {
          route: route,
          product: 'logistics transportation'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.text || jsonResponse;
  };

  // Call News Summarization API
  const callNewsAPI = async (waypoints) => {
    const coords = formatCoordsForNewsAPI(waypoints);
    if (coords.length === 0) throw new Error('No valid coordinates for news API');

    const response = await fetch('http://194.31.159.170:9000/api/plugins/v1/148d7eba8f02a98eed0003a6f797a735', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Summarize recent news and events that might affect transportation and logistics in these locations',
        language: 'russian',
        data: {
          coords: coords
        }
      })
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const jsonResponse = await response.json();
    return jsonResponse.text || jsonResponse;
  };

  // Format text with proper line breaks and basic markdown
  const formatResponseText = (text) => {
    if (!text) return '';
    
    // Convert \n to actual line breaks and apply basic markdown formatting
    return text
      .split('\\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Handle markdown formatting
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Italic
        line = line.replace(/^### (.*)/g, '<h3>$1</h3>'); // H3
        line = line.replace(/^## (.*)/g, '<h2>$1</h2>'); // H2
        line = line.replace(/^# (.*)/g, '<h1>$1</h1>'); // H1
        line = line.replace(/^- (.*)/g, '• $1'); // Bullet points
        return line;
      })
      .join('\n');
  };

  if (!isOpen) return null;

  return (
    <div className="delay-modal-overlay" onClick={onClose}>
      <div className="delay-modal-content" onClick={e => e.stopPropagation()}>
        <div className="delay-modal-header">
          <h3>🚛 Delay Prediction</h3>
          <button 
            className="delay-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="delay-modal-body">
          {!weatherData && !newsData && !loading && !error && (
            <div className="delay-initial-state">
              <p>Click the button below to analyze potential delays for your route.</p>
              <div className="route-summary">
                <strong>Route Summary:</strong>
                <ul>
                  <li>Distance: {routeInfo?.totalDistanceText || 'Unknown'}</li>
                  <li>Duration: {routeInfo?.totalDurationText || 'Unknown'}</li>
                  <li>Waypoints: {waypoints?.length || 0}</li>
                </ul>
              </div>
            </div>
          )}

          {loading && (
            <div className="delay-loading">
              <div className="delay-spinner"></div>
              <p>Analyzing route conditions...</p>
              <small>Getting weather conditions and news updates for your route</small>
            </div>
          )}

          {error && (
            <div className="delay-error">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {(weatherData || newsData) && (
            <div className="delay-results">
              {weatherData && (
                <div className="analysis-section">
                  <h4>🌤️ Weather & Conditions Analysis</h4>
                  <div className="delay-response weather-response">
                    <div 
                      className="formatted-text"
                      dangerouslySetInnerHTML={{ __html: formatResponseText(weatherData) }}
                    />
                  </div>
                </div>
              )}

              {newsData && (
                <div className="analysis-section">
                  <h4>📰 News & Events Summary</h4>
                  <div className="delay-response news-response">
                    <div 
                      className="formatted-text"
                      dangerouslySetInnerHTML={{ __html: formatResponseText(newsData) }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="delay-modal-footer">
          {!weatherData && !newsData && !loading && (
            <button 
              className="delay-predict-button"
              onClick={handlePredictDelay}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : '🔮 Predict Delays'}
            </button>
          )}
          
          {(weatherData || newsData) && (
            <button 
              className="delay-predict-button secondary"
              onClick={handlePredictDelay}
              disabled={loading}
            >
              🔄 Refresh Analysis
            </button>
          )}
          
          <button 
            className="delay-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DelayPredictionModal;

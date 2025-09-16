// Weather service for route weather forecasting
export class WeatherService {
  constructor() {
    // Using OpenWeatherMap API (free tier available)
    this.apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Get weather forecast for a specific location and time
  async getWeatherForecast(lat, lng, timestamp) {
    const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}_${timestamp}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      // For demo purposes, we'll use a mock weather service
      // In production, replace with actual OpenWeatherMap API call
      const weather = await this.getMockWeatherData(lat, lng, timestamp);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: weather,
        timestamp: Date.now()
      });
      
      return weather;
    } catch (error) {
      console.error('Weather API error:', error);
      return this.getDefaultWeatherData();
    }
  }

  // Mock weather data for demonstration
  async getMockWeatherData(lat, lng, timestamp) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    
    // Generate weather based on location and time
    const baseTemp = this.getBaseTemperature(lat, lng, dayOfYear);
    const temperature = baseTemp + this.getHourlyVariation(hour);
    const conditions = this.getWeatherConditions(lat, lng, dayOfYear, hour);
    const windSpeed = this.getWindSpeed(lat, lng, dayOfYear);
    const precipitation = this.getPrecipitation(lat, lng, dayOfYear, hour);
    
    return {
      temperature: Math.round(temperature),
      condition: conditions.main,
      description: conditions.description,
      windSpeed: Math.round(windSpeed),
      windDirection: this.getWindDirection(),
      humidity: Math.round(conditions.humidity),
      precipitation: Math.round(precipitation * 10) / 10,
      visibility: this.getVisibility(conditions.main),
      pressure: Math.round(conditions.pressure),
      icon: conditions.icon,
      timestamp: timestamp,
      location: { lat, lng }
    };
  }

  // Get base temperature based on latitude and season
  getBaseTemperature(lat, lng, dayOfYear) {
    const season = this.getSeason(dayOfYear);
    const latitudeFactor = Math.abs(lat) / 90; // 0 at equator, 1 at poles
    
    const baseTemps = {
      'spring': 15 - (latitudeFactor * 20),
      'summer': 25 - (latitudeFactor * 25),
      'autumn': 10 - (latitudeFactor * 15),
      'winter': -5 - (latitudeFactor * 30)
    };
    
    return baseTemps[season] + (Math.random() - 0.5) * 10;
  }

  // Get season based on day of year
  getSeason(dayOfYear) {
    if (dayOfYear < 80 || dayOfYear >= 355) return 'winter';
    if (dayOfYear < 172) return 'spring';
    if (dayOfYear < 266) return 'summer';
    return 'autumn';
  }

  // Get hourly temperature variation
  getHourlyVariation(hour) {
    const dailyVariation = [
      -8, -10, -9, -7, -5, -2, 2, 6, 10, 12, 13, 14, 15, 14, 12, 10, 8, 5, 2, -1, -3, -5, -6, -7
    ];
    return dailyVariation[hour] || 0;
  }

  // Get weather conditions
  getWeatherConditions(lat, lng, dayOfYear, hour) {
    const conditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d', humidity: 45, pressure: 1013 },
      { main: 'Clouds', description: 'few clouds', icon: '02d', humidity: 55, pressure: 1010 },
      { main: 'Clouds', description: 'scattered clouds', icon: '03d', humidity: 65, pressure: 1008 },
      { main: 'Clouds', description: 'broken clouds', icon: '04d', humidity: 70, pressure: 1005 },
      { main: 'Rain', description: 'light rain', icon: '10d', humidity: 80, pressure: 1000 },
      { main: 'Rain', description: 'moderate rain', icon: '10d', humidity: 85, pressure: 995 },
      { main: 'Snow', description: 'light snow', icon: '13d', humidity: 75, pressure: 1005 },
      { main: 'Fog', description: 'fog', icon: '50d', humidity: 90, pressure: 1015 }
    ];
    
    // Higher chance of rain in certain conditions
    const rainChance = this.getRainChance(lat, lng, dayOfYear, hour);
    const conditionIndex = rainChance > 0.7 ? 4 : Math.floor(Math.random() * 4);
    
    return conditions[conditionIndex];
  }

  // Calculate rain chance based on location and time
  getRainChance(lat, lng, dayOfYear, hour) {
    const season = this.getSeason(dayOfYear);
    const latitudeFactor = Math.abs(lat) / 90;
    
    const baseChance = {
      'spring': 0.3,
      'summer': 0.2,
      'autumn': 0.4,
      'winter': 0.1
    };
    
    return baseChance[season] + (Math.random() - 0.5) * 0.3;
  }

  // Get wind speed
  getWindSpeed(lat, lng, dayOfYear) {
    const baseSpeed = 5 + Math.random() * 10; // 5-15 km/h base
    const latitudeFactor = Math.abs(lat) / 90;
    return baseSpeed + (latitudeFactor * 5); // Higher winds at higher latitudes
  }

  // Get wind direction
  getWindDirection() {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  // Get precipitation amount
  getPrecipitation(lat, lng, dayOfYear, hour) {
    const rainChance = this.getRainChance(lat, lng, dayOfYear, hour);
    if (rainChance > 0.6) {
      return Math.random() * 5; // 0-5 mm
    }
    return 0;
  }

  // Get visibility based on weather condition
  getVisibility(condition) {
    const visibility = {
      'Clear': 15,
      'Clouds': 12,
      'Rain': 8,
      'Snow': 5,
      'Fog': 2
    };
    return visibility[condition] || 10;
  }

  // Default weather data for error cases
  getDefaultWeatherData() {
    return {
      temperature: 20,
      condition: 'Clear',
      description: 'clear sky',
      windSpeed: 5,
      windDirection: 'N',
      humidity: 50,
      precipitation: 0,
      visibility: 10,
      pressure: 1013,
      icon: '01d',
      timestamp: Date.now(),
      location: { lat: 0, lng: 0 }
    };
  }

  // Get weather for multiple route points
  async getRouteWeatherForecast(predictions) {
    const weatherPromises = predictions.map(async (prediction) => {
      const weather = await this.getWeatherForecast(
        prediction.lat, 
        prediction.lng, 
        prediction.time.getTime()
      );
      
      return {
        ...prediction,
        weather: weather
      };
    });
    
    return Promise.all(weatherPromises);
  }

  // Format weather data for display
  formatWeatherData(weather) {
    return {
      temperature: `${weather.temperature}°C`,
      condition: weather.description,
      wind: `${weather.windSpeed} km/h ${weather.windDirection}`,
      humidity: `${weather.humidity}%`,
      precipitation: weather.precipitation > 0 ? `${weather.precipitation} mm` : 'None',
      visibility: `${weather.visibility} km`,
      pressure: `${weather.pressure} hPa`
    };
  }
}

export default WeatherService;

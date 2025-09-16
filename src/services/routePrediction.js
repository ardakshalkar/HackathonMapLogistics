import { cities, searchCities } from '../data/cities';

// Route prediction service for logistics planning
export class RoutePredictionService {
  constructor() {
    // Speed configurations by truck type (km/h)
    this.speedByTruckType = {
      'light': 70,     // Light trucks - faster on highways
      'standard': 60,  // Standard trucks - balanced speed
      'heavy': 50      // Heavy trucks - slower due to weight
    };
    
    // Speed adjustments by route type
    this.speedAdjustments = {
      'highway': 1.2,    // 20% faster on highways
      'city': 0.7,       // 30% slower in cities
      'mountain': 0.8,   // 20% slower in mountains
      'default': 1.0     // Normal speed
    };
    
    this.breakDuration = 0.5; // hours - 30 minutes break every 8 hours
    this.maxDrivingHours = 11; // maximum driving hours per day (EU regulations)
    this.cityDetectionRadius = 50000; // 50km radius for city detection
  }

  // Get speed based on truck type and route conditions
  getAverageSpeed(truckType = 'standard', routeConditions = 'default') {
    const baseSpeed = this.speedByTruckType[truckType] || this.speedByTruckType['standard'];
    const adjustment = this.speedAdjustments[routeConditions] || this.speedAdjustments['default'];
    
    return baseSpeed * adjustment;
  }

  // Calculate predicted positions every 8 hours
  calculateTimeBasedPositions(waypoints, routeInfo, startTime = new Date(), truckType = 'standard', routeConditions = 'default') {
    if (!waypoints || waypoints.length === 0 || !routeInfo) {
      return [];
    }

    const totalDistance = routeInfo.totalDistance; // in meters
    const totalDuration = routeInfo.totalDuration; // in seconds
    const averageSpeed = this.getAverageSpeed(truckType, routeConditions);
    
    // Use Yandex Maps duration if available, otherwise calculate based on our speed
    const totalHours = totalDuration > 0 ? 
      totalDuration / 3600 : 
      (totalDistance / 1000) / averageSpeed; // convert to hours

    console.log(`Total route: ${(totalDistance / 1000).toFixed(1)} km, ${totalHours.toFixed(1)} hours`);
    console.log(`Truck type: ${truckType}, Speed: ${averageSpeed.toFixed(1)} km/h, Conditions: ${routeConditions}`);

    const predictions = [];
    let currentTime = new Date(startTime);
    let currentDistance = 0;
    let waypointIndex = 0;

    // Calculate distance between consecutive waypoints
    const waypointDistances = this.calculateWaypointDistances(waypoints);

    // Add initial position
    predictions.push({
      time: new Date(currentTime),
      distance: 0,
      waypointIndex: 0,
      lat: waypoints[0].lat,
      lng: waypoints[0].lng,
      type: 'start',
      estimatedArrival: null,
      drivingHours: 0,
      breakTime: 0
    });

    // Calculate positions every 8 hours
    let hoursElapsed = 0;
    const intervalHours = 8;

    while (hoursElapsed < totalHours && waypointIndex < waypoints.length - 1) {
      hoursElapsed += intervalHours;
      
      // Calculate break time (30 min every 8 hours)
      const breakTime = Math.floor(hoursElapsed / 8) * this.breakDuration;
      
      // Calculate effective driving time
      const effectiveDrivingTime = hoursElapsed - breakTime;
      
      // Calculate distance covered
      const distanceCovered = (effectiveDrivingTime / totalHours) * totalDistance;
      
      // Find the waypoint closest to this distance
      const { waypointIndex: newIndex, lat, lng, progress } = this.findWaypointAtDistance(
        waypoints, 
        waypointDistances, 
        distanceCovered
      );

      waypointIndex = newIndex;

      // Detect nearby cities
      const nearbyCity = this.findNearbyCity(lat, lng);

      // Calculate estimated arrival time
      const remainingDistance = totalDistance - distanceCovered;
      const remainingHours = remainingDistance / (averageSpeed * 1000); // convert km/h to m/s
      const estimatedArrival = new Date(currentTime.getTime() + (hoursElapsed + remainingHours) * 3600000);

      predictions.push({
        time: new Date(currentTime.getTime() + hoursElapsed * 3600000),
        distance: distanceCovered,
        waypointIndex: waypointIndex,
        lat: lat,
        lng: lng,
        type: 'prediction',
        estimatedArrival: estimatedArrival,
        drivingHours: effectiveDrivingTime,
        breakTime: breakTime,
        progress: progress,
        remainingDistance: remainingDistance,
        remainingHours: remainingHours,
        nearbyCity: nearbyCity,
        intervalHours: hoursElapsed
      });
    }

    // Add final destination
    const finalWaypoint = waypoints[waypoints.length - 1];
    const finalTime = new Date(currentTime.getTime() + totalHours * 3600000);
    
    predictions.push({
      time: finalTime,
      distance: totalDistance,
      waypointIndex: waypoints.length - 1,
      lat: finalWaypoint.lat,
      lng: finalWaypoint.lng,
      type: 'destination',
      estimatedArrival: finalTime,
      drivingHours: totalHours - (Math.floor(totalHours / 8) * this.breakDuration),
      breakTime: Math.floor(totalHours / 8) * this.breakDuration,
      progress: 100,
      remainingDistance: 0,
      remainingHours: 0
    });

    return predictions;
  }

  // Calculate distances between consecutive waypoints
  calculateWaypointDistances(waypoints) {
    const distances = [];
    
    for (let i = 0; i < waypoints.length - 1; i++) {
      const distance = this.calculateDistance(
        waypoints[i].lat, waypoints[i].lng,
        waypoints[i + 1].lat, waypoints[i + 1].lng
      );
      distances.push(distance);
    }
    
    return distances;
  }

  // Find waypoint at specific distance along route
  findWaypointAtDistance(waypoints, waypointDistances, targetDistance) {
    let accumulatedDistance = 0;
    
    for (let i = 0; i < waypointDistances.length; i++) {
      const segmentDistance = waypointDistances[i];
      
      if (accumulatedDistance + segmentDistance >= targetDistance) {
        // Interpolate position within this segment
        const progress = (targetDistance - accumulatedDistance) / segmentDistance;
        const lat = waypoints[i].lat + (waypoints[i + 1].lat - waypoints[i].lat) * progress;
        const lng = waypoints[i].lng + (waypoints[i + 1].lng - waypoints[i].lng) * progress;
        
        return {
          waypointIndex: i,
          lat: lat,
          lng: lng,
          progress: progress
        };
      }
      
      accumulatedDistance += segmentDistance;
    }
    
    // If target distance exceeds total route, return last waypoint
    const lastIndex = waypoints.length - 1;
    return {
      waypointIndex: lastIndex,
      lat: waypoints[lastIndex].lat,
      lng: waypoints[lastIndex].lng,
      progress: 1
    };
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in meters
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Find nearby cities within detection radius
  findNearbyCity(lat, lng) {
    let nearestCity = null;
    let minDistance = this.cityDetectionRadius;

    for (const city of cities) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = {
          ...city,
          distance: Math.round(distance / 1000), // Convert to km
          distanceFromRoute: distance
        };
      }
    }

    return nearestCity;
  }

  // Format time for display
  formatTime(date) {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }

  // Format duration for display
  formatDuration(hours) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    const minutes = Math.floor((hours % 1) * 60);
    
    if (days > 0) {
      return `${days}d ${remainingHours}h ${minutes}m`;
    } else {
      return `${remainingHours}h ${minutes}m`;
    }
  }

  // Calculate fuel consumption estimate
  calculateFuelConsumption(totalDistance, truckType = 'standard') {
    const fuelRates = {
      'light': 0.25, // L/km
      'standard': 0.35,
      'heavy': 0.45
    };
    
    const rate = fuelRates[truckType] || fuelRates.standard;
    const totalFuel = (totalDistance / 1000) * rate; // Convert to km and calculate
    
    return {
      totalFuel: Math.round(totalFuel * 10) / 10,
      rate: rate,
      truckType: truckType
    };
  }
}

export default RoutePredictionService;

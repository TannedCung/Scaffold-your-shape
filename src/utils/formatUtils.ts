/**
 * Format distance in meters to a human-readable string
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "1.5 km" or "800 m")
 */
export function formatDistance(meters: number): string {
  if (!meters) return '-';
  
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${meters.toFixed(0)} m`;
  }
}

/**
 * Format duration in seconds to a human-readable string
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "1h 30m 45s" or "45s")
 */
export function formatDuration(seconds: number): string {
  if (!seconds) return '-';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
}

/**
 * Format speed in meters per second to kilometers per hour
 * @param speed Speed in m/s
 * @returns Formatted string (e.g., "15.5 km/h")
 */
export function formatSpeed(speed: number): string {
  if (!speed) return '-';
  
  // Convert to km/h
  const kmh = speed * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format score with precision of 0.01 (2 decimal places) and locale-aware formatting
 * @param score The score to format
 * @returns Formatted string (e.g., "1,234.56" or "1,234.00")
 */
export function formatScore(score: number): string {
  if (score === null || score === undefined || isNaN(score)) return '0.00';
  
  // Round to 2 decimal places (precision of 0.01)
  const roundedScore = Math.round(score * 100) / 100;
  
  // Format with locale-aware thousands separators and exactly 2 decimal places
  return roundedScore.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format activity value with appropriate decimal places based on unit
 * @param value The activity value to format
 * @param unit The unit of measurement
 * @returns Formatted string with unit (e.g., "5.2 km", "45 mins", "150 reps")
 */
export function formatActivityValue(value: number | undefined, unit: string | undefined): string {
  if (value === null || value === undefined || isNaN(value) || !unit) {
    return '--';
  }

  let formattedValue: string;
  let displayUnit: string;

  // Format based on unit type
  switch (unit.toLowerCase()) {
    case 'kilometers':
    case 'km':
      formattedValue = value.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      });
      displayUnit = 'km';
      break;
    
    case 'meters':
    case 'm':
      if (value >= 1000) {
        // Convert to km if >= 1000m
        formattedValue = (value / 1000).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        });
        displayUnit = 'km';
      } else {
        formattedValue = Math.round(value).toLocaleString();
        displayUnit = 'm';
      }
      break;
    
    case 'miles':
      formattedValue = value.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 2
      });
      displayUnit = 'mi';
      break;
    
    case 'minutes':
    case 'mins':
      if (value >= 60) {
        // Convert to hours and minutes if >= 60 minutes
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        if (minutes === 0) {
          formattedValue = hours.toString();
          displayUnit = hours === 1 ? 'hr' : 'hrs';
        } else {
          formattedValue = `${hours}h ${minutes}m`;
          displayUnit = '';
        }
      } else {
        formattedValue = Math.round(value).toString();
        displayUnit = 'mins';
      }
      break;
    
    case 'hours':
    case 'hrs':
      formattedValue = value.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
      displayUnit = value === 1 ? 'hr' : 'hrs';
      break;
    
    case 'reps':
    case 'repetitions':
      formattedValue = Math.round(value).toLocaleString();
      displayUnit = 'reps';
      break;
    
    case 'calories':
    case 'cal':
      formattedValue = Math.round(value).toLocaleString();
      displayUnit = 'cal';
      break;
    
    default:
      formattedValue = value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      displayUnit = unit;
      break;
  }

  return displayUnit ? `${formattedValue} ${displayUnit}` : formattedValue;
} 
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
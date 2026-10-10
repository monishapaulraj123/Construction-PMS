// Utility and geospatial logic for Workforce Attendance Management

const EARTH_RADIUS_METERS = 6371000
const DEFAULT_SITE_RADIUS_METERS = 300
const DEFAULT_MAX_GPS_ACCURACY_METERS = 150

/**
 * Calculates the Haversine distance between two coordinates in meters
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2

  return Math.round(2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(Math.min(1, a))))
}

/**
 * Formats current server time for Asia/Kolkata timezone (YYYY-MM-DD date and 24h HH:mm time)
 */
export function getIndiaDateTime(dateObj = new Date()) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj)

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateObj)

  return { date, time }
}

/**
 * Validates GPS coordinate bounds
 */
export function isValidCoordinates(lat, lon) {
  const latitude = Number(lat)
  const longitude = Number(lon)
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * Validates GPS accuracy against configurable threshold
 */
export function isValidGpsAccuracy(accuracy, maxAllowed = DEFAULT_MAX_GPS_ACCURACY_METERS) {
  const gpsAccuracy = Number(accuracy)
  const threshold = Number(maxAllowed) || DEFAULT_MAX_GPS_ACCURACY_METERS
  return Number.isFinite(gpsAccuracy) && gpsAccuracy >= 0 && gpsAccuracy <= threshold
}

export { DEFAULT_SITE_RADIUS_METERS, DEFAULT_MAX_GPS_ACCURACY_METERS }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GEOFENCE_RADIUS_METERS = 100; // 100 meters default radius

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { employee_id, location_id, latitude, longitude, shift_id } = await req.json();

    if (!latitude || !longitude || !location_id) {
      return Response.json({
        verified: false,
        message: 'Missing GPS coordinates or location ID'
      }, { status: 400 });
    }

    // Fetch location to get expected coordinates
    const location = await base44.asServiceRole.entities.Location.read(location_id);
    if (!location) {
      return Response.json({
        verified: false,
        message: 'Location not found'
      }, { status: 404 });
    }

    if (!location.latitude || !location.longitude) {
      return Response.json({
        verified: false,
        message: 'Location GPS coordinates not configured'
      }, { status: 400 });
    }

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      location.latitude,
      location.longitude
    );

    const geofenceRadius = location.geofence_radius_meters || GEOFENCE_RADIUS_METERS;
    const verified = distance <= geofenceRadius;

    console.log(`GPS Verification: Employee ${employee_id} at location ${location_id}. Distance: ${distance.toFixed(2)}m, Limit: ${geofenceRadius}m, Verified: ${verified}`);

    return Response.json({
      verified,
      distance_meters: Math.round(distance),
      geofence_radius_meters: geofenceRadius,
      location_name: location.name,
      message: verified
        ? `Clock-in verified. Within ${geofenceRadius}m of ${location.name}`
        : `Clock-in blocked. You are ${Math.round(distance - geofenceRadius)}m outside the work location`
    });
  } catch (error) {
    console.error('GPS verification error:', error);
    return Response.json({
      verified: false,
      message: 'GPS verification failed: ' + error.message
    }, { status: 500 });
  }
});
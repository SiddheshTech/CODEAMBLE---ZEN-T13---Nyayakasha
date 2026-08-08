// Pre-defined Indian Judicial Jurisdiction Bounding Boxes (Latitude/Longitude ranges)
const JURISDICTION_BOUNDS = {
    'MH-MUM-DIST-01': { minLat: 18.8, maxLat: 19.3, minLng: 72.7, maxLng: 73.1 }, // Mumbai District
    'DL-ND-DIST-01': { minLat: 28.4, maxLat: 28.9, minLng: 76.9, maxLng: 77.4 }, // New Delhi District
    'KA-BLR-DIST-01': { minLat: 12.8, maxLat: 13.2, minLng: 77.4, maxLng: 77.8 }, // Bengaluru District
    'DEFAULT_ALL_INDIA': { minLat: 6.0, maxLat: 37.5, minLng: 68.0, maxLng: 97.5 } // India Geographic Extent
};
/**
 * Jurisdiction Geofencing Check Middleware (Enforced for Field Submitter)
 */
export function verifyJurisdictionGeofence(req, res, next) {
    // Geofencing is strictly required for Field Submitter role
    if (req.userRole === 'field_submitter') {
        const latStr = req.headers['x-latitude'] || req.body.latitude;
        const lngStr = req.headers['x-longitude'] || req.body.longitude;
        const jurisdictionCode = req.headers['x-jurisdiction-code'] || req.body.jurisdictionCode || 'DEFAULT_ALL_INDIA';
        if (!latStr || !lngStr) {
            return res.status(403).json({
                error: 'GEOFENCE_LOCATION_REQUIRED',
                message: 'Field Submitter role requires active GPS location headers (x-latitude, x-longitude) for jurisdiction boundary enforcement.'
            });
        }
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        const bounds = JURISDICTION_BOUNDS[jurisdictionCode] || JURISDICTION_BOUNDS['DEFAULT_ALL_INDIA'];
        if (lat < bounds.minLat || lat > bounds.maxLat || lng < bounds.minLng || lng > bounds.maxLng) {
            return res.status(403).json({
                error: 'OUT_OF_JURISDICTION',
                message: `Field Submitter location (${lat}, ${lng}) is outside registered jurisdiction boundary (${jurisdictionCode}). Submission blocked.`
            });
        }
    }
    next();
}

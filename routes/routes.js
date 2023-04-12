const express = require('express');
const router = express.Router();
const geo = require('./controllers/geoController');
const shift = require('./controllers/shiftController');

// Define routes for geo fencing
router.post('/geofence', geo.createGeofence);
router.get('/geofence/:id', geo.getGeofenceById);
router.put('/geofence/:id', geo.updateGeofence);
router.delete('/geofence/:id', geo.deleteGeofence);

// Define routes for shift management
router.post('/shifts/start', shift.startShift);
router.post('/shifts/end', shift.endShift);
router.get('/shifts', shift.getAllShifts);
router.get('/shifts/:id', shift.getShiftById);

module.exports = router;
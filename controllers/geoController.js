const geofences = {};

function createGeofence(req, res) {
  const id = req.body.id;
  const lat = req.body.lat;
  const long = req.body.long;
  const radius = req.body.radius;

  geofences[id] = { lat, long, radius };

  res.status(201).json({ message: 'Geofence created successfully' });
}

function getGeofenceById(req, res) {
  const id = req.params.id;
  const geofence = geofences[id];

  if (!geofence) {
    res.status(404).json({ message: 'Geofence not found' });
  } else {
    res.status(200).json(geofence);
  }
}

function updateGeofence(req, res) {
  const id = req.params.id;
  const lat = req.body.lat;
  const long = req.body.long;
  const radius = req.body.radius;

  if (!geofences[id]) {
    res.status(404).json({ message: 'Geofence not found' });
  } else {
    geofences[id] = { lat, long, radius };
    res.status(200).json({ message: 'Geofence updated successfully' });
  }
}

function deleteGeofence(req, res) {
  const id = req.params.id;

  if (!geofences[id]) {
    res.status(404).json({ message: 'Geofence not found' });
  } else {
    delete geofences[id];
    res.status(200).json({ message: 'Geofence deleted successfully' });
  }
}

module.exports = {
  createGeofence,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
};

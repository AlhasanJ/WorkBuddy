// const shifts = {};

// function startShift(req, res) {
//   const id = req.body.employeeId;
//   const lat = req.body.lat;
//   const long = req.body.long;

//   const geofence = geofences[id];
//   if (!geofence || !isInsideGeofence(geofence, lat, long)) {
//     res.status(400).json({ message: 'You are not within the geofence' });
//   } else if (shifts[id]) {
//     res.status(400).json({ message: 'You have already started your shift' });
//   } else {
//     const start = new Date();
//     shifts[id] = { start, geofence };
//     res.status(201).json({ message: 'Shift started successfully' });
//   }
// }

// function endShift(req, res) {
//   const id = req.body.employeeId;
//   const lat = req.body.lat;
//   const long = req.body.long;

//   const shift = shifts[id];
//   if (!shift) {
//     res.status(400).json({ message: 'You have not started your shift' });
//   } else if (!isInsideGeofence(shift.geofence, lat, long)) {
//     res.status(400).json({ message: 'You are not within the geofence' });
//   } else {
//     const end = new Date();
//     const duration = (end - shift.start) / 1000; // duration in seconds
//     delete shifts[id];
//     const query = `INSERT INTO shifts (employee_id, start_time, end_time, duration) VALUES (${id}, '${shift.start.toISOString()}', '${end.toISOString()}', ${duration})`;
//     connection.query(query, (error, results, fields) => {
//       if (error) {
//         console.log(error);
//         res.status(500).json({ message: 'Internal server error' });
//       } else {
//         res.status(200).json({ message: 'Shift ended successfully' });
//       }
//     });
//   }
// }

// module.exports = {
//   startShift,
//   endShift,
// };

const geolib = require('geolib');

// Define geofences
const geofences = {
  '1': {
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 100 // in meters
  },
  '2': {
    latitude: 37.3352,
    longitude: -121.8811,
    radius: 50 // in meters
  }
};

// Define shift objects
const shifts = {};

// Function to check if a point is inside a geofence
function isInsideGeofence(geofence, lat, long) {
  const point = { lat, long };
  return geolib.isPointInside(point, geofence);
}

// Function to start a shift
function startShift(req, res) {
  const id = req.body.employeeId;
  const lat = req.body.lat;
  const long = req.body.long;

  const geofence = geofences[id];
  if (!geofence || !isInsideGeofence(geofence, lat, long)) {
    res.status(400).json({ message: 'You are not within the geofence' });
  } else if (shifts[id]) {
    res.status(400).json({ message: 'You have already started your shift' });
  } else {
    const start = new Date();
    shifts[id] = { start, geofence };
    res.status(201).json({ message: 'Shift started successfully' });
  }
}

// Function to end a shift
function endShift(req, res) {
  const id = req.body.employeeId;
  const lat = req.body.lat;
  const long = req.body.long;

  const shift = shifts[id];
  if (!shift) {
    res.status(400).json({ message: 'You have not started your shift' });
  } else if (!isInsideGeofence(shift.geofence, lat, long)) {
    res.status(400).json({ message: 'You are not within the geofence' });
  } else {
    const end = new Date();
    const duration = (end - shift.start) / 1000; // in seconds
    delete shifts[id];
    res.status(200).json({ message: 'Shift ended successfully', duration });
  }
}

// Export shift-related functions
module.exports = {
  startShift,
  endShift
};

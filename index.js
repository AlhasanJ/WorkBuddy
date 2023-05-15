// // Import the modules we need
// const mysql = require('mysql');
// var ejs = require('ejs')
// var express = require ('express')
// var bodyParser= require ('body-parser')

// // Create the express application object
// const app = express()
// const port = 8000
// app.use(bodyParser.urlencoded({ extended: true }))

// // Define the database connection
// const db = mysql.createConnection ({
//     host: 'localhost',
//     user: 'root',
//     password: 'jouhoune1',
//     database: 'myBookshop'
// });

// // Connect to the database
// db.connect((err) => {
//     if (err) {
//         throw err;
//     }
//     console.log('Connected to database');
// });
// global.db = db;

// // Set the directory where Express will pick up HTML files
// // __dirname will get the current directory
// app.set('views', __dirname + '/views');

// // Tell Express that we want to use EJS as the templating engine
// app.set('view engine', 'ejs');

// // Tells Express how we should process html files
// // We want to use EJS's rendering engine
// app.engine('html', ejs.renderFile);

// // Serve static files from the 'public' directory
// app.use(express.static('public'));

// // Define our data
// var appData = {shopName: "Bertie's Books"}

// // Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
 //require("./routes/main")(app, appData);

// // Start the web app listening
// app.listen(port, () => console.log(`Example app listening on port ${port}!`))



// Import dependencies
const express = require('express');
const mysql = require('mysql');
const geolib = require('geolib');
// const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const expressSanitizer = require('express-sanitizer');
var validator = require ('express-validator');

// Load environment variables from .env file
// dotenv.config();
const port = process.env.PORT || 8000;

// Create connection to MySQL database
// Import mysql library
// const mysql = require('mysql');

// Create connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'jouhoune1',
  database: 'WorkBuddy',
});

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error(`Error connecting to the database: ${err.stack}`);
//     return;
//   }

//   console.log(`Connected to the database with ID: ${connection.threadId}`);

  
  
// Define function to start shift
function startShift(employeeId, latitude, longitude, callback) {
  // Define SQL query to check if employee is within geofence
  const isWithinGeofenceQuery = `SELECT ST_WITHIN(POINT(${longitude}, ${latitude}), geofence) AS isWithinGeofence FROM companies WHERE id = (SELECT company_id FROM employees WHERE id = ${employeeId})`;

  // Execute query to check if employee is within geofence
  pool.query(isWithinGeofenceQuery, (error, results) => {
    if (error) {
      // Handle error
      callback(error);
      return;
    }

    // Check if employee is within geofence
    const isWithinGeofence = results[0].isWithinGeofence;
    if (!isWithinGeofence) {
      // Employee is not within geofence, return error
      callback(new Error('Employee is not within geofence'));
      return;
    }

    // Define SQL query to start shift
    const startShiftQuery = `INSERT INTO shifts (employee_id, start_time) VALUES (${employeeId}, NOW())`;

    // Execute query to start shift
    pool.query(startShiftQuery, (error, results) => {
      if (error) {
        // Handle error
        callback(error);
        return;
      }

      // Return success
      callback(null, 'Shift started successfully');
    });
  });
}

// Define function to end shift
function endShift(employeeId, latitude, longitude, callback) {
  // Define SQL query to check if employee is within geofence
  const isWithinGeofenceQuery = `SELECT ST_WITHIN(POINT(${longitude}, ${latitude}), geofence) AS isWithinGeofence FROM companies WHERE id = (SELECT company_id FROM employees WHERE id = ${employeeId})`;

  // Execute query to check if employee is within geofence
  pool.query(isWithinGeofenceQuery, (error, results) => {
    if (error) {
      // Handle error
      callback(error);
      return;
    }

    // Check if employee is within geofence
    const isWithinGeofence = results[0].isWithinGeofence;
    if (!isWithinGeofence) {
      // Employee is not within geofence, return error
      callback(new Error('Employee is not within geofence'));
      return;
    }

    // Define SQL query to end shift
    const endShiftQuery = `UPDATE shifts SET end_time = NOW() WHERE employee_id = ${employeeId} AND end_time IS NULL`;

    // Execute query to end shift
    pool.query(endShiftQuery, (error, results) => {
      if (error) {
        // Handle error
        callback(error);
        return;
      }

      // Check if shift was ended
      const rowsAffected = results.affectedRows;
      if (rowsAffected === 0) {
        // Shift was not ended, return error
        callback(new Error('No shift to end'));
        return;
      }

      // Return success
      callback(null, 'Shift ended successfully');
    });
  });
}

module.exports = { startShift, endShift };


// Initialize Express application
const app = express();

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Configure middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files from the 'public' directory
app.use(express.static('public'));

// log all HTTP requests and responses to the console
app.use(morgan('combined'));

// // Define routes
// app.get('/', (req, res) => {
//   res.render('index');
// });

var appData = {shopName: "WorkBuddy"}

// // Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, appData);

app.post('/start-shift', (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`Error connecting to the database: ${err.stack}`);
      return res.status(500).send('Internal Server Error');
    }

  // Log that the "Start Shift" button was pressed
  console.log('Start Shift button pressed');

  // Retrieve employee's coordinates from the request body
  const { latitude, longitude } = req.body;

  // Retrieve geofence coordinates from the database
  connection.query('SELECT * FROM geofence', (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Internal Server Error');
    }

    // Calculate distance between employee's coordinates and geofence center
    const geofenceCenter = {
      latitude: results[0].latitude,
      longitude: results[0].longitude
    };
    const distance = geolib.getDistance(
      { latitude, longitude },
      geofenceCenter
    );

    // Check if employee is within geofence
    if (distance <= results[0].radius) {
      // If employee is within geofence, mark them as started and return success message
      connection.query('INSERT INTO shifts (employee_id, start_time) VALUES (?, ?)', [1, new Date()], (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).send('Internal Server Error');
        }
        res.send('Shift started successfully.');
      });
    } else {
      // If employee is outside geofence, return error message
      res.status(400).send('You are not within the geofence.');
    }
  });
});

app.post('/end-shift', (req, res) => {

  pool.getConnection((err, connection) => {
    if (err) {
      console.error(`Error connecting to the database: ${err.stack}`);
      return res.status(500).send('Internal Server Error');
    }

    // Log that the "End Shift" button was pressed
    console.log('End Shift button pressed');
    
  // Mark employee as ended and return success message
  connection.query('UPDATE shifts SET end_time = ? WHERE employee_id = ? AND end_time IS NULL', [new Date(), 1], (error, results) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Internal Server Error');
    }
    res.send('Shift ended successfully.');
  });
});
});
});

// Start server
// app.listen(process.env.PORT, () => {
//   console.log(`Server running on port ${process.env.PORT}`);
// });
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
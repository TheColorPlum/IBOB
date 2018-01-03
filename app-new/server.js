/*
 * server.js
 *
 * Configures and starts the server.
 */

const express = require('express');

const app = express();
const port = 5000;

const axios = require('axios');
const path = require('path');

/******************************************************************************/

// Configuration

function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
}

app.use(allowCrossDomain);

app.use('/', express.static(path.join(__dirname, '/public')));

/******************************************************************************/

// Start server

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});

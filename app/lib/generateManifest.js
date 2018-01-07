/*
 * generateManifest.js
 * Author: Michael Friedman
 *
 * Generates a manifest.json file, with the "start_url" parameter set depending
 * on the project mode environment variable.
 */

const fs = require('fs');
const path = require('path');
const projectMode = require('./projectMode');

const startUrlEnvVar = 'MANIFEST_START_URL'

// Make sure startUrl is defined if we're in production mode.
if (projectMode.isProduction) {
    const errorMessage = `Error: ${startUrlEnvVar} environment variable is `
      + `not set.`;
    if (process.env[startUrlEnvVar] === undefined) {
        console.error(errorMessage);
        process.exit(1);
    }
}

// Set value of startUrl
const startUrl = (projectMode.isProduction) ? process.env[startUrlEnvVar] : 'localhost:5000';

// Write manifest file
const manifestFile = '../public/manifest.json';
fs.writeFileSync(manifestFile,

`{
  "name": "The Feed",
  "start_url": "${startUrl}",
  "description": "A photo-sharing social network where you own your data",
  "icons": [{
    "src": "https://helloblockstack.com/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png"
  }]
}`

);

console.log(`Generated ${path.join(__dirname, manifestFile)}`);

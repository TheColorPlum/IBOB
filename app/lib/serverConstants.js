/*
 * serverConstants.js
 * Author: Michael Friedman
 *
 * Defines all the constants shared by server files in the app. Constants
 * are set depending on the evironment variable PROJECT_MODE, for security.
 * See docs for details.
 */

const projectMode = require('./projectMode');

// Environment variables used to determine values of constants. Their values
// are pulled from env vars if the project mode is 'production'.
const envVars = {
    port: 'PORT',
    directoryBaseUrl: 'DIRECTORY_BASE_URL',
    debugFlag: 'DEBUG_FLAG'
};

/******************************************************************************/

// Set values for the constants

// Helper function to cast value of debug flag to boolean
var parseDebugFlag = function(s) {
    if (s === 'true') return true;
    else if (s === 'false') return false;
    else {
        console.error(`Error: ${envVars.debugFlag} is not a valid boolean value.`);
        process.exit(1);
    }
};

const port             = (projectMode.isProduction) ? parseInt(process.env[envVars.port]) : 5000;
const directoryBaseUrl = (projectMode.isProduction) ? process.env[envVars.directoryBaseUrl] : 'http://localhost:4000';

// Note: You can manually set the "development" value to false if you want
// to disable debug logs.
const debugFlag = (projectMode.isProduction) ? parseDebugFlag(process.env[envVars.debugFlag]) : false;

// Expose the constants
module.exports = {
    port,
    directoryBaseUrl,
    debugFlag
};

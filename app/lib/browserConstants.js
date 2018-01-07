/*
 * browserConstants.js
 * Author: Michael Friedman
 *
 * Defines all the constants used by the browser, whose values are either
 * secret or depend on whether we're in production or not. Constants
 * are set depending on the environment variable PROJECT_MODE. See docs
 * for details.
 */

const projectMode = require('./projectMode');

// Environment variables used to determine values of constants. Constants are
// pulled from these env vars if project mode is "production"
const envVars = {
    // URLs that app needs to contact
    userServerProtocol: 'USER_SERVER_PROTOCOL',
    userServerPort: 'USER_SERVER_PORT',
    directoryBaseUrl: 'DIRECTORY_BASE_URL',

    // Private/secret information
    userPrivateKeyFile: 'USER_PRIVATE_KEY_FILE',
    privateKeyVarName: 'PRIVATE_KEY_VAR_NAME',
    userServerIpVarName: 'USER_SERVER_IP_VAR_NAME'
};

/******************************************************************************/

// Set values for the constants

const userServerProtocol  = (projectMode.isProduction) ? process.env[envVars.userServerProtocol] : 'http';
const userServerPort      = (projectMode.isProduction) ? parseInt(process.env[envVars.userServerPort]) : 3000;
const directoryBaseUrl    = (projectMode.isProduction) ? process.env[envVars.directoryBaseUrl] : 'http://localhost:4000';
const userPrivateKeyFile  = process.env[envVars.userPrivateKeyFile];
const privateKeyVarName   = process.env[envVars.privateKeyVarName];
const userServerIpVarName = process.env[envVars.userServerIpVarName];


// Helper function for constructing the base URLs of a user-server from its
// IP address
const makeUserServerBaseUrl = function(ip) {
    return userServerProtocol + '://' + ip + ':' + userServerPort;
};

// Expose the constants
module.exports = {
    userServerProtocol,
    userServerPort,
    directoryBaseUrl,
    userPrivateKeyFile,
    privateKeyVarName,
    userServerIpVarName,
    makeUserServerBaseUrl
};

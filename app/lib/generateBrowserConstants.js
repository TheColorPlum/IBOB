/*
 * generateBrowserConstants.js
 * Author: Michael Friedman
 *
 * Defines all the constants used by the browser, whose values are either
 * secret or depend on whether we're in production or not. Constants
 * are set depending on the environment variable PROJECT_MODE.
 *
 * Outputs a script constants.js, which you then import in a web page to
 * access the constants.
 *
 * See docs for details.
 */

const fs = require('fs');
const path = require('path');
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

// These values must come from env vars. So crash if they are not set.
let mustSetVars = {};
[envVars.userPrivateKeyFile, envVars.privateKeyVarName, envVars.userServerIpVarName]
.forEach(varName => {
    let errorMessage = `Error: ${varName} envrionment variable is not set.`;
    if (process.env[varName] === undefined) {
        console.error(errorMessage);
        process.exit(1);
    }

    mustSetVars[varName] = process.env[varName];
});

/******************************************************************************/

// Write the output script

const constantsScript = '../public/constants.js';
fs.writeFileSync(constantsScript,

`const constants = {
    userServerProtocol: '${userServerProtocol}',
    userServerPort: ${userServerPort},
    directoryBaseUrl: '${directoryBaseUrl}',
    userPrivateKeyFile: '${mustSetVars[envVars.userPrivateKeyFile]}',
    privateKeyVarName: '${mustSetVars[envVars.privateKeyVarName]}',
    userServerIpVarName: '${mustSetVars[envVars.userServerIpVarName]}',

    // Helper function for constructing the base URLs of a user-server from its
    // IP address
    makeUserServerBaseUrl: function(ip) {
        return constants.userServerProtocol + '://' + ip + ':'
          + constants.userServerPort;
    }
};`

);


console.log(`Generated ${path.join(__dirname, constantsScript)}`);

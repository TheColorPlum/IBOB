/*
 * constants.js
 * Author: Michael Friedman
 *
 * Defines all the constants shared by code in the user-server. Constants
 * are set depending on the evironment variable PROJECT_MODE, for security.
 * See docs for details.
 */

// Environment variables defined in production
const envVars = {
    // Main one. All constants are set depending on the value of this var.
    // They are pulled from these env vars if project mode is "production"
    projectMode: "PROJECT_MODE",

    // For the server
    port: "PORT",

    // URLs
    blockstackBaseUrl: "BLOCKSTACK_BASE_URL",
    directoryBaseUrl: "DIRECTORY_BASE_URL",
    serverBaseUrl: "SERVER_BASE_URL",

    // For the database
    cleardbDatabaseUrl: "CLEARDB_DATABASE_URL",

    // Misc
    blockstackZonefileRegex: "BLOCKSTACK_ZONEFILE_REGEX",
    debugFlag: "DEBUG_FLAG"
};

/******************************************************************************/

// Determine which mode we're in
const projectMode = process.env[envVars.projectMode];
const developmentMode = "development";
const productionMode = "production";

const isDevelopmentMode = (projectMode === developmentMode);
const isProductionMode = (projectMode === productionMode);

/******************************************************************************/

// Make sure all necessary variables are set

// Project mode
let errorMessage = `Error: Environment variable ${envVars.projectMode} is \
not set. Set it to ${developmentMode} if project is in development, or \
${productionMode} if in production.`;
if (!isDevelopmentMode && !isProductionMode) {
    // Invalid value for project mode
    console.error(errorMessage);
    process.exit(1);
}

// Production variables
if (isProductionMode) {
    for (attr in envVars) {
        let varName = envVars[attr];
        let errorMessage = "Error: Environment variable " + varName
          + " is not set.";
        if (process.env[varName] === undefined) {
            console.error(errorMessage);
            process.exit(1);
        }
    }
}


/******************************************************************************/

// Helper function to cast string to boolean
var parseDebugFlag = function(flagStr) {
    if (flagStr === "true") return true;
    else if (flagStr === "false") return false;
    else {
        console.error("Error: invalid boolean value for " + envVars.debugFlag);
        process.exit(1);
    }
}

// Set values
const port = (isProductionMode) ? parseInt(process.env[envVars.port]) : 3000;
const blockstackBaseUrl = (isProductionMode) ? process.env[envVars.blockstackBaseUrl] : "http://localhost:6000";
const directoryBaseUrl = (isProductionMode) ? process.env[envVars.directoryBaseUrl] : "http://localhost:4000";
const serverBaseUrl = (isProductionMode) ? process.env[envVars.serverBaseUrl] : "http://localhost:" + port;
const cleardbDatabaseUrl = (isProductionMode) ? process.env[envVars.cleardbDatabaseUrl] : "";
const blockstackZonefileRegex = (isProductionMode) ? process.env[envVars.blockstackZonefileRegex] : "http://localhost:6000/zonefile/[A-Za-z]+.id";

// Note: You can manually set the development value for this (on the right side
// of the ":") to false to disable debug logs.
const debugFlag = (isProductionMode) ? parseDebugFlag(process.env[envVars.debugFlag]) : true;

/******************************************************************************/

// Expose the constants
module.exports = {
    projectMode,
    developmentMode,
    productionMode,
    port,
    blockstackBaseUrl,
    directoryBaseUrl,
    serverBaseUrl,
    cleardbDatabaseUrl,
    blockstackZonefileRegex,
    debugFlag
};

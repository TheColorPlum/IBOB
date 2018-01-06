/*
 * constants.js
 * Author: Michael Friedman
 *
 * Defines all the constants shared by files in this directory. Constants
 * are set depending on the evironment variable PROJECT_MODE, for security.
 * See docs for details.
 */

// Environment variables used to determine values of constants
const envVars = {
    // Main one. All constants are set depending on the value of this var
    projectMode: "PROJECT_MODE",

    // Constants are pulled from these env vars if project mode is
    // "production"

    // For the server
    serverPort: "PORT",

    // Admin
    adminBsid: "ADMIN_BSID",
    adminPrivateKey: "ADMIN_PRIVATE_KEY",

    // Constant URLs
    blockstackBaseUrl: "BLOCKSTACK_BASE_URL",
    blockstackZonefileRegex: "BLOCKSTACK_ZONEFILE_REGEX",
    serverBaseUrl: "SERVER_BASE_URL",

    // For the database
    mysqlHost: "MYSQL_HOST",
    mysqlUser: "MYSQL_USER",
    mysqlPassword: "MYSQL_PASSWORD",

    // IDs and private keys for test names
    aliceBsid: "ALICE_BSID",
    bobBsid: "BOB_BSID",
    malloryBsid: "MALLORY_BSID",
    alicePrivateKey: "ALICE_PRIVATE_KEY",
    bobPrivateKey: "BOB_PRIVATE_KEY",
    malloryPrivateKey: "MALLORY_PRIVATE_KEY",

    // Misc
    debugFlag: "DEBUG_FLAG"
};


const developmentMode = "development";
const productionMode = "production";
const errorMessage = "Error: " + envVars.projectMode + " environment variables \
is not set. Set it to " + developmentMode + " if project is in development, \
or " + productionMode + " if in production.";

/******************************************************************************/

// Set values for the constants

const isDevelopmentMode = (process.env[envVars.projectMode] === developmentMode);
const isProductionMode = (process.env[envVars.projectMode] === productionMode);

if (!isDevelopmentMode && !isProductionMode) {
    // Invalid value for project mode
    console.error(errorMessage);
    process.exit(1);
}

// Helper function to cast string to boolean
var parseBool = function(s) {
    if (s === "true") return true;
    else if (s === "false") return false;
    else {
        console.error("Error: cannot parse " + s + " to a boolean");
        process.exit(1);
    }
};

// Set values
const serverPort              = (isProductionMode) ? parseInt(process.env[envVars.serverPort]) : 4000;
const adminBsid               = (isProductionMode) ? process.env[envVars.adminBsid] : "admin.id";
const adminPrivateKey         = (isProductionMode) ? process.env[envVars.adminPrivateKey] : "989891b175321d7042a97da0cafdce73fe18a8c1d2bafe158c119ca46545e2fc01";
const blockstackBaseUrl       = (isProductionMode) ? process.env[envVars.blockstackBaseUrl] : "http://localhost:6000";
const blockstackZonefileRegex = (isProductionMode) ? process.env[envVars.blockstackZonefileRegex] : "http://localhost:6000/zonefile/[A-Za-z]+.id";
const serverBaseUrl           = (isProductionMode) ? process.env[envVars.serverBaseUrl] : "http://localhost:" + serverPort;
const mysqlHost               = (isProductionMode) ? process.env[envVars.mysqlHost] : "localhost";
const mysqlUser               = (isProductionMode) ? process.env[envVars.mysqlUser] : "root";
const mysqlPassword           = (isProductionMode) ? process.env[envVars.mysqlPassword] : "TuringP_lumRubik$9";
const aliceBsid               = (isProductionMode) ? process.env[envVars.aliceBsid] : "alice.id";
const bobBsid                 = (isProductionMode) ? process.env[envVars.bobBsid] : "bob.id";
const malloryBsid             = (isProductionMode) ? process.env[envVars.malloryBsid] : "mallory.id";
const alicePrivateKey         = (isProductionMode) ? process.env[envVars.alicePrivateKey] : "86fc2fd6b25e089ed7e277224d810a186e52305d105f95f23fd0e10c1f15854501";
const bobPrivateKey           = (isProductionMode) ? process.env[envVars.bobPrivateKey] : "3548b2141ac92ada2aa7bc8391f15b8d70881956f7c0094fdde72313d06393b601";
const malloryPrivateKey       = (isProductionMode) ? process.env[envVars.malloryPrivateKey] : "af8d0f959ab8bed4399d60b7d5c568d9ec7eecf0da10bedeec3247eb5fcca1be01";

// NOTE: You can manually set the alternative (development) value to false if you
// want to disable debug logs.
const debugFlag               = (isProductionMode) ? parseBool(process.env[envVars.debugFlag]) : true;


// Expose the constants
module.exports = {
    serverPort,
    adminBsid,
    adminPrivateKey,
    blockstackBaseUrl,
    blockstackZonefileRegex,
    serverBaseUrl,
    mysqlHost,
    mysqlUser,
    mysqlPassword,
    aliceBsid,
    bobBsid,
    malloryBsid,
    alicePrivateKey,
    bobPrivateKey,
    malloryPrivateKey,
    debugFlag
};

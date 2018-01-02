/*
 * storePrivateKey.js
 * Authors: Michael Friedman
 *
 * Stores the private key passed as arg in the database.
 */

// Check usage
if (process.argv.length < 3) {
    console.error("Usage: node storePrivateKey.js PRIVATE-KEY");
    process.exit();
}

/******************************************************************************/

const dal = require("../lib/dal");
const privateKey = process.argv[2];

dal.setPrivateKey(privateKey, () => {
    console.log("Done setting private key");
});

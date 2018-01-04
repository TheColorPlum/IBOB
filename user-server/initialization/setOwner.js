/*
 * setOwner.js
 * Authors: Michael Friedman
 *
 * Initializes the owner of the database to the Blockstack ID provided as arg.
 */

// Check usage
if (process.argv.length < 3) {
    console.error("Usage: node setOwner.js BSID");
    process.exit();
}

/******************************************************************************/

const dal = require("../lib/dal");
const bsid = process.argv[2];

dal.setOwner(bsid, () => {
    console.log("Done setting owner to " + bsid);
    dal.closeConnection();
});

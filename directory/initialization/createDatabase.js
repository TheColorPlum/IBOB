/*
 * createDatabase.js
 * Authors: Michael Friedman
 *
 * Creates the directory's database.
 */

// Check usage
if (process.argv.length < 2) {
    console.error("Usage: node createDatabase.js");
    process.exit();
}

/******************************************************************************/

const dal = require("../lib/dal");

dal.createDatabase(() => {
    console.log("Done creating database");
    dal.closeConnection();
});

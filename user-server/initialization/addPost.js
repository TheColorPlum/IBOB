/*
 * addPost.js
 * Authors: Michael Friedman
 *
 * Adds an entry in the database for the photo and post with a given name.
 * This photo should already be present the in user-server/photos/ directory.
 */

// Check usage
if (process.argv.length < 3) {
    console.error("Usage: node addPost.js PHOTO-FILENAME");
    process.exit();
}

/******************************************************************************/

const constants = require("../lib/constants");
const dal = require("../lib/dal");
const requests = require("../lib/requests");
const filename = process.argv[2];

// Add an entry for the photo
let photoUrl = constants.serverBaseUrl + "/api/get-photo/" + filename;
dal.addPhoto(photoUrl, result => {
    if (result.affectedRows == 0) {
        // Something went wrong. Crash.
        console.error("Error: Unable to add entry for photo " + filename);
        dal.closeConnection();
        process.exit(1);
    }

    // Add an entry for the post
    let id = result.insertId;
    let timestamp = requests.makeTimestamp();
    dal.addPost(id, timestamp, result => {
        if (result.affectedRows == 0) {
            // Something went wrong. Crash.
            console.error("Error: Unable to add entry for post" + filename);
            dal.closeConnection();
            process.exit(1);
        }

        // Done!
    });
});

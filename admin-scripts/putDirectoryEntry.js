/*
 * putDirectoryEntry.js
 * Authors: Michael Friedman
 *
 * Makes a request to the directory to put an entry for a user.
 */

// Check usage
if (process.argv.length < 5) {
    console.error("Usage: node putDirectoryEntry.js BSID IP ADMIN-BSID ADMIN-SK");
    process.exit();
}

/******************************************************************************/

const axios = require("axios");
const requests = require("./lib/requests");

const directoryBaseUrl = "http://localhost:4000";

const userBsid = process.argv[2];
const ip = process.argv[3];
const adminBsid = process.argv[4];
const privateKey = process.argv[5];


// Make request
var data = {bsid: userBsid, ip: ip, timestamp: requests.makeTimestamp()};
var reqBody = requests.makeBody(data, privateKey);
axios.post(directoryBaseUrl + "/api/put?requester=" + adminBsid, reqBody)
.then(resp => {

    // Write output depending on success/failure
    var json = resp.data;
    if (json.success) {
        console.log("Success! Entry has been added: "
          + "(" + userBsid + ", " + ip + ")");
    } else {
        console.log("FAILED. Error from directory: " + json.msg);
    }

});

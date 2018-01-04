/*
 * registerWithDirectory.js
 * Authors: Michael Friedman
 *
 * Sends a request to the directory to insert this user-server's IP address.
 */

// Check usage
if (process.argv.length < 3) {
    console.error("Usage: node registerWithDirectory.js IP");
    process.exit();
}

/******************************************************************************/

const axios = require("axios");
const dal = require("../lib/dal");
const requests = require("../lib/requests");

var ip = process.argv[2];

// Retrieve Blockstack ID and private key from database
dal.getProfileInfo(profileInfo => {
var bsid = profileInfo.bsid;

dal.getPrivateKey(privateKey => {

// Make request to insert IP address in directory
var data = {bsid: bsid, ip: ip, timestamp: requests.makeTimestamp()};
var reqBody = requests.makeBody(data, privateKey);
axios.post(requests.directoryBaseUrl + "/api/put?requester=" + bsid, reqBody)
.then(resp => {

    var json = resp.data;
    if (json.success) {
        // Registered
        console.log("Done registering with directory");
    } else {
        console.log("Directory responded with a failure: " + json.msg);
    }

    dal.closeConnection();

}).catch(err => {

    console.log(err);
    dal.closeConnection();

});


})});

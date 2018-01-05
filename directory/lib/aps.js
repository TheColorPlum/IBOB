/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's authentication/permissions system (APS)
 * (see documentation for details).
 */

var axios = require("axios");
var constants = require("./constants");
var dal = require("./dal");
var debug = require("./debug");
var jsontokens = require("jsontokens");

// Permission levels
const permissions = {
    write: 0,
    read: 1
};

// JWT encoding algorithm
const encAlg = "ES256k";

// Blockstack core API url
const blockstackProfileExt = "/v1/names/";

// Time delta (ms) allowed between a request's send time and receive time to
// consider it valid.
const timeDelta = 5000;


/*
 * Authenticates the requester (requester, their Blockstack ID) as the one who
 * actually sent the request (encData, a JWT) and, if they're requesting write
 * permissions (indicated by reqPermission, one of the permissions defined
 * above), that the requester is the admin.
 *
 * Returns a Promise for the object:
 *   {ok (boolean), decodedData (string), errorMsg (string)}
 * where if ok is true, decodedData contains the data; and if
 * ok is false, errorMsg contains a message and there is no
 * decodedData.
 *
 * See documentation for more details.
 */
var verifyRequest = function(encData, requester, reqPermission) {
    //--------------------------------
    // Step 1: Authenticate requester
    //--------------------------------

    debug.log("verifyRequest()");
    debug.log("Step 1: Authenticate requester");

    // Get requester's public key from blockstack. First, get
    // their profile.
    var profileUrl = constants.blockstackBaseUrl + blockstackProfileExt + requester;
    return axios.get(profileUrl).then(response => {

        var json = response.data;

        // Make sure requester is registered
        debug.log("Checking that " + requester + " is registered");
        if (json.status !== "registered") {
            return {ok: false, decodedData: "", errorMsg: "Denied: Requester is not registered"};
        }

        // Get requester's zone file
        debug.log("Getting " + requester + "'s zonefile");
        var zonefileUrl = json.zonefile.match(constants.blockstackZonefileRegex)[0];
        return axios.get(zonefileUrl).then(response => {

            debug.log("Parsing " + requester + "'s zonefile");
            var json = response.data;
            var publicKey = json[0].decodedToken.payload.subject.publicKey;

            // Check signature on request
            debug.log("Checking signature on " + requester +"'s request");
            var verified = new jsontokens.TokenVerifier(encAlg, publicKey).verify(encData);
            if (!verified) {
                return {ok: false, decodedData: "", errorMsg: "Denied: Signature is invalid"};
            }

            //-------------------------------------------------
            // Step 2: Requester is authenticated. Decode data
            //-------------------------------------------------

            debug.log("Step 2: Decode request data");
            var decodedData = jsontokens.decodeToken(encData).payload;

            //-----------------------------
            // Step 3: Check permissions
            //-----------------------------

            debug.log("Step 3: Check permissions");

            // If it's a write, make sure the requester is the admin
            if (reqPermission === permissions.write && requester !== constants.adminBsid) {
                return {ok: false, decodedData: "",
                  errorMsg: "Denied: Requester " + requester + " is not the "
                  + "admin " + constants.adminBsid + ". Does not have permission to write "
                  + "to the directory."};
            }

            //-------------------------------------------------
            // Step 4: Check that timestamp in token is
            // roughly now.
            //-------------------------------------------------

            debug.log("Step 4: Check that timestamp is valid");
            var timestamp = new Date(decodedData.timestamp);
            var now = new Date();
            if (now.getTime() - timestamp.getTime() > timeDelta) {
                return {ok: false, decodedData: "", errorMsg: "Denied: Request expired (timestamp is too early)"}
            }

            // Success!
            debug.log("Success! Returning");
            return {ok: true, decodedData: JSON.stringify(decodedData), errorMsg: ""};

        }).catch(error => { // failed to get requester's zonefile
            return {ok: false, decodedData: "", errorMsg: "Failed while getting/processing zonefile. " + error.toString()};
        });

    }).catch(error => { // failed to get requester's profile
        return {ok: false, decodedData: "", errorMsg: "Error: Request to Blockstack for " + requester + "'s profile failed."};
    });

}


module.exports = {
    permissions,
    encAlg,
    verifyRequest
}

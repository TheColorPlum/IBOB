/*
 * aps.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's authentication/permissions system (APS)
 * (see documentation for details).
 */

import { TokenVerifier, decodeToken } from 'jsontokens'
const axios = require("axios");

// Permission levels
const permissions = {
    owner: 0,
    regular: 1
};

// JWT encoding algorithm
const encAlg = "ES256k";

// Blockstack core API url
const blockstackBaseUrl = "http://localhost:6270";
const blockstackProfileExt = "/v1/names/";

// Regex for Blockstack zonefiles
const zonefileRegex = "https://gaia.blockstack.org/hub/[A-Za-z0-9]+/[0-9]+/profile.json";

/*
 * Helper function to test whether a user is the owner. Returns boolean
 * indicator.
 */
function isOwner(user) {
    // TODO: Implement isOwner() (need to get owner from the database and compare)
    return user === "alice.id";
}

/*
 * Authenticates the requester (requester, their Blockstack ID) as the one who
 * actually sent the request (encData, a JWT) and has the permission level
 * specified (reqPermission, one of the above permissions).
 *
 * Returns a Promise for the object:
 *   {ok (boolean), decodedData (string), errorMsg (string)}
 * where if ok is true, decodedData contains the data; and if
 * ok is false, errorMsg contains a message and there is no
 * decodedData.
 *
 * See documentation for more details.
 */
function verifyRequest(encData, requester, reqPermission) {
    //-----------------------------
    // Step 1: Authenticate user
    //-----------------------------

    // Get user's public key from blockstack. First, get
    // their profile.
    var requesterUrl = blockstackBaseUrl + blockstackProfileExt + requester;
    return axios.get(requesterUrl).then(response => {

        var json = response.data;

        // Make sure user is registered
        if (json.status !== "registered") {
            return {ok: false, decodedData: "", errorMsg: "Denied: User is not registered"};
        }

        // Get user's zone file
        var zonefileUrl = json.zonefile.match(zonefileRegex)[0];
        return axios.get(zonefileUrl).then(response => {

            var json = response.data;
            var publicKey = json[0].payload.subject.publicKey;

            // Check signature on request
            var verified = new TokenVerifier(encAlg, publicKey).verify(encData);
            if (!verified) {
                return {ok: false, decodedData: "", errorMsg: "Denied: Signature is invalid"};
            }

            //-----------------------------
            // Step 2: Check permissions
            //-----------------------------

            // Make sure a non-owner is not trying to access owner permissions
            if (!isOwner(requester) && reqPermission === permissions.owner) {
                return {ok: false, decodedData: "", errorMsg: "Denied: User does not have sufficient permissions"};
            }

            //-------------------------------------------------
            // Step 3: Requester is authenticated and granted
            // permission. Decode the token and return
            //-------------------------------------------------

            decodedData = decodeToken(encData);
            return {ok: true, decodedData: decodedData, errorMsg: ""}; // success!


        }).catch(error => { // failed to get requester's zonefile
            return {ok: false, decodedData: "", errorMsg: "Error: Request to Blockstack for " + requester + "'s zonefile failed."};
        });

    }).catch(error => { // failed to get requester's profile
        return {ok: false, decodedData: "", errorMsg: "Error: Request to Blockstack for " + requester + "'s profile failed."};
    });

}

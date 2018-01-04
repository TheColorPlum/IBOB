/*
 * requests.js
 * Author: Michael Friedman
 *
 * Some helper functions to help when making requests.
 */

const jsontokens = require("jsontokens");

// Encoding algorithm used
const encAlg = 'ES256k';

// User-server directory URL
const directoryBaseUrl = "http://localhost:4000";

/*
 * Returns an encoded and signed version of `data` (JS object), which
 * you can use directly as the body of a request. Also requires the private
 * key of the requester to sign the data.
 */
var makeBody = function(data, privateKey) {
    return (new jsontokens.TokenSigner(encAlg, privateKey)).sign(data);
};


/*
 * Returns a timestamp with the current time, in the format the API accepts.
 */
var makeTimestamp = function() {
    return (new Date()).toJSON();
}

 module.exports = {
    directoryBaseUrl,
    makeBody,
    makeTimestamp
 };

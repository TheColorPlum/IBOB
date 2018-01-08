/*
 * requests.js
 * Author: Michael Friedman
 *
 * Some helper functions to help when making requests.
 */

const aps = require("./aps");
const jsontokens = require("jsontokens");

/*
 * Returns an encoded and signed version of `data` (JS object), which
 * you can use directly as the body of a request. Also requires the private
 * key of the requester to sign the data.
 */
var makeBody = function(data, privateKey) {
    return (new jsontokens.TokenSigner(aps.encAlg, privateKey)).sign(data);
};


/*
 * Returns a timestamp with the current time, in the format the API accepts.
 */
var makeTimestamp = function() {
    return (new Date()).toJSON();
}

 module.exports = {
    makeBody,
    makeTimestamp
 };

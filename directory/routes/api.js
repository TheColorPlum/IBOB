/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the directory's web API (see documentation for details).
 */

var express = require("express");
var app = express();

/******************************************************************************/

const urls = {
    get: "/get",
    put: "/put"
}


/*
 * Returns the IP address of a user's user-server.
 */
app.post(urls.get, function(req, res, next) {

    // TODO: Implement
    res.json({success: false, msg: "Not implemented"});
});



/*
 * Adds a (bsid, user-server IP address) mapping to the directory.
 */
app.post(urls.put, function(req, res, next) {

    // TODO: Implement
    res.json({success: false, msg: "Not implemented"});
});


module.exports = {
    app,
    urls
};

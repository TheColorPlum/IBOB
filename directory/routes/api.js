/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the directory's web API (see documentation for details).
 */

var aps = require("../lib/aps");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var express = require("express");

var app = express();

/******************************************************************************/

const urls = {
    get: "/get",
    put: "/put"
};


/*
 * Returns the IP address of a user's user-server.
 */
app.post(urls.get, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.read)
    .then(verification => {
        if (!verification.ok) {
            res.json({success: false, msg: verification.errorMsg});
            return;
        }

        // Get entry for the requested user
        var data = JSON.parse(verification.decodedData);
        dal.get(data.bsid, result => {
            if (result.success) {
                // Entry exists. Return it.
                res.json({success: true, ip: result.ip});
            } else {
                // Entry does not exist.
                res.json({success: false, msg: "User-server does not exist"});
            }
        });
    });
});



/*
 * Adds a (bsid, user-server IP address) mapping to the directory.
 */
app.post(urls.put, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.write)
    .then(verification => {
        if (!verification.ok) {
            res.json({success: false, msg: verification.errorMsg});
            return;
        }

        // Insert entry for the request user
        var data = JSON.parse(verification.decodedData);
        dal.put(data.bsid, data.ip, () => {
            res.json({success: true});
        });
    });
});


module.exports = {
    app,
    urls
};

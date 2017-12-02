/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's web API (see documentation for details).
 */

var aps = require('./aps');
var express = require('express');
var router = express.Router();

/******************************************************************************/

// GET requests

/*
 * Returns a specified number of posts from the user's feed.
 */
router.get('/feed', function(req, res, next) {
    // TODO: Implement
});



/*
 * Returns this user's profile info.
 */
router.get('/profile-info', function(req, res, next) {
    // Verify
    var verification = aps.verifyRequest(req.body, req.params.requester, aps.permissions.regular);
    if (!verification.ok) {
        res.send(verification.errorMsg);
    }
    var data = verification.decodedData;

    // Process request
});


/*
 * Returns a specified number of posts made by this user.
 */
router.get('/posts', function(req, res, next) {
    // TODO: Implement
});


/******************************************************************************/

// POST requests

/*
 * Updates this user's profile info.
 */
router.post('/profile-info', function(req, res, next) {
    // TODO: Implement
});



/*
 * Makes this user start following another specified user.
 */
router.post('/follow', function(req, res, next) {
    // TODO: Implement
});


/*
 * Uploads a photo to this user's account.
 */
router.post('/photo', function(req, res, next) {
    // TODO: Implement
});


module.exports = router;

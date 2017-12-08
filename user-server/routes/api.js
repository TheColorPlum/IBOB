/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's web API (see documentation for details).
 */

var aps = require('./aps');
var dal = require('../dal');
var express = require('express');
var router = express.Router();

/******************************************************************************/

const urls = {
    getFeed: "/feed",
    getProfileInfo: "/profile-info",
    getPosts: "/posts",
    postProfileInfo: "/profile-info",
    postFollow: "/follow",
    postPhoto: "/photo"
}


// GET requests (implemented as POST requests so they can receive request
// body)

/*
 * Returns a specified number of posts from the user's feed.
 */
router.post(urls.getFeed, function(req, res, next) {
    // TODO: Implement
});



/*
 * Returns this user's profile info.
 */
router.post(urls.getProfileInfo, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Process request
        var profileInfo = dal.getProfileInfo();
        res.send(JSON.stringify(profileInfo));
    });
});


/*
 * Returns a specified number of posts made by this user.
 */
router.post(urls.getPosts, function(req, res, next) {
    // TODO: Implement
});


/******************************************************************************/

// POST requests

/*
 * Updates this user's profile info.
 */
router.post(urls.postProfileInfo, function(req, res, next) {
    // TODO: Implement
});



/*
 * Makes this user start following another specified user.
 */
router.post(urls.postFollow, function(req, res, next) {
    // TODO: Implement
});


/*
 * Uploads a photo to this user's account.
 */
router.post(urls.postPhoto, function(req, res, next) {
    // TODO: Implement
});


module.exports = {
    router,
    urls
};

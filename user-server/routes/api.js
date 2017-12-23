/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's web API (see documentation for details).
 */

var aps = require('../lib/aps');
var dal = require('../lib/dal');
var debug = require('../lib/debug');
var express = require('express');
var app = express();

/******************************************************************************/

const urls = {
    getFeed: "/get-feed",
    getProfileInfo: "/get-profile-info",
    getPosts: "/get-posts",
    getPhotos: "/get-photos",
    updateProfileInfo: "/update-profile-info",
    followUser: "/follow-user",
    addPhoto: "/add-photo"
}


// GET requests (implemented as POST requests so they can receive request
// body)

/*
 * Returns a specified number of posts from the user's feed.
 */
app.post(urls.getFeed, function(req, res, next) {

    // TODO: Implement
    res.send("Not implemented");
});



/*
 * Returns this user's profile info.
 */
app.post(urls.getProfileInfo, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Process request
        dal.getProfileInfo(profileInfo => {
        dal.getFollowing(following => {

            // Delete SQL id
            delete profileInfo.id;

            // Format "following" list to have just bsids ["alice.id", "bob.id", ...]
            profileInfo.following = [];
            following.forEach(user => {
                profileInfo.following.push(user.bsid);
            });
            res.json(profileInfo);

        })});
    });
});


/*
 * Returns a specified number of posts made by this user.
 */
app.post(urls.getPosts, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Get posts
        dal.getPosts(posts => {

            // Check that parameters are valid
            var body = JSON.parse(verification.decodedData);
            var count = body.count;
            var offset = body.offset;

            var min = offset;
            var max = offset + count - 1;
            if (min < 0 || max < 0 || min > posts.length - 1 || max > posts.length - 1) {
                res.send("Error: Invalid values for offset/count");
                return;
            }

            // Only return `count` posts, starting from `offset`. Format to have
            // id, timestamp, and path
            var json = [];
            for (var i = offset; i < offset + count; i++) {
                json.push({id: posts[i].id, timestamp: posts[i].timestamp, path: posts[i].path});
            }
            res.json(json);
        });
    });
});


/*
 * Returns a specified group of this user's photos.
 */
app.post(urls.getPhotos, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Get photos
        dal.getPhotos(photos => {

            // Check that parameters are valid
            var body = JSON.parse(verification.decodedData);
            var count = body.count;
            var offset = body.offset;

            var min = offset;
            var max = offset + count - 1;
            if (min < 0 || max < 0 || min > photos.length - 1 || max > photos.length - 1) {
                res.send("Error: Invalid values for offset/count");
                return;
            }

            // Only return `count` posts, starting from `offset`.
            res.json(photos.slice(offset, offset + count));

        });

    });


});

/******************************************************************************/

// POST requests

/*
 * Updates this user's profile info.
 */
app.post(urls.updateProfileInfo, function(req, res, next) {

    // TODO: Implement
    res.send("Not implemented");
});



/*
 * Makes this user start following another specified user.
 */
app.post(urls.followUser, function(req, res, next) {

    // TODO: Implement
    res.send("Not implemented");
});


/*
 * Uploads a photo to this user's account.
 */


app.post(urls.addPhoto, function(req, res, next) {

    // TODO: Implement
    res.send("Not implemented");
});


module.exports = {
    app,
    urls
};

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
var path = require("path");
var multer = require("multer");

/******************************************************************************/

// Storage config for photos
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, '../photos')
    },
    filename: function(req, file, callback) {
        console.log(file)
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

/******************************************************************************/

const urls = {
    getFeed: "/get-feed",
    getProfileInfo: "/get-profile-info",
    getPosts: "/get-posts",
    getPhotos: "/get-photos",
    updateProfileInfo: "/update-profile-info",
    followUser: "/follow-user",
    addPost: "/add-post",
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
                json.push({
                    id: posts[i].id, timestamp: posts[i].timestamp,
                    photo: {id: posts[i].photoId, path: posts[i].path}
                });
            }
            res.json(json);

        });
    });
});


/******************************************************************************/

// POST requests

/*
 * Updates this user's profile info.
 */
app.post(urls.updateProfileInfo, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
        res.send(verification.errorMsg);
        return;
    }

    // Process Request
    // TODO: Implement
    dal.updateProfileInfo()
    res.json({success: false});
});



/*
 * Makes this user start following another specified user.
 */
app.post(urls.followUser, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
        res.send(verification.errorMsg);
        return;
    }
}

    // TODO: Implement
    res.json({success: false});
});


/*
 * Makes a post on this user's account.
 */
app.post(urls.addPost, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if (!verification.ok) {
        res.send(verification.errorMsg);
        return;
    }
}

    // TODO: Implement
    res.json(
        {success: false, post: {id: -1, timestamp: (new Date()).toJSON(),
            photo: {id: -1, path: ""}}}
    );
});


/*
 * Uploads a photo to this user's account.
 */
app.post(urls.addPhoto, function(req, res, next) {

    // TODO: Implement
    // NOTE: You don't need to verify the user in this request. Just upload
    // the photo to cloud storage.
    var upload = multer({
        storage: storage
    }).single('userFile');
    upload(req, res, function(err) {
        dal.addPhoto(upload.path(), )
        res.end('File is uploaded')
    });

    res.json(
        {success: false, photo: {id: -1, path: ""}}
    );
});


module.exports = {
    app,
    urls
};

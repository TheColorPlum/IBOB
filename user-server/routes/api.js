/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's web API (see documentation for details).
 */

var aps = require('../lib/aps');
var constants = require('../lib/constants');
var dal = require('../lib/dal');
var debug = require('../lib/debug');
var express = require('express');
var fs = require("fs");
var hasha = require("hasha");  // ref: https://github.com/sindresorhus/hasha
var metrics = require("../lib/metrics");
var path = require("path");

var app = express();

/******************************************************************************/

// Constants

const urls = {
    getProfileInfo: "/get-profile-info",
    getPosts: "/get-posts",
    getPhoto: "/get-photo/:filename",
    updateProfileInfo: "/update-profile-info",
    followUser: "/follow-user",
    addPost: "/add-post",
    addPhoto: "/add-photo",

    // [METRICS]
    resetTimeTrials: "/reset-time-trials"
};

const photosDir = path.join(__dirname, "../photos");

// Generates a filename for the photo in its permanent storage location
var generateNewPhotoName = function(file) {
    var ext = path.extname(file.name);

    // Hash the raw contents of the file. Use hash as the name
    var hash = hasha(file.data, {algorithm: "sha512"});
    return hash + "-" + Date.now() + ext;
};

/******************************************************************************/

// [METRICS] Some variables for metrics

// Array to hold results of all time trials for adding posts.
var timeTrials = [];


/*
 * Resets the timeTrials array above, and returns {success: true}
 */
app.get(urls.resetTimeTrials, function(req, res) {
    timeTrials = [];
    res.json({success: true});
});

/******************************************************************************/

// GET requests (implemented as POST requests so they can receive request
// body)

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
        debug.log("Processing " + urls.getProfileInfo + " request...");
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
        debug.log("Processing " + urls.getPosts + " request...");
        dal.getPosts(posts => {

            // Check that parameters are valid. min index is out of range,
            // fail. But if min is in range and max is over the limit, just
            // return as many posts as you have.
            var body = JSON.parse(verification.decodedData);
            var count = body.count;
            var offset = body.offset;

            if (count <= 0) {
                res.json({success: true, posts: []});
            }

            var min = offset;
            var max = offset + count - 1;
            if (min < 0 || max < 0 || min > posts.length - 1) {
                res.json({success: false});
                return;
            }

            // Only return `count` posts, starting from `offset`, or as many
            // as you have starting from `offset`. Format to have id, timestamp,
            // and path
            var json = {success: true, posts: []};
            for (var i = offset; i < Math.min(offset + count, posts.length); i++) {
                json.posts.push({
                    id: posts[i].id, timestamp: posts[i].timestamp,
                    photo: {id: posts[i].photoId, path: posts[i].path}
                });
            }
            res.json(json);

        });
    });
});


/*
 * Returns a photo with a given filename
 */
app.get(urls.getPhoto, function(req, res, next) {
    debug.log("Processing request for photo: " + req.params.filename);

    // Make sure file exists
    var photoPath = path.join(photosDir, req.params.filename);
    if (!fs.existsSync(photoPath)) {
        res.status(404).send("");
        return;
    }

    // Send photo
    res.sendFile(photoPath);
});


/******************************************************************************/

// POST requests

/*
 * Updates this user's profile info.
 */
app.post(urls.updateProfileInfo, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if(!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Process Request
        debug.log("Processing " + urls.updateProfileInfo + " request...");
        var bsid = req.query.requester;
        var profile = JSON.parse(verification.decodedData);

        dal.updateProfileInfo(bsid, profile, function(result) {
            res.json({success: true});
        });
    });
});



/*
 * Makes this user start following another specified user.
 */
app.post(urls.followUser, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
        if(!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Process request
        debug.log("Processing " + urls.followUser + " request...");
        var body = JSON.parse(verification.decodedData);
        var bsid = body.bsid;

        dal.followUser(bsid, function (result) {
            if(result.affectedRows == 0) {
                res.json({success: false});
                return;
            }
            res.json({success: true});
        });
    });
});


/*
 * Makes a post on this user's account.
 */
app.post(urls.addPost, function(req, res, next) {
    // [METRICS] Start timer
    var timer = new metrics.Timer();

    debug.log("Processing " + urls.addPost + " request...");

    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular, timer).then(verification => {
        if(!verification.ok) {
            res.send(verification.errorMsg);
            return;
        }

        // Process request
        debug.log("Processing " + urls.addPost + " request...");
        var body = JSON.parse(verification.decodedData);
        var photoId = body.photoId;
        var timestamp = (new Date()).toJSON();
        dal.getPhoto(photoId, photo => {

            if (!photo.success) {
                res.json({success: false});
                res.end("Error: photo does not exist. Cannot make a post with it.");
            }

            var path = photo.path;

            // Add a post with that photo
            dal.addPost(photoId, timestamp, function(result) {
                if(result.affectedRows == 0) {
                    res.json({success: false});
                    return;
                }

                // [METRICS] Record time to here - database query
                timer.recordLap();
                timer.recordTime();
                var results = timer.stop();
                timeTrials.push(results);
                metrics.log(JSON.stringify(timeTrials));

                res.json({success: true, post: {id: result.insertId, timestamp: timestamp, photo: {id: photoId, path: path}}});
            });
        });
    });
});

/*
 * Uploads a photo to this user's account.
 */
app.post(urls.addPhoto, function(req, res, next) {
    // NOTE: You don't need to verify the user in this request. Just upload
    // the photo to cloud storage.

    debug.log("Processing " + urls.addPhoto + " request...");

    // Make sure there's a file
    if (!req.files || !req.files.photo) {
        res.send({success: false});
        return;
    }

    var photo = req.files.photo;

    // Move photo to its permanent location
    var photoName = generateNewPhotoName(photo);
    var photoPath = path.join(photosDir, photoName);
    photo.mv(photoPath).then(err => {
        if (err) {
            // Failed to store photo in permanent location
            res.send({success: false});
            return;
        }

        // Photo is stored. Now add its URL to the database.
        var photoUrl = constants.serverBaseUrl + "/api/get-photo/" + photoName;
        dal.addPhoto(photoUrl, function(result) {
            if (result.affectedRows == 0) {
                // Error storing photo in database.
                res.json({success: false});
                return;
            }

            // Done!
            res.json({success: true, photo: {id: result.insertId,
              path: photoUrl}});
        });
    });
});


module.exports = {
    app,
    urls
};

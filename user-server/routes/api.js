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

// Storage config for photos. Photos will be uploaded into the /photos directory (can be changed)
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, '../photos');
    },
    filename: function(req, file, callback) {
        console.log(file);
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Upload function
var upload = multer({storage: storage}).single('userFile');

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
            res.end("Profile updated.")
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
                res.end("Could not follow user.");
            }
            res.json({success: true});
            res.end("Followed user.");
        });
    });
});


/*
 * Makes a post on this user's account.
 */
app.post(urls.addPost, function(req, res, next) {
    // Verify
    aps.verifyRequest(req.body, req.query.requester, aps.permissions.regular).then(verification => {
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
                    res.end("Error in uploading post.");
                }
                res.json({success: true, post: {id: result.insertId, timestamp: timestamp, photo: {id: photoId, path: path}}});
                res.end("Post uploaded.");
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
    upload(req, res, function(err) {
        // Error handling
        if(err) {
            res.json({success: false, photo: {id: -1, path: ""}});
            res.end("Error uploading file.");
        }
        var path = req.file.filename;
        dal.addPhoto(path, function(result) {
            if(result.affectedRows == 0) {
                res.json({success: false, photo: {id: -1, path: ""}});
                res.end("Error uploading file.");
            }
            res.json({success: true, photo: {id: result.insertId, path: path}});
            res.end('File is uploaded');
        });
    });
});


module.exports = {
    app,
    urls
};

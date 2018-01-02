/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's data access layer (DAL)
 * (see documentation for details).
 */

var debug = require("./debug");
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'TuringP_lumRubik$9',
    database : 'The_Feed'
});

/***********************************************************/

// Standard function for making a query to the database. Pass SQL query
// `sql`, a message to print once the query succeeds, and the callback
// function to process the results from the database (if there are any).
var query = function(sql, msg, callback) {
    connection.query(sql, (err, result) => {
        if (err) throw err;

        // Success!
        if (msg !== "") {
            debug.log("Database query successful: " + msg);
        }
        callback(result);
    });
}

// Clears all data in the database tables. Call this, for instance, between
// tests to start with a clean slate.
var clearDatabase = function(callback) {
    var clearTable = "DELETE FROM ";
    var resetTable1 = "ALTER TABLE ";
    var resetTable2 = " AUTO_INCREMENT = 1";

    // Clear profile info
    query(clearTable + "profile_info", "", function() {
    query(resetTable1 + "profile_info" + resetTable2, "", function() {

    // Clear posts
    query(clearTable + "posts", "", function() {
    query(resetTable1 + "posts" + resetTable2, "", function() {

    // Clear photos
    query(clearTable + "photos", "", function() {
    query(resetTable1 + "photos" + resetTable2, "", function() {

    // Clear followers
    query(clearTable + "followers", "", function() {
    query(resetTable1 + "followers" + resetTable2, "", function() {

    // Clear following
    query(clearTable + "following", "", function() {
    query(resetTable1 + "following" + resetTable2, "", function() {

    // Clear private key
    query(clearTable + "private_key", "", function() {
    query(resetTable1 + "private_key" + resetTable2, "", function() {

    // Callback
    callback();

    })})})})})})})})})})})});
}

/***********************************************************
 * Put requests interface to the database
 **********************************************************/

var followUser = function(bsid, callback) {
    var sql = "Insert INTO following (bsid) values (" + connection.escape(bsid) + ")";
    var msg = "Started following " + bsid;
    query(sql, msg, callback);
}

var addFollower = function(bsid, callback) {
    var sql = "Insert INTO followers (bsid) values (" + connection.escape(bsid) + ")";
    var msg = "Added " + bsid + " to followers";
    query(sql, msg, callback);
}

var addPhoto = function(path, callback) {
    var sql = "INSERT INTO photos (path) values (" + connection.escape(path) + ")";
    var msg = "Photo added";
    query(sql, msg, callback);
}

var addPost = function(photoId, timestamp, callback) {
    var sql = "INSERT INTO posts (photoId, timestamp) values ("
      + connection.escape(photoId) + ", " + connection.escape(timestamp) + ")";
    var msg = "Post added";
    query(sql, msg, callback);
}

var updateProfileInfo = function(bsid, profile, callback) {
    var values = "";
    if (profile.displayName) {
        values += "displayName = " + connection.escape(profile.displayName) + ",";
    }
    if (profile.bio) {
        values += "bio = " + connection.escape(profile.bio) + ",";
    }
    if (profile.profilePhotoId) {
        values += "profilePhotoId = " + connection.escape(profile.profilePhotoId) + ",";
    }
    if (profile.coverPhotoId) {
        values += "coverPhotoId = " + connection.escape(profile.coverPhotoId) + ",";
    }

    if (values === "") {
        // Nothing to update
        callback();
        return;
    }

    // Cut off trailing comma
    values = values.substring(0, values.length - 1);

    // Construct complete SQL statement
    sql = "UPDATE profile_info SET " + values + " WHERE bsid = "
      + connection.escape(bsid);

    var msg = "Profile updated";
    query(sql, msg, callback);
}

var setOwner = function(bsid, callback) {
    var sql = "INSERT INTO profile_info (bsid) values ("
      + connection.escape(bsid) + ")";
    var msg = "Owner set to " + bsid;
    query(sql, msg, callback);
}

var setPrivateKey = function(privateKey, callback) {
    var sql = "INSERT INTO private_key (privateKey) values ("
      + connection.escape(privateKey) + ")";
    var msg = "Private key set";
    query(sql, msg, callback);
}


/***********************************************************
 * Get requests interface to the database
 **********************************************************/

var getPhotos = function(callback) {
    var sql = "SELECT * FROM photos";
    var msg = "Retrieved all photos";
    query(sql, msg, callback);
}

var getPosts = function(callback) {
    var sql = "SELECT * FROM posts JOIN photos ON posts.photoId = photos.id"
               + " ORDER BY timestamp";
    var msg = "Retrieved all posts";
    query(sql, msg, callback);
}

var getProfileInfo = function(callback) {
    // Make query for profile info with profile/cover photos
    var sql = "SELECT * FROM profile_info JOIN photos ON "
               + "profile_info.profilePhotoId = photos.id OR "
               + "profile_info.coverPhotoId = photos.id";
    var msg = "Got profile info (with profile and cover photos)";
    query(sql, msg, function(rows) {

    if (rows.length == 0) {
        // There is no profile photo or cover photo, so this JOIN returned
        // nothing. Query for the regular profile info instead.
        var sql2 = "SELECT * FROM profile_info";
        query(sql2, "No profile/cover photo. Made normal request for profile info instead", function(rows) {
            // Format result
            var info = rows[0];
            delete info.id;
            delete info.profilePhotoId;
            delete info.coverPhotoId;
            info.profilePhoto = null;
            info.coverPhoto = null;
            callback(info);
        });
    } else if (rows.length == 1) {
        // User has only one of the photos (either profile or cover). Format
        // and return result based on which one it is.
        var info = rows[0];
        if (info.profilePhotoId !== null) {
            // User has profile photo
            info.profilePhoto = {id: info.profilePhotoId, path: info.path};
            info.coverPhoto = null;
        } else {
            // User has cover photo
            info.coverPhoto = {id: info.coverPhotoId, path: info.path};
            info.profilePhoto = null;
        }

        delete info.id;
        delete info.profilePhotoId;
        delete info.coverPhotoId;
        callback(info);
    } else {
        // This came back as two rows: one for the JOIN on profilePhotoId, and
        // one for coverPhotoId. Merge the two rows, and pass that to callback.
        var info = rows[0];  // arbitrary choice; either row will work
        var result = {
            bsid: info.bsid,
            displayName: info.displayName,
            bio: info.bio,
            profilePhoto: {
                id: info.profilePhotoId,
                path: rows[0].path
            },
            coverPhoto: {
                id: info.coverPhotoId,
                path: rows[1].path
            }
        };
        callback(result);
    }

    }); // end original query()
}

var getFollowing = function(callback) {
    var sql = "SELECT * FROM following";
    var msg = "Got list of people I'm following";
    query(sql, msg, callback);
}

var getFollowers = function(callback) {
    var sql = "SELECT * FROM followers";
    var msg = "Got list of my followers";
    query(sql, msg, callback);
}

var getPrivateKey = function(callback) {
    var sql = "SELECT * FROM private_key";
    var msg = "Got private key";
    query(sql, msg, function(rows) {

    if (rows.length == 0) {
        // No private key set
        callback("");
    } else {
        // Return private key
        callback(rows[0].privateKey);
    }

    });
}

/***********************************************************
 * Some tests
 **********************************************************/

// var response;
// var user_id = "mike.id";

// followUser(user_id, function(result) {
//     if(result) {
//         response = result;
//         console.log(response);
//     }
// });



module.exports = {
    clearDatabase,
    followUser,
    addFollower,
    addPhoto,
    addPost,
    updateProfileInfo,
    setOwner,
    setPrivateKey,
    getPhotos,
    getPosts,
    getProfileInfo,
    getFollowing,
    getFollowers,
    getPrivateKey
};

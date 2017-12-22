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
// var query = function(sql, msg, callback) {
//     // Connect to database
//     debug.log("Connecting to database");
//     connection.connect(err => {
//         if (err) throw err;

//         // Make query
//         debug.log("Making query");
//         connection.query(sql, (err, result) => {
//             if (err) throw err;

//             // Close connection
//             debug.log("Closing connection to database");
//             connection.end();

//             // Success!
//             debug.log("Success: " + msg);
//             callback(result);
//         });
//     });
// }

var query = function(sql, msg, callback) {
    connection.query(sql, (err, result) => {
        if (err) throw err;

        // Success!
        debug.log("Success: " + msg);
        callback(result);
    });
}

// Clears all data in the database tables. Call this, for instance, between
// tests to start with a clean slate.
var clearDatabase = function(callback) {
    var clearUserProfileInfo = "TRUNCATE TABLE profile_info";
    var clearFollowers       = "TRUNCATE TABLE followers";
    var clearFollowing       = "TRUNCATE TABLE following";
    var clearPosts           = "TRUNCATE TABLE posts";
    var clearPhotos          = "TRUNCATE TABLE photos";

    query(clearUserProfileInfo, "Cleared user profile info", function() {
    query(clearFollowers, "Cleared followers", function() {
    query(clearFollowing, "Cleared following", function() {
    query(clearPosts, "Cleared posts", function() {
    query(clearPhotos, "Cleared photos", function(result) {
        callback(result);
    })})})})});
}

/***********************************************************
 * Put requests interface to the database
 **********************************************************/

var followUser = function(bsid, callback) {
    var sql = "Insert INTO following (bsid) values ('" + bsid + "')";
    var msg = "Successfully started following " + bsid;
    query(sql, msg, callback);
}

var addFollower = function(bsid, callback) {
    var sql = "Insert INTO followers (bsid) values ('" + bsid + "')";
    var msg = "Successfully added " + bsid + " to followers";
    query(sql, msg, callback);
}

var addPhoto = function(path, callback) {
    var sql = "INSERT INTO photos (path) values ('" + path + "')";
    var msg = "Photo added";
    query(sql, msg, callback);
}

var addPost = function(timestamp, photoId, callback) {
    var sql = "INSERT INTO posts (timestamp, photoId) values ('" + timestamp + "', '" + photoId + "')";
    var msg = "Post added";
    query(sql, msg, callback);
}

var updateProfileInfo = function(profile, bsid, callback) {
    var values = "";
    if (profile.displayName) {
        values += "displayName = '" + profile.displayName + "',";
    }
    if (profile.bio) {
        values += "bio = '" + profile.bio + "',";
    }
    if (profile.profilePhotoId) {
        values += "profilePhotoId = '" + profile.profilePhotoId + "',";
    }
    if (profile.coverPhotoId) {
        values += "coverPhotoId = '" + profile.coverPhotoId + "',";
    }

    if (values === "") {
        // Nothing to update
        callback();
        return;
    }

    // Cut off trailing comma
    values = values.substring(0, sql.length - 1);

    // Construct complete SQL statement
    sql = "UPDATE profile_info SET " + values + " WHERE bsid = " + bsid;

    var msg = "Profile updated";
    query(sql, msg, callback);
}

var setOwner = function(bsid, callback) {
    var sql = "INSERT INTO profile_info (bsid) values ('" + bsid + "')";
    var msg = "Owner set to " + bsid;
    query(sql, msg, callback);
}


/***********************************************************
 * Get requests interface to the database
 **********************************************************/

var getPhotos = function(callback) {
    var sql = "SELECT id, path FROM photos";
    var msg = "Retrieved all photos";
    query(sql, msg, callback);
}

var getPosts = function(callback) {
    var sql = "SELECT id, path, timestamp from posts";
    var msg = "Retrieved all posts";
    query(sql, msg, callback);
}

var getProfileInfo = function(callback) {
    var sql = "SELECT bsid, displayName, bio, profilePhotoId, coverPhotoId FROM profile_info";
    var msg = "Got profile info";
    query(sql, msg, function(rows) {
        // Parse result into a single JSON object before calling callback,
        // since it comes back as an array of rows.
        callback(rows[0]);
    });
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
    getPhotos,
    getPosts,
    getProfileInfo,
    getFollowing,
    getFollowers
};

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
    var clearUserProfileInfo = "TRUNCATE TABLE users_profile_info";
    var clearFollowers       = "TRUNCATE TABLE followers";
    var clearFollowing       = "TRUNCATE TABLE following";
    var clearPosts           = "TRUNCATE TABLE posts";

    query(clearUserProfileInfo, "Cleared user profile info", function() {
    query(clearFollowers, "Cleared followers", function() {
    query(clearFollowing, "Cleared following", function() {
    query(clearPosts, "Cleared posts", function(result) {
        callback(result);
    })})})});
}

/***********************************************************
 * Put requests interface to the database
 **********************************************************/

var followUser = function(user_id, callback) {
    var sql = "Insert INTO following (bsid) values ('" + user_id + "')";
    var msg = "Successfully started following " + user_id;
    query(sql, msg, callback);
}

var addFollower = function(user_id, callback) {
    var sql = "Insert INTO followers (bsid) values ('" + user_id + "')";
    var msg = "Successfully added " + user_id + " to followers";
    query(sql, msg, callback);
}

var addPost = function(path, timestamp, callback) {
    var sql = "INSERT INTO posts (path, time_stamp) values ('" + path + "', '" + timestamp + "')";
    var msg = "Post added";
    query(sql, msg, callback);
}

var updateProfileInfo = function(profile, callback) {
    var sql = "UPDATE users_profile_info SET display_name = '" + profile.display_name + "', bio = '" + profile.bio + "', profile_photo_path = '" +
        profile.profile_photo_path + "', cover_photo_path = '" + profile.cover_photo_path + "' WHERE bsid = '" + profile.bsid + "'";
    var msg = "Profile updated";
    query(sql, msg, callback);
}

var setOwner = function(owner, callback) {
    var sql = "INSERT INTO users_profile_info (bsid) values ('" + owner + "')";
    var msg = "Owner set to " + owner;
    query(sql, msg, callback);
}


/***********************************************************
 * Get requests interface to the database
 **********************************************************/

var retrievePosts = function(callback) {
    var sql = "SELECT post_id, path, time_stamp from posts";
    var msg = "Retrieved all posts";
    query(sql, msg, callback);
}

var getProfileInfo = function(callback) {
    var sql = "SELECT bsid, display_name, bio, profile_photo_path, cover_photo_path FROM users_profile_info";
    var msg = "Got profile info";
    query(sql, msg, function(rows) {
        // Parse result into a single JSON object before calling callback,
        // since it comes back as an array of rows.
        callback(rows[0]);
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
    addPost,
    updateProfileInfo,
    setOwner,
    retrievePosts,
    getProfileInfo
};

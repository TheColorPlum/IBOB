/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's data access layer (DAL)
 * (see documentation for details).
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'TuringP_lumRubik$9',
    database : 'The_Feed'
});

var response;
var user_id = "mike.id";

follow_user(user_id, function(result) {
    if(result) {
        response = result;
        console.log(response);
    }
});

/***********************************************************
 * Put requests interface to the database
 **********************************************************/
function follow_user(user_id, callback) {
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "Insert INTO following (bsid) values ('" + user_id + "')";

    connection.query(sql, function (err, result) {
        if (err) throw err;

        console.log("1 follower added.");

        callback(result);

        connection.end();
    });
}

function add_follower(user_id, callback) {
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "Insert INTO followers (bsid) values ('" + user_id + "')";

    connection.query(sql, function (err, result) {
        if (err) throw err;

        console.log("1 follower added.");

        callback(result);
    });

    connection.end();
}

function add_post(path, timestamp, callback) {
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "INSERT INTO posts (path, time_stamp) values ('" + path + "', '" + timestamp + "')";

    connection.query(sql, function (err, result) {
        if (err) throw err;

        console.log("1 post added.");

        callback(result);
    });

    connection.end();
}

function update_profile_info(profile, callback) {
    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "UPDATE users_profile_info SET display_name = '" + profile.display_name + "', bio = '" + profile.bio + "', profile_photo_path = '" +
        profile.profile_photo_path + "', cover_photo_path = '" + profile.cover_photo_path + "' WHERE bsid = " + profile.bsid;

    connection.query(sql, function (err, result) {
        if (err) throw err;

        console.log("Profile updated.");

        callback(result);
    });

    connection.end();
}


/***********************************************************
 * Get requests interface to the database
 **********************************************************/

function retrieve_posts(callback) {

    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "SELECT post_id, path, time_stamp from posts";

    connection.query(sql, function (err, rows) {
        if (err) throw err;

        // Potential formatting of data, logs to the console results of the query. Returns as an array of objects
        for (var i = 0; i < rows.length; i++) {
            console.log("Post ID: " + rows[i].post_id + " Path: " + rows[i].path + " TimeStamp: " + rows[i].time_stamp);
        }

        callback(rows);
    });

    connection.end();
}

function get_profile_info(bsid, callback) {

    connection.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    var sql = "SELECT bsid, display_name, bio, profile_photo_path, cover_photo_path";
    connection.query(sql, function (err, rows) {
        if (err) throw err;

        // Formatting might be necessary. We could transform this into a a JSON object.
        console.log(rows[0]);

        callback(rows[0]);
    });

    connection.end();

}
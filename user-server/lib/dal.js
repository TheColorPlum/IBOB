/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the user-server's data access layer (DAL)
 * (see documentation for details).
 */

var constants = require("./constants");
var debug = require("./debug");
var fs = require("fs");
var mysql = require("mysql");

// Constants for connecting to database while in development
const host = "localhost";
const user = "root";
const password = "TuringP_lumRubik$9";

/***********************************************************/

// Determine whether database has been created yet or not,
// so we know what type of connection to make.


// At first, assume it has been created
var isDatabaseCreated = true;

// Returns a connection to MySQL. If The_Feed database has been
// created, this will be a connection to that database. If not,
// it will be a regular connection, outside that database.
var openConnection = function() {
    if (constants.projectMode === constants.developmentMode) {
        if (isDatabaseCreated) {
            return mysql.createConnection({
                host               : host,
                user               : user,
                password           : password,
                multipleStatements : true,
                database           : 'The_Feed'
            });
        } else {
            return mysql.createConnection({
                host               : host,
                user               : user,
                password           : password,
                multipleStatements : true
            });
        }
    }

    else {
        // In production mode, make connection using the ClearDB database URL
        return mysql.createConnection(constants.cleardbDatabaseUrl);
    }

}


// Now check if we need to change this assumption
connection = openConnection();
connection.connect(err => {
    if (err) {
        // Couldn't connect - database must not have been
        // created yet
        isDatabaseCreated = false;
        connection = openConnection();
    }
});


/***********************************************************/

// Standard function for making a query to the database. Pass SQL query
// `sql`, a message to print once the query succeeds, and the callback
// function to process the results from the database (if there are any).
var query = function(sql, msg, callback) {
    if (connection === null) {
        // First open a connection
        connection = openConnection();
    }

    connection.query(sql, (err, result) => {
        if (err) throw err;

        // Close connection
        closeConnection();

        // Success!
        if (msg !== "") {
            debug.log("Database query successful: " + msg);
        }
        callback(result);
    });
}


// Closes the current connection to the database. In the server (which runs
// forever) you never need to close the connection. However, any code that
// terminates must call this before it finishes, or it will hang at the end.
// You can keep making queries even after calling this though; a new
// connection will be made.
//
// Callback is optional
var closeConnection = function(callback) {
    // connection.end(() => {
    //     connection = null;

    //     if (callback) callback();
    // });
    connection.destroy();
    connection = null;
    if (callback) callback();
}


// Creates the database and its tables, if in development mode, or only creates
// the tables if in production mode.
var createDatabase = function(callback) {
    // Read table creation SQL from file
    // var createTablesSql = fs.readFileSync("create-database.sql", "utf8");

    // Define tables
    var createPhotosTable = "CREATE TABLE IF NOT EXISTS photos (\
      id int NOT NULL auto_increment,\
      path varchar(255),\
      PRIMARY KEY (id)\
    )";
    var createPostsTable = "CREATE TABLE IF NOT EXISTS posts (\
      id int NOT NULL auto_increment,\
      photoId int,\
      timestamp varchar(255),\
      PRIMARY KEY (id),\
      FOREIGN KEY (photoId) REFERENCES photos(id)\
    )";
    var createProfileInfoTable = "CREATE TABLE IF NOT EXISTS profile_info (\
      id int NOT NULL auto_increment,\
      bsid varchar(255),\
      displayName varchar(255),\
      bio varchar(255),\
      profilePhotoId int,\
      coverPhotoId int,\
      PRIMARY KEY (id),\
      FOREIGN KEY (profilePhotoId) REFERENCES photos(id),\
      FOREIGN KEY (coverPhotoId) REFERENCES photos(id)\
    )";
    var createFollowingTable = "CREATE TABLE IF NOT EXISTS following (\
      id int NOT NULL auto_increment,\
      bsid varchar(255),\
      PRIMARY KEY (id)\
    )";

    if (constants.projectMode === constants.developmentMode) {
        var createDatabaseSql = "CREATE DATABASE IF NOT EXISTS The_Feed";

        // Create database
        debug.log("Creating the database...");
        query(createDatabaseSql, "Created The_Feed database", function() {

        isDatabaseCreated = true;

        // Create tables
        debug.log("Creating the tables...");
        query(createPhotosTable, "Created photos table", function() {
        query(createPostsTable, "Created posts table", function() {
        query(createProfileInfoTable, "Created profile info table", function() {
        query(createFollowingTable, "Created following table", function() {

        // Done
        callback();

        })})})})});
    } else { // in production mode
        debug.log("Creating the database tables...");
        query(createPhotosTable, "Created photos table", function() {
        query(createPostsTable, "Created posts table", function() {
        query(createProfileInfoTable, "Created profile info table", function() {
        query(createFollowingTable, "Created following table", function() {

        // Done
        callback();

        })})})});
    }
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

    // Clear following
    query(clearTable + "following", "", function() {
    query(resetTable1 + "following" + resetTable2, "", function() {

    // Callback
    callback();

    })})})})})})})});
}

/***********************************************************
 * Put requests interface to the database
 **********************************************************/

var followUser = function(bsid, callback) {
    var sql = "Insert INTO following (bsid) values (" + mysql.escape(bsid) + ")";
    var msg = "Started following " + bsid;
    query(sql, msg, callback);
}

var addPhoto = function(path, callback) {
    var sql = "INSERT INTO photos (path) values (" + mysql.escape(path) + ")";
    var msg = "Photo added";
    query(sql, msg, callback);
}

var addPost = function(photoId, timestamp, callback) {
    var sql = "INSERT INTO posts (photoId, timestamp) values ("
      + mysql.escape(photoId) + ", " + mysql.escape(timestamp) + ")";
    var msg = "Post added";
    query(sql, msg, callback);
}

var updateProfileInfo = function(bsid, profile, callback) {
    var values = "";
    if (profile.displayName) {
        values += "displayName = " + mysql.escape(profile.displayName) + ",";
    }
    if (profile.bio) {
        values += "bio = " + mysql.escape(profile.bio) + ",";
    }
    if (profile.profilePhotoId) {
        values += "profilePhotoId = " + mysql.escape(profile.profilePhotoId) + ",";
    }
    if (profile.coverPhotoId) {
        values += "coverPhotoId = " + mysql.escape(profile.coverPhotoId) + ",";
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
      + mysql.escape(bsid);

    var msg = "Profile updated";
    query(sql, msg, callback);
}

var setOwner = function(bsid, callback) {
    var sql = "INSERT INTO profile_info (bsid) values ("
      + mysql.escape(bsid) + ")";
    var msg = "Owner set to " + bsid;
    query(sql, msg, callback);
}


/***********************************************************
 * Get requests interface to the database
 **********************************************************/

// Returns the photo with id photoId as an object:
//   {success: true, id: 26, path: '/path/to/photo.png'}  (if it exists)
//   {success: false}                                     (if it doesn't exist)
var getPhoto = function(photoId, callback) {
    var sql = "SELECT * FROM photos WHERE id = " + mysql.escape(photoId);
    var msg = "Retrieved photo " + photoId;
    query(sql, msg, function(rows) {

        if (rows.length == 0) {
            // No photo with that ID
            callback({success: false});
        } else {
            var photo = rows[0];
            callback({success: true, id: photo.id, path: photo.path});
        }
    });
}

var getPosts = function(callback) {
    var sql = "SELECT * FROM posts JOIN photos ON posts.photoId = photos.id"
               + " ORDER BY timestamp DESC";
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

/******************************************************************************/

closeConnection(() => {
    module.exports = {
        closeConnection,
        createDatabase,
        clearDatabase,
        followUser,
        addPhoto,
        addPost,
        updateProfileInfo,
        setOwner,
        getPhoto,
        getPosts,
        getProfileInfo,
        getFollowing
    };
});

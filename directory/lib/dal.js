/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the directory's data access layer (DAL)
 * (see documentation for details).
 */

var constants = require("./constants");
var debug = require("./debug");
var fs = require("fs");
var mysql = require("mysql");

/***********************************************************/

// Determine whether database has been created yet or not,
// so we know what type of connection to make.


// At first, assume it has been created
var isDatabaseCreated = true;

// Returns a connection to MySQL. If User_Server_Directory database has been
// created, this will be a connection to that database. If not,
// it will be a regular connection, outside that database.
var openConnection = function() {
    if (constants.projectMode === constants.developmentMode) {
        // Make a manual connection
        if (isDatabaseCreated) {
            return mysql.createConnection({
                host               : constants.mysqlHost,
                user               : constants.mysqlUser,
                password           : constants.mysqlPassword,
                multipleStatements : true,
                database           : 'User_Server_Directory'
            });
        } else {
            return mysql.createConnection({
                host               : constants.mysqlHost,
                user               : constants.mysqlUser,
                password           : constants.mysqlPassword,
                multipleStatements : true
            });
        }
    }

    else {
        // In production mode, make connection using the database URL
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

/******************************************************************************/

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


// Creates the database and its table, if in development mode, or only creates
// the table if in production mode.
var createDatabase = function(callback) {
    // Read table creation SQL from file
    var createTableSql = fs.readFileSync("create-database.sql", "utf8");

    if (constants.projectMode === constants.developmentMode) {
        var createDatabaseSql = "CREATE DATABASE IF NOT EXISTS User_Server_Directory";

        // Create database
        debug.log("Creating the database...");
        query(createDatabaseSql, "Created User_Server_Directory database", function() {

        isDatabaseCreated = true;

        // Create tables
        debug.log("Creating the table...");
        query(createTableSql, "Created User_Server_Directory's table", function() {

        // Done. Callback.
        callback();

        })});
    } else { // in production mode
        debug.log("Creating the database table...");
        query(createTableSql, "Created database table", function() {
            // Done
            callback();
        });
    }
}


// Clears all data in the database tables. Call this, for instance, between
// tests to start with a clean slate.
var clearDatabase = function(callback) {
    var clearUserServers = "DELETE FROM user_servers";
    var resetUserServers = "ALTER TABLE user_servers AUTO_INCREMENT = 1";

    query(clearUserServers, "", function() {
    query(resetUserServers, "", function() {
        callback();
    })});
}


/******************************************************************************/

/*
 * Gets the IP address corresponding to bsid (a user)
 */
var get = function(bsid, callback) {
    var sql = "SELECT bsid, ip FROM user_servers WHERE bsid = "
      + mysql.escape(bsid);
    var msg = "Made query for " + bsid + "'s ip";
    query(sql, msg, function(rows) {
        if (rows.length == 0) {
            // No entry for that user
            callback({success: false});
        } else {
            // Return IP address of that user
            var entry = rows[0];
            callback({success: true, ip: entry.ip});
        }
    });
};


/*
 * Adds a mapping from bsid to ip, or overwrites it if there already is one.
 */
var put = function(bsid, ip, callback) {
    // Check if entry exists for this user
    get(bsid, result => {

    var sql = "";
    var msg = "";
    if (result.success) {
        // Entry for this user already exists. Make an overwrite query.
        sql = "UPDATE user_servers SET ip = " + mysql.escape(ip) + " "
          + "WHERE bsid = " + mysql.escape(bsid);
        msg = "Overwrote entry for " + bsid + " with " + ip;
    } else {
        // Entry does not exist. Make a query to add a new entry.
        sql = "INSERT INTO user_servers (bsid, ip) VALUES ("
          + mysql.escape(bsid) + ", " + mysql.escape(ip) + ")";
        msg = "Inserted new entry: (" + bsid + ", " + ip + ")";
    }

    query(sql, msg, function() {
        callback({success: true});
    });

    }); // end of get()
}


/******************************************************************************/

// Close connection before exiting.
closeConnection(() => {
    module.exports = {
        closeConnection,
        createDatabase,
        clearDatabase,
        get,
        put
    };
});


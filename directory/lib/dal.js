/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Implements the directory's data access layer (DAL)
 * (see documentation for details).
 */

var debug = require("./debug");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host     : "localhost",
    user     : "root",
    password : "TuringP_lumRubik$9",
    database : "User_Server_Directory"
});

/******************************************************************************/

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
    var clearUserServers = "DELETE FROM user_servers";
    var resetUserServers = "ALTER TABLE user_servers AUTO_INCREMENT = 1";

    query(clearUserServers, "", function() {
    query(resetUserServers, "", function() {
        callback();
    })});
}


/******************************************************************************/

/*
 * Gets the IP address corresponding to bsid (a user). Calls the callback on
 * a result in the following format:
 *   {success: true, ip: "192.168.0.12"}
 * where success is false if an entry doesn't exist for that user.
 */
var get = function(bsid, callback) {
    var sql = "SELECT bsid, INET_NTOA(ip) AS ip FROM user_servers WHERE bsid = "
      + connection.escape(bsid);
    var msg = "Made query for " + bsid + "'s IP address";
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
 * Adds a mapping from bsid to ip (given in decimal notation as a string),
 * overwriting if there already is one. Calls the callback on a result in the
 * following format:
 *   {success: true}
 */
var put = function(bsid, ip, callback) {
    // Check if entry exists for this user
    get(bsid, result => {

    var sql = "";
    var msg = "";
    if (result.success) {
        // Entry for this user already exists. Make an overwrite query.
        sql = "UPDATE user_servers SET ip = INET_ATON(" + connection.escape(ip) + ") "
          + "WHERE bsid = " + connection.escape(bsid);
        msg = "Overwrote entry for " + bsid + " with " + ip;
    } else {
        // Entry does not exist. Make a query to add a new entry.
        sql = "INSERT INTO user_servers (bsid, ip) VALUES ("
          + connection.escape(bsid) + ", "
          + "INET_ATON(" + connection.escape(ip) + ")"
          + ")";
        msg = "Inserted new entry: (" + bsid + ", " + ip + ")";
    }

    query(sql, msg, function() {
        callback({success: true});
    });

    }); // end of get()
}


module.exports = {
    clearDatabase,
    get,
    put
};

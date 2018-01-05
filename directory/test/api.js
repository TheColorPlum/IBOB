/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the directory's web API.
 */

var assert = require("assert");
var api = require("../routes/api");
var axios = require("axios");
var constants = require("../lib/constants");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var requests = require("../lib/requests");

/******************************************************************************/

// Run this first at each test to clear/prepare the database. Pass the test
// code in the callback. e.g:
//   setup(() => {
//       test code goes here...
//       done();
//   });
var setup = function(callback) {
    // Set up database with Alice as owner
    debug.log("Resetting database");
    dal.clearDatabase(() => {
        // Run test
        callback();
    });
}

/******************************************************************************/

// /get tests
describe("/api" + api.urls.get, function() {

    // Normal case - entry exists
    it("Returns the user-server's IP address", function(done) {
        setup(() => {

        // Put a (bsid, IP address) mapping into the database
        var entry = {bsid: constants.aliceBsid, ip: "192.168.0.0"};
        dal.put(entry.bsid, entry.ip, () => {

        // Define expected response
        var correctResponse = {success: true, ip: entry.ip};

        // Make request
        axios.get(constants.serverBaseUrl + "/api/get/" + constants.aliceBsid)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response was incorrect");
                done();
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()
        }); // end of dal.put()

        });
    });


    // Failure case - entry doesn't exist
    it("Returns a failure when an entry for a user doesn't exist", function(done) {
        setup(() => {

        // Define expected response
        var correctResponse = {success: false, msg: "User-server does not exist"};

        // Make request
        axios.get(constants.serverBaseUrl + "/api/get/" + constants.aliceBsid)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response was incorrect");
                done();
            } catch (err) {
                done(err);
            }

        });

        });
    });
});



// /put tests
describe("/api" + api.urls.put, function() {

    // Normal case 1 - entry doesn't exist. Check that it gets added.
    it("Inserts an entry that doesn't yet exist", function(done) {
        setup(() => {

        // Define expected response
        var correctResponse = {success: true};

        // Define expected result from database after making the request
        var ip = "192.168.0.0";
        var correctResult = {success: true, ip: ip};

        // Make request
        var data = {bsid: constants.aliceBsid, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, constants.adminPrivateKey);
        axios.post(constants.serverBaseUrl + "/api" + api.urls.put + "?requester=" + constants.adminBsid, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(constants.aliceBsid, result => {
                assert.deepStrictEqual(result, correctResult,
                    "Database returned the wrong result after call to /put");
                done();

                }); // end of dal.get()
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        });
    });


    // Normal case 2 - entry exists and gets overwritten.
    it("Overwrites an existing entry with new IP address", function(done) {
        setup(() => {

        // Insert an entry first
        var ip = "192.168.0.0";
        dal.put(constants.aliceBsid, ip, () => {

        // Define expected API response
        var correctResponse = {success: true};

        // Define expected result from database after making the request
        var newIp = "192.168.0.1";
        var correctResult = {success: true, ip: newIp};

        // Make request
        var data = {bsid: constants.aliceBsid, ip: newIp, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, constants.adminPrivateKey);
        axios.post(constants.serverBaseUrl + "/api" + api.urls.put + "?requester=" + constants.adminBsid, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(constants.aliceBsid, result => {
                assert.deepStrictEqual(result, correctResult,
                    "Database returned the wrong result after call to /put");
                done();

                }); // end of dal.get()
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        }); // end of dal.put()

        });
    });


    // Failure case 1 - non-admin tries to write to their own entry
    it("Returns a failure when a non-admin tries to write to their own entry", function(done) {
        setup(() => {

        // Insert an entry for Alice first
        var ip = "192.168.0.0";
        dal.put(constants.aliceBsid, ip, () => {

        // Define expected API response
        var correctResponse = {success: false,
          msg: "Denied: Requester " + constants.aliceBsid + " is not the admin " + constants.adminBsid + ". Does not have permission to write to the directory."};

        // Define expected result from database after the request (should be
        // unchanged from dal.put())
        var correctResult = {success: true, ip: ip};

        // Make request - from Alice, trying to write her own
        var data = {bsid: constants.aliceBsid, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, constants.alicePrivateKey);
        axios.post(constants.serverBaseUrl + "/api" + api.urls.put + "?requester=" + constants.aliceBsid, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(constants.aliceBsid, result => {
                assert.deepStrictEqual(result, correctResult,
                    "Database returned the wrong result after call to /put");
                done();

                }); // end of dal.get()
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        }); // end of dal.put()

        });
    });


    // Failure case 2 - non-admin tries to write an entry that isn't theirs
    it("Returns a failure when a non-admin tries to write someone else's entry", function(done) {
        setup(() => {

        // Insert an entry for Alice first
        var ip = "192.168.0.0";
        dal.put(constants.aliceBsid, ip, () => {

        // Define expected API response
        var correctResponse = {success: false,
          msg: "Denied: Requester " + constants.bobBsid + " is not the admin " + constants.adminBsid + ". Does not have permission to write to the directory."};

        // Define expected result from database after the request (should be
        // unchanged from dal.put())
        var correctResult = {success: true, ip: ip};

        // Make request - from *Bob*, trying to write *Alice's* entry
        var data = {bsid: constants.aliceBsid, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, constants.bobPrivateKey);
        axios.post(constants.serverBaseUrl + "/api" + api.urls.put + "?requester=" + constants.bobBsid, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(constants.aliceBsid, result => {
                assert.deepStrictEqual(result, correctResult,
                    "Database returned the wrong result after call to /put");
                done();

                }); // end of dal.get()
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        }); // end of dal.put()

        });
    });
});

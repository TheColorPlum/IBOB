/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for the directory's web API.
 */

var assert = require("assert");
var api = require("../routes/api");
var axios = require("axios");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var requests = require("../lib/requests");

/******************************************************************************/

const baseUrl = "http://localhost:4000";

const alice = "alice.id";
const bob = "bob.id";

const alicePrivateKey = "86fc2fd6b25e089ed7e277224d810a186e52305d105f95f23fd0e10c1f15854501";
var bobPrivateKey     = "3548b2141ac92ada2aa7bc8391f15b8d70881956f7c0094fdde72313d06393b601";


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
describe("/api " + api.urls.get, function() {

    // Normal case - entry exists
    it("Returns the user-server's IP address", function(done) {
        setup(() => {

        // Put a (bsid, IP address) mapping into the database
        var entry = {bsid: alice, ip: "192.168.0.0"};
        dal.put(entry.bsid, entry.ip, () => {

        // Define expected response
        var correctResponse = {success: true, ip: entry.ip};

        // Make request
        var data = {bsid: alice, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.get + "?requester=" + alice, reqBody)
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
        var data = {bsid: alice, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.get + "?requester=" + alice, reqBody)
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
    it("Inserts an entry when that doesn't yet exist", function(done) {
        setup(() => {

        // Define expected response
        var correctResponse = {success: true};

        // Define expected result from database after making the request
        var ip = "192.168.0.0";
        var correctResult = {success: true, ip: ip};

        // Make request
        var data = {bsid: alice, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.put + "?requester=" + alice, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(alice, result => {
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
        dal.put(alice, ip, () => {

        // Define expected API response
        var correctResponse = {success: true};

        // Define expected result from database after making the request
        var newIp = "192.168.0.1";
        var correctResult = {success: true, ip: newIp};

        // Make request
        var data = {bsid: alice, ip: newIp, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.put + "?requester=" + alice, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(alice, result => {
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


    // Failure case 1 - user tries to write an entry that isn't theirs
    it("Returns a failure when a user tries to write someone else's entry", function(done) {
        setup(() => {

        // Insert an entry for Alice first
        var ip = "192.168.0.0";
        dal.put(alice, ip, () => {

        // Define expected API response
        var correctResponse = {success: false,
          msg: "Denied: Requester bob.id is not alice.id. Does not have permission to write to alice.id."};

        // Define expected result from database after the request (should be
        // unchanged from dal.put())
        var correctResult = {success: true, ip: ip};

        // Make request - from *Bob*, trying to write *Alice's* entry
        var data = {bsid: alice, ip: ip, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, bobPrivateKey);
        axios.post(baseUrl + "/api" + api.urls.put + "?requester=" + bob, reqBody)
        .then(resp => {

            try {
                // Check that response matches expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "API response was incorrect");

                // Check that contents of database are correct
                dal.get(alice, result => {
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

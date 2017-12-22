/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for our web API.
 */

var assert = require("assert");
var api = require("../routes/api");
var aps = require("../routes/aps");
var axios = require("axios");
var dal = require("../dal");
var debug = require("../debug");
var jsontokens = require("jsontokens");

/******************************************************************************/

const baseUrl = "http://localhost:3000";

const alice = "alice.id";
const alicePrivateKey = "86fc2fd6b25e089ed7e277224d810a186e52305d105f95f23fd0e10c1f15854501";


// Run this first at each test to clear/prepare the database. Pass the test
// code in the callback. e.g:
//   setup(() => {
//       test code goes here...
//       done();
//   });
var setup = function(callback) {
    // Set up database with Alice as owner
    dal.clearDatabase(() => {
        dal.setOwner(alice, () => {
            // Run test
            callback();
        });
    });
}

/******************************************************************************/

// Tests here

describe("GET /api" + api.urls.getProfileInfo, function() {

    it("Returns correct profile info", function(done) {
        setup(() => {

        // Define profile info
        var profileInfo = {
            id: alice,
            name: "Alice",
            bio: "Sample bio",
            profilePhoto: 11,
            coverPhoto: 21
        };

        var bob = "bob.id";
        var mallory = "mallory.id";
        var following = [bob, mallory];

        // Insert profile info into the database
        dal.updateProfileInfo(profileInfo, () => {

        // Add users Alice is following
        dal.followUser(bob, () => {
        dal.followUser(mallory, () => {

        // Make request
        var data = {"timestamp": (new Date()).toJSON()};
        var reqBody = new jsontokens.TokenSigner(aps.encAlg, alicePrivateKey).sign(data);
        axios.post(baseUrl + "/api" + api.urls.getProfileInfo + "?requester=" + alice, reqBody)
        .then(resp => {
            try {
                // Check that response has all attributes
                var json = resp.data;
                debug.log(JSON.stringify(json));
                for (attr in profileInfo) {
                    assert(json.hasOwnProperty(attr), "Response is missing attribute: " + attr);
                    assert.strictEqual(json[attr], profileInfo[attr], "Response has wrong value for attribute: " + attr);
                }
                assert(json.hasOwnProperty("following"), "Response is missing attribute: following");

                // Check that response has only those attributes
                var numAttrs = Object.keys(json).length;
                var correctNumAttrs = Object.keys(profileInfo).length + 1;
                assert.strictEqual(numAttrs, correctNumAttrs, "Response has more attributes than it should. Response:\n" + JSON.stringify(json));

                // Check that "following" lists match
                assert.deepStrictEqual(json.following, following, "Response's 'following' list is incorrect. Response: " + json.following + "; actual: " + following);
            } catch (err) {
                done(err);
            }
        })})})})});
    });
});


describe("GET /api" + api.urls.getPosts, function() {

    it.skip("Returns correct posts", function() {

    });
});


describe("GET /api" + api.urls.getFeed, function() {

});

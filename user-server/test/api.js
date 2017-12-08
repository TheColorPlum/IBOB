/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for our web API.
 */

var assert = require("assert");
var api = require("../routes/api");
var axios = require("axios");
var dal = require("../dal");

const baseUrl = "http://localhost:3000";

// Tests here

describe("GET /api" + api.urls.getProfileInfo, function() {

    it("Returns correct profile info", function() {
        // Define profile info
        var profileInfo = {
            id: "alice.id",
            name: "Alice",
            bio: "Sample bio",
            profilePhoto: 11,
            coverPhoto: 21
        };

        var following = ["bob.id", "mallory.id"];

        // Insert profile info into the database
        dal.updateProfileInfo(profileInfo);
        following.forEach(user => {
            dal.addFollowing(user);
        });

        // Make request
        var reqBody = {"timestamp": (new Date()).toJSON()};
        return axios.post(baseUrl + "/api" + api.urls.getProfileInfo + "?requester=alice.id", reqBody)
        .then(resp => {
            // Check that response has all attributes
            var json = resp.data;
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
        });
    });
});


describe("GET /api" + api.urls.getPosts, function() {

    it("Returns correct posts", function() {

    });
});


describe("GET /api" + api.urls.getFeed, function() {

});

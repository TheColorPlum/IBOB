/*
 * api-putLike.js
 * Author: Michael Friedman
 *
 * Tests for the API's putLike() function.
 */

// Imports
var assert = require("assert");
var blockstack = require("blockstack");  // TODO: Is this all I need for blockstack to work in the tests?
var ibob = require("../public/api");

// Test basic funtionality
describe("Basic functionality", function() {

    // // Test that likes are stored in correct location
    // it("Can store a like in the correct location", function(done) {
    //     // Log into blockstack
    //     // TODO

    //     // Like a sample post
    //     var owner = "sampleuser.id";
    //     var post = 10;

    //     ibob.putLike(blockstack, owner, post).then(function() {

    //         // Read the likes file from storage
    //         var likesFile = ibob.likesFile(owner);
    //         assert.equal(likesFile, "post-data/" + owner + "/likes.json");
    //         return blockstack.getFile(likesFile, ibob.IS_ENCRYPTED);

    //     }).then(function(likesJson) {

    //         assert.ok(true); // file exists

    //         done();
    //     });
    // });


    // Test that likes are stored in correct format
    it("Can store a like in the correct format", function(done) {
        // Log into blockstack
        blockstack.redirectToSignIn();

        var runTest = function() {

            // Like some sample posts by a sample user
            var owner = "sampleuser.id";
            var post1 = 10;
            var post2 = 20;
            var post3 = 30;

            ibob.putLike(blockstack, owner, post1).then(function() {

                return ibob.putLike(blockstack, owner, post2);

            }).then(function() {

                return ibob.putLike(blockstack, owner, post3);

            }).then(function() {

                // Read the likes file from storage
                var likesFile = ibob.likesFile(owner);
                return blockstack.getFile(likesFile, ibob.IS_ENCRYPTED);

            }).then(function(likesJson) {

                // Parse likes file
                return JSON.parse(likesJson);

            }).then(function(likes) {

                // Check correct contents and format `likes` object
                var expectedLikes = [post1, post2, post3];
                assert.deepEqual(likes, expectedLikes);

                done();
            });
        };

        if (blockstack.isUserSignedIn()) {
            runTest();
        } else if (blockstack.isSignInPending()) {
            blockstack.handlePendingSignIn().then(function(userData) {
                runTest();
            });
        }
    });

});

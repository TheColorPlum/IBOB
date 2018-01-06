/*
 * api.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Tests for our web API.
 */

var assert = require("assert");
var api = require("../routes/api");
var aps = require("../lib/aps");
var axios = require("axios");
var dal = require("../lib/dal");
var debug = require("../lib/debug");
var jsontokens = require("jsontokens");
var requests = require("../lib/requests");

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
    debug.log("Resetting database");
    dal.clearDatabase(() => {
        dal.setOwner(alice, () => {
            // Run test
            callback();
        });
    });
}

/******************************************************************************/

// Get operations
describe("Get operations", function() {

describe("/api" + api.urls.getProfileInfo, function() {

    it("Returns correct profile info", function(done) {
        setup(() => {

        // Define profile info
        var profilePhoto = {
            id: 1,
            path: "profile.png"
        };

        var coverPhoto = {
            id: 2,
            path: "cover.png"
        };

        var profileInfo = {
            displayName: "Alice",
            bio: "Sample bio",
            profilePhotoId: profilePhoto.id,
            coverPhotoId: coverPhoto.id
        };

        var bob = "bob.id";
        var mallory = "mallory.id";
        var following = [bob, mallory];

        // Define expected JSON response
        var correctResponse = {
            bsid: alice,
            displayName: profileInfo.displayName,
            bio: profileInfo.bio,
            profilePhoto: profilePhoto,
            coverPhoto: coverPhoto,
            following: following
        };

        // Insert photos
        dal.addPhoto(profilePhoto.path, () => {
        dal.addPhoto(coverPhoto.path, () => {

        // Insert profile info into the database
        dal.updateProfileInfo(alice, profileInfo, () => {

        // Add users Alice is following
        dal.followUser(bob, () => {
        dal.followUser(mallory, () => {

        // Make request
        var data = {"timestamp": requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.getProfileInfo + "?requester=" + alice, reqBody)
        .then(resp => {
            try {
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response is incorrect");
                done();
            } catch (err) {
                done(err);
            }
        })})})})})})});
    });
});


describe("/api" + api.urls.getPosts, function() {

    it("Returns correct posts when request is in range", function(done) {
        setup(() => {

        // Add a few posts
        var post1 = {id: 1, photo: {id: 1, path: "https://s3.amazon.com/1.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post1.photo.path, () => {

        var post2 = {id: 2, photo: {id: 2, path: "https://s3.amazon.com/2.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post2.photo.path, () => {

        var post3 = {id: 3, photo: {id: 3, path: "https://s3.amazon.com/3.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post3.photo.path, () => {

        dal.addPost(post1.id, post1.timestamp, () => {
        dal.addPost(post2.id, post2.timestamp, () => {
        dal.addPost(post3.id, post3.timestamp, () => {

        // Define expected response
        var correctResponse = {
            success: true,
            posts: [
                {id: post2.id, timestamp: post2.timestamp, photo:
                    {id: post2.photo.id, path: post2.photo.path}},
                {id: post1.id, timestamp: post1.timestamp, photo:
                    {id: post1.photo.id, path: post1.photo.path}}
            ]
        };

        // Make request
        var data = {count: 2, offset: 1, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.getPosts + "?requester=" + alice, reqBody)
        .then(resp => {

            try {
                // Check that response is the same as expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response is incorrect");
                done();
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        })})}); // end of dal.addPost()'s

        })})}); // end of dal.addPhoto()'s

        });
    });


    it("Returns correct posts when request goes over limit", function(done) {
        setup(() => {

        // Add a few posts
        var post1 = {id: 1, photo: {id: 1, path: "https://s3.amazon.com/1.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post1.photo.path, () => {

        var post2 = {id: 2, photo: {id: 2, path: "https://s3.amazon.com/2.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post2.photo.path, () => {

        var post3 = {id: 3, photo: {id: 3, path: "https://s3.amazon.com/3.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post3.photo.path, () => {

        dal.addPost(post1.id, post1.timestamp, () => {
        dal.addPost(post2.id, post2.timestamp, () => {
        dal.addPost(post3.id, post3.timestamp, () => {

        // Define expected response
        var correctResponse = {
            success: true,
            posts: [
                {id: post1.id, timestamp: post1.timestamp, photo:
                    {id: post1.photo.id, path: post1.photo.path}}
            ]
        };

        // Make request
        var data = {count: 5, offset: 2, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.getPosts + "?requester=" + alice, reqBody)
        .then(resp => {

            try {
                // Check that response is the same as expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response is incorrect");
                done();
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        })})}); // end of dal.addPost()'s

        })})}); // end of dal.addPhoto()'s

        });
    });


    it("Returns no posts when request is completely out of range", function(done) {
        setup(() => {

        // Add a few posts
        var post1 = {id: 1, photo: {id: 1, path: "https://s3.amazon.com/1.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post1.photo.path, () => {

        var post2 = {id: 2, photo: {id: 2, path: "https://s3.amazon.com/2.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post2.photo.path, () => {

        var post3 = {id: 3, photo: {id: 3, path: "https://s3.amazon.com/3.png"},
            timestamp: requests.makeTimestamp()};
        dal.addPhoto(post3.photo.path, () => {

        dal.addPost(post1.id, post1.timestamp, () => {
        dal.addPost(post2.id, post2.timestamp, () => {
        dal.addPost(post3.id, post3.timestamp, () => {

        // Define expected response
        var correctResponse = {success: false};

        // Make request
        var data = {count: 10, offset: 10, timestamp: requests.makeTimestamp()};
        var reqBody = requests.makeBody(data, alicePrivateKey);
        axios.post(baseUrl + "/api" + api.urls.getPosts + "?requester=" + alice, reqBody)
        .then(resp => {

            try {
                // Check that response is the same as expected response
                var json = resp.data;
                assert.deepStrictEqual(json, correctResponse, "Response is incorrect");
                done();
            } catch (err) {
                done(err);
            }

        }); // end of axios.post()

        })})}); // end of dal.addPost()'s

        })})}); // end of dal.addPhoto()'s

        });
    });
});


describe("/api" + api.urls.getFeed, function() {

    it.skip("Returns correct feed", function(done) {
        // TODO: Implement this test
    });

});

}); // end of "Get operations"

/******************************************************************************/

// Put operations

describe("Put operations", function() {

describe("/api" + api.urls.updateProfileInfo, function() {

    it("Updates correctly when given all profile info attributes", function(done) {
        setup(() => {
            // Insert initial profile info
            var profilePhoto1 = {id: 1, path: "profile1.png"};
            var coverPhoto1 = {id: 2, path: "cover1.png" };
            var profileInfo1 = {
                displayName: "Alice",
                bio: "Sample bio",
                profilePhotoId: profilePhoto1.id,
                coverPhotoId: coverPhoto1.id
            };
            dal.addPhoto(profilePhoto1.path, () => {
            dal.addPhoto(coverPhoto1.path, () => {
            dal.updateProfileInfo(alice, profileInfo1, () => {

            // Define updates to profile info
            var profilePhoto2 = {id: 3, path: "profile2.png"};
            var coverPhoto2 = {id: 4, path: "cover2.png" };
            var profileInfo2 = {
                displayName: "Alice 2",
                bio: "Sample bio 2",
                profilePhotoId: profilePhoto2.id,
                coverPhotoId: coverPhoto2.id
            };

            // Insert new photos before making API call
            dal.addPhoto(profilePhoto2.path, () => {
            dal.addPhoto(coverPhoto2.path, () => {

            // Define expected contents in the database after API call
            var correctProfileInfo = {
                bsid: alice,
                displayName: profileInfo2.displayName,
                bio: profileInfo2.bio,
                profilePhotoId: profileInfo2.profilePhotoId,
                coverPhotoId: profileInfo2.coverPhotoId
            };

            // Make request. Request body must include profileInfo2 and a
            // timestamp
            var data = {};
            for (attr in profileInfo2) {
                data[attr] = profileInfo2[attr];
            }
            data.timestamp = requests.makeTimestamp();
            var reqBody = requests.makeBody(data, alicePrivateKey);
            axios.post(baseUrl + "/api" + api.urls.updateProfileInfo + "?requester=" + alice, reqBody)
            .then(resp => {

                try {
                    // Make sure request was successful
                    json = resp.data;
                    assert.strictEqual(json.success, true, "Response claimed that request was unsuccessful");

                    // Check that profile info contents in database match the
                    // expected contents
                    dal.getProfileInfo(dbProfileInfo => {

                    // Format db contents
                    dbProfileInfo.profilePhotoId = dbProfileInfo.profilePhoto.id;
                    dbProfileInfo.coverPhotoId = dbProfileInfo.coverPhoto.id;
                    delete dbProfileInfo.id;
                    delete dbProfileInfo.profilePhoto;
                    delete dbProfileInfo.coverPhoto;

                    assert.deepStrictEqual(dbProfileInfo, correctProfileInfo,
                        "Updated profile info is wrong is the database");
                    done();
                    });
                } catch (err) {
                    done(err);
                }

            }); // end of axios.post()

            })}); // end of dal.addPhotos()'s

            }); // end of dal.updateProfileInfo()
            })}); // end of dal.addPhoto()'s
        });
    });


    it("Updates correctly when given only some profile info attributes", function(done) {
        setup(() => {
            // Insert initial profile info
            var profilePhoto1 = {id: 1, path: "profile1.png"};
            var coverPhoto1 = {id: 2, path: "cover1.png" };
            var profileInfo1 = {
                displayName: "Alice",
                bio: "Sample bio",
                profilePhotoId: profilePhoto1.id,
                coverPhotoId: coverPhoto1.id
            };
            dal.addPhoto(profilePhoto1.path, () => {
            dal.addPhoto(coverPhoto1.path, () => {
            dal.updateProfileInfo(alice, profileInfo1, () => {

            // Define updates to profile info
            var profilePhoto2 = {id: 3, path: "profile2.png"};
            var updates = {
                displayName: "Alice 2",
                profilePhotoId: profilePhoto2.id
            };

            // Insert new photo before making API call
            dal.addPhoto(profilePhoto2.path, () => {

            // Define expected contents in the database after API call
            var correctProfileInfo = {
                bsid: alice,
                displayName: updates.displayName,
                bio: profileInfo1.bio,
                profilePhotoId: updates.profilePhotoId,
                coverPhotoId: profileInfo1.coverPhotoId
            };

            // Make request. Request body must include updates and a timestamp
            var data = {};
            for (attr in updates) {
                data[attr] = updates[attr];
            }
            data.timestamp = requests.makeTimestamp();
            var reqBody = requests.makeBody(data, alicePrivateKey);
            axios.post(baseUrl + "/api" + api.urls.updateProfileInfo + "?requester=" + alice, reqBody)
            .then(resp => {

                try {
                    // Make sure request was successful
                    json = resp.data;
                    assert.strictEqual(json.success, true, "Response claimed that request was unsuccessful");

                    // Check that profile info contents in database match the
                    // expected contents
                    dal.getProfileInfo(dbProfileInfo => {

                    // Format db contents
                    dbProfileInfo.profilePhotoId = dbProfileInfo.profilePhoto.id;
                    dbProfileInfo.coverPhotoId = dbProfileInfo.coverPhoto.id;
                    delete dbProfileInfo.id;
                    delete dbProfileInfo.profilePhoto;
                    delete dbProfileInfo.coverPhoto;

                    assert.deepStrictEqual(dbProfileInfo, correctProfileInfo, "Updated profile info is wrong in the database");
                    done();
                    });
                } catch (err) {
                    done(err);
                }

            }); // end of axios.post()

            }); // end of dal.addPhoto()

            }); // end of dal.updateProfileInfo()
            })}); // end of dal.addPhoto()'s
        });
    });
});


describe("/api" + api.urls.followUser, function() {

    it("Adds a user to my following list correctly", function(done) {
        setup(() => {

            // Define expected following list after request is made
            var bob = "bob.id";
            var correctFollowing = [bob];

            // Make request
            var data = {bsid: bob, timestamp: requests.makeTimestamp()};
            var reqBody = requests.makeBody(data, alicePrivateKey);
            axios.post(baseUrl + "/api" + api.urls.followUser + "?requester=" + alice, reqBody)
            .then(resp => {

                try {
                    // Make sure request was successful
                    json = resp.data;
                    assert.strictEqual(json.success, true, "Response claimed that request was unsuccessful");

                    // Check that following list is correct in the database
                    dal.getFollowing(result => {
                        // Transfer bsids into a list
                        var dbFollowing = [];
                        result.forEach(row => {
                            dbFollowing.push(row.bsid);
                        });

                        assert.deepStrictEqual(dbFollowing, correctFollowing, "Following list is incorrect after making request");
                        done();
                    });
                } catch (err) {
                    done(err);
                }

            });
        });
    });
});


describe("/api" + api.urls.addPost, function() {

    it("Adds a post correctly", function(done) {
        setup(() => {

            // Add the post's photo to the database first
            var photo = {id: 1, path: "profile.png"};
            dal.addPhoto(photo.path, () => {

            // Define expected response
            var correctResponse = {
                success: true,
                post: {id: 1, timestamp: requests.makeTimestamp(), photo: photo}
            };

            // Make request
            var data = {photoId: photo.id, timestamp: requests.makeTimestamp()};
            var reqBody = requests.makeBody(data, alicePrivateKey);
            axios.post(baseUrl + "/api" + api.urls.addPost + "?requester=" + alice, reqBody)
            .then(resp => {

                try {
                    // Check that response matches expected response, with
                    // the timestamp being within a small delta of expected
                    // timestamp
                    var json = resp.data;

                    var respTimestamp = new Date(json.post.timestamp).getTime();
                    var correctTimestamp = new Date(correctResponse.post.timestamp).getTime();
                    var delta = 5000;
                    assert(Math.abs(respTimestamp - correctTimestamp) <= delta,
                        "Post's timestamp was not an acceptable value. Response timestamp: " + json.post.timestamp + ", Acceptable timestamp: " + correctResponse.post.timestamp);

                    delete json.post.timestamp;
                    delete correctResponse.post.timestamp;

                    assert.deepStrictEqual(json, correctResponse, "Response (minus timestamp) was incorrect");
                    done();
                } catch (err) {
                    done(err);
                }

            }); // end of axios.post()

            }); // end of dal.addPhoto()

        });
    });

});


describe.skip("/api" + api.urls.addPhoto, function() {

    it("Adds a photo correctly", function(done) {
        setup(() => {
            // Define expected response
            var correctResponse = {
                success: true,
                photo: {
                    id: 1,
                    path: ""  // TODO: Fill in expected path after request is made
                }
            };

            // TODO: Implement the part that gets the raw photo in the request.
            // ...

            // Make request
            var reqBody = "";
            axios.post(baseUrl + "/api" + api.urls.addPhoto, reqBody)
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
        });
    });
});

}); // end of "Put operations"


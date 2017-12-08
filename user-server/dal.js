/*
 * dal.js
 * Authors: Michael Friedman and Pelumi Odimayo
 *
 * Data access layer: A library of functions to interface with the
 * database.
 */

// NOTE: This is just a dummy version of this file for the sake of testing
// the API. When a real version is implemented, replace it with this one.

//-----------------------------------------------------------------------------

// Variables to keep track of stuff that should go in the database

var profileInfo = {
    id: "",
    name: "",
    bio: "",
    profilePhoto: -1,
    coverPhoto: -1
};

var following = [];

//-----------------------------------------------------------------------------

// Get/put profile info

var getProfileInfo = function() {
    var ret = {};
    for (attr in profileInfo) {
        ret[attr] = profileInfo[attr];
    }
    ret["following"] = following;
    return ret;
};


var updateProfileInfo = function(newProfileInfo) {
    for (attr in newProfileInfo) {
        profileInfo[attr] = newProfileInfo[attr];
    }
};


var addFollowing = function(user) {
    following.push(user);
};


//-----------------------------------------------------------------------------

module.exports = {
    getProfileInfo,
    updateProfileInfo,
    addFollowing
};

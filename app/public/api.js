/*
 * api.js
 * Authors: Michael Friedman, Pelumi Odimayo
 *
 * Implements the API between the front and back ends from our design document.
 */

// Constants
var IS_ENCRYPTED = false;
var USER_FILE = "user.json";
var POSTS_FILE = "posts.json";
var NOTIFICATIONS_FILE = "notifications.js";


// Get/read operations

function getUserInfo(blockstack, user) {}

/******************************************************************************/

// Put/write operations

// Writes `newInfo` JS object to `user`'s profile.
function putUserInfo(blockstack, user, newInfo) {
    // TODO: Check that the user is the logged in user. Otherwise reject this operation.

    // Get current user info file
    return blockstack.getFile(USER_FILE, IS_ENCRYPTED)
    .then(function (userInfoStr) {
        // Parse old user info JSON
        return JSON.parse(userInfoStr);
    })
    .then(function (userInfo) {
        // Make changes to user info
        var attrs = ["profilePhoto", "coverPhoto", "displayName", "bio"];
        attrs.forEach(function (attr, i) {
            if (attr) {
                userInfo[attr] = newInfo[attr];
            }
        });

        // Write back to storage
        return blockstack.putFile(USER_INFO, JSON.stringify(userInfo), IS_ENCRYPTED);
    });
}


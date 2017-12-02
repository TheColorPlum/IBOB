/*
 * api.js
 * Authors: Michael Friedman, Pelumi Odimayo
 *
 * Implements the API between the front and back ends from our design document.
 */

// Get/read operations

function getUserInfo(user) {

  const blockstack = this.blockstack;
  const decrypt = true;

  var userInfo = JSON.parse(blockstack.getFile(USER_FILE, decrypt));

  return userInfo;
}

function getUserPosts(user, startIndex, count) {}

function getUserNotifications(user) {}

/******************************************************************************/


// Put/write operations

function putUserInfo(user, info) {}

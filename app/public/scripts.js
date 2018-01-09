/*
 * scripts.js
 * Author: Michael Friedman
 *
 * Defines behavior for all pages in the app.
 */

$(document).ready(function() {


/*******************************************************************************
 * Constants
 ******************************************************************************/

/*
 * Note: window.blockstack, window.requests, are available.
 * Imported via browserify in app/requires.js.
 *
 * Also, the object `constants` is available, from constants.js. See docs
 * for a list of constants it contains.
 *
 * More constants are added below.
 */

// User's Blockstack ID
const defaultBsid = 'alice.id';
if (blockstack.isUserSignedIn()) {
    constants.bsid = blockstack.loadUserData().username || defaultBsid;
} else {
    constants.bsid = defaultBsid;
}

// URLs
constants.appBaseUrl = window.location.protocol + '//' + window.location.host;
constants.userServerBaseUrl = constants.makeUserServerBaseUrl(
    sessionStorage.getItem(constants.userServerIpVarName)
);

// App URL extensions
constants.urls = {
    index: '/',
    manifest: '/manifest.json',
    initialization: '/initialization',
    createUserServer: '/create-user-server',
    profile: '/profile/',
    feed: '/feed',
    error: '/error',
    newPost: '/new-post'
};

// Timeout period in milliseconds
constants.requestTimeout = 10000;


/*******************************************************************************
 * [METRICS] Some tools for gathering metrics
 ******************************************************************************/

// Array to hold all recorded times for /new-post requests
var sessionStorageTimeTrialsVar = 'timeTrials';

// Timer with precision to 5 microseconds

/*
 * Starts and returns a new timer. Counts in milliseconds. (Timers can only be
 * used once. You have to make a new timer to time more than once.)
 */
function Timer() {

    // Start time in milliseconds since Jan 1 1970.
    this.startTime;

    // Start time for the current lap. Updated on every call to a startTime() or
    // recordLap().
    this.lapStartTime;

    // Times are times since the timer was started.
    this.recordedTimes = [];

    // Laps are times since the *last* time a startTimer() or recordLap()
    // was called.
    this.recordedLaps = [];

    // Indicates whether the timer is finished running.
    this.isDone = false;


    // Start the timer
    this.startTime = performance.now();
    this.lapStartTime = this.startTime;

    /*
     * Records the time since the timer was started. Returns that time.
     */
    this.recordTime = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        let newTime = performance.now();
        let diff = newTime - this.startTime;
        this.recordedTimes.push(diff);
        return diff;
    };


    /*
     * Records the time since the last lap was started. Returns that time.
     */
    this.recordLap = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        let newTime = performance.now();
        let diff = newTime - this.lapStartTime;
        this.recordedLaps.push(diff);
        this.lapStartTime = newTime;
        return diff;
    };

    /*
     * Stops/destroys the timer. Returns the obj:
     *   {recordedTimes: [...], recordedLaps: [...]}
     * Note that this does *not* record the final time. You do that with a
     * final call to recordTime() or recordLap() before calling this.
     */
    this.stop = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        // Stop
        this.isDone = true;

        return {recordedTimes: this.recordedTimes, recordedLaps: this.recordedLaps};
    };
}


/*
 * Helper function for making signed requests to the user-server or the
 * directory. Makes a POST request to the url with the given body (JS
 * object) encoded/signed in the format accepted by the servers. Calls
 * the successCallback with the response if we got one, or the errorCallback
 * if we didn't.
 */
var makeSignedRequest = function(url, body, successCallback, errorCallback, newPostTimer) {
    var signedBody = requests.makeBody(body,
      sessionStorage.getItem(constants.privateKeyVarName));

    // [METRICS] Record time to do signature
    if (newPostTimer) newPostTimer.recordLap();

    $.ajax({
        type: 'POST',
        url: url,
        data: signedBody,
        timeout: constants.requestTimeout,
        success: successCallback,
        error: errorCallback
    });
};

/*******************************************************************************
 * Define behavior of navbar
 ******************************************************************************/

// Feed button
$('#feed-button').click(function() {
    // console.log('Going to feed page...');

    window.location.href = constants.appBaseUrl + constants.urls.feed;
});


// Profile button
$('#profile-button').click(function() {
    // console.log('Going to profile page...');

    window.location.href = constants.appBaseUrl + constants.urls.profile
      + constants.bsid;
});


// Sign out button
$('#signout-button').click(function() {
    // console.log('Signing out...');

    // Sign out
    blockstack.signUserOut();

    // Redirect to login page
    window.location.href = constants.appBaseUrl;
});


// New post button
$('#new-post-button').click(function() {
    window.location.href = constants.appBaseUrl + constants.urls.newPost;
});

/*******************************************************************************
 * Index/login page scripts
 ******************************************************************************/

if (window.location.pathname === constants.urls.index) {


/*
 * Shows pending message on the sign-in button
 */
var showPendingMessage = function() {
    var pendingMessage = 'Signing you in...';
    $('#signin-button').prop('disabled', true);
    $('#signin-button').text(pendingMessage);
};


/*
 * Gets the user-server IP for this user. Tries to retrieve it from
 * sessionStorage first, or makes a request to the directory if it's
 * not in sessionStorage. Calls the callback with an object:
 *   {success: true, ip: ip}      (if successful)
 *   {success: false}             (if unsuccessful)
 */
var getMyIp = function(callback) {
    // Check sessionStorage first
    var potentialIp = sessionStorage.getItem(constants.userServerIpVarName);
    if (potentialIp !== null) {
        // console.log("Got this user's user-server IP from sessionStorage");
        callback({success: true, ip: potentialIp});
        return;
    }

    // Not found in sessionStorage. Make request to directory instead.
    var url = constants.directoryBaseUrl + '/api/get/' + constants.bsid;
    $.ajax({
        type: 'GET',
        url: url,
        timeout: constants.requestTimeout,

        success: function(resp) {
            var json = resp;
            if (json.success) {
                // Got their IP. Cache it and return it to callback
                // console.log("Got this user's user-server IP from directory.");
                sessionStorage.setItem(constants.userServerIpVarName, json.ip);
                callback({success: true, ip: json.ip});
            } else {
                // No entry for this user
                callback({success: false});
            }
        },

        error: function() {
            // Request failed
            callback({success: false});
        }
    });
};



/*
 * Define what to do once user has signed in
 */
var handleSignedInUser = function() {
    // console.log('User is signed in. Checking if they have a user-server...');

    // Check if this user has been set up with a user-server by seeing if
    // they have a user-server IP
    getMyIp(result => {
        var json = result;

        if (json.success) { // user has been set up
            // console.log('User has a user-server. Redirecting to feed...');

            // Get private key from storage, save in sessionStorage
            blockstack.getFile(constants.userPrivateKeyFile, false).then(contents => {
                var json = JSON.parse(contents);
                sessionStorage.setItem(constants.privateKeyVarName, json.privateKey);

                // Redirect to feed
                window.location.href = constants.appBaseUrl + constants.urls.feed;
                // console.log('Redirected to feed');
            }).catch(err => {
                // console.log('This should never happen: Failed to get '
                //  + constants.userPrivateKeyFile + ' from Blockstack storage. Error: ' + err);
            });
        }

        else { // user has not been set up yet
            // console.log('User does not have a user-server yet. Redirecting '
            //  + 'to initialization page...');

            // Redirect to initialization page
            window.location.href = constants.appBaseUrl + constants.urls.initialization;
        }

    });
};


if (blockstack.isUserSignedIn()) {
    showPendingMessage();
    handleSignedInUser();
}

else if (blockstack.isSignInPending()) {
    showPendingMessage();
    blockstack.handlePendingSignIn().then(userData => {
        handleSignedInUser();
    });
}

else {
    // Not signed in yet. Sign user in when they click the sign-in button.
    $('#signin-button').click(function() {
        showPendingMessage();
        blockstack.redirectToSignIn();
    });
}


}


/*******************************************************************************
 * Initialization page scripts
 ******************************************************************************/

if (window.location.pathname === constants.urls.initialization) {


// Process info when "Go" button is pressed

$('#go-button').click(function() {
    var processingMessage = 'Putting in a request for your cloud storage. '
      + 'Please wait...';
    var notSignedInMessage = 'You must sign in first! Redirecting to the '
      + 'login page...';
    var noPrivateKeyMessage = 'Please enter your private key.';
    var failedMessage = 'Oops! Something went wrong. Try again.';
    var successMessage = 'All done! Going to your feed now...';


    // Make sure user is signed in. They should already be signed in, since
    // they are only directed to this page after signing in. But just double
    // check in case they got here by accident.
    if (!blockstack.isUserSignedIn()) {
        $('#message').text(notSignedInMessage);
        alert(notSignedInMessage);
        window.location.href = constants.appBaseUrl;
        return;
    }

    // Make sure private key was actually typed in
    var privateKey = $('#private-key').val();
    if (privateKey === '') {
        $('#message').text(noPrivateKeyMessage);
        return;
    }

    // Display a message while we wait
    $('#message').text(processingMessage);


    // Make request to create a user-server for this user
    // TODO: Reimplement this to actually send a full request once you
    // have finished gathering performance metrics.
    var reqBody = "";
    $.post(constants.urls.createUserServer + '?requester=' + constants.bsid, reqBody, (data, status) => {
        var json = data;

        if (!json.success) {
            // Request failed. Display failure message to user
            $('#message').text(failedMessage);
            // console.log(constants.urls.createUserServer + ' request failed. Error message: '
            //  + json.msg);
            return;
        }


        // Success!
        $('#message').text(successMessage);

        // A few more things to do: initialize the value of user-server IP
        // address to nothing. This will be retrieved on next sign-in.
        sessionStorage.setItem(constants.userServerIpVarName, "");

        // Store private key in browser for reference from other pages, and
        // in Blockstack storage so we can pull it in future sessions.
        sessionStorage.setItem(constants.privateKeyVarName, privateKey);
        var content = JSON.stringify({
            privateKey: privateKey
        });
        blockstack.putFile(constants.userPrivateKeyFile, content, false)
        .then(() => {

            // Now we're done. Redirect to feed page
            // console.log('Success! Redirecting to feed page');
            window.location.href = constants.appBaseUrl + constants.urls.feed;


        }).catch(() => {
            $('message').text(failedMessage);
            // console.log('Failed to put private key in Blockstack storage.');
        });

    });
});


}


/*******************************************************************************
 * New-post page scripts
 ******************************************************************************/

if (window.location.pathname === constants.urls.newPost) {

const pendingMessage = 'Posting...';
const failureMessage = "Oops! Looks like it didn't go through. Try again.";
const successMessage = 'Posted!';

// [METRICS] Define timer
var newPostTimer;

// Process server reply when photo is uploaded
$('#new-post-form').ajaxForm({
    url: constants.userServerBaseUrl + '/api/add-photo',
    dataType: 'json',
    beforeSubmit: function(arr, $form, options) {
        // [METRICS] Start timer
        newPostTimer = new Timer();

        // Show pending message
        $('#message').text(pendingMessage);
    },

    success: function(resp) {
        // Check if it worked
        if (!resp.success) {
            // [METRICS] Print trial failed.
            console.error('Trial failed!');

            // Report failure
            $('#message').text(failureMessage);
            return;
        }

        // [METRICS] Record time to upload.
        newPostTimer.recordLap();

        // Now that photo is uploaded, make the request to add the post
        // itself
        var url = constants.userServerBaseUrl + '/api/add-post?requester='
          + constants.bsid;
        var body = {photoId: resp.photo.id, timestamp: requests.makeTimestamp()};
        makeSignedRequest(url, body,

        // Execute if got a response
        function(resp) {
            // [METRICS] Record time to make second request and end time. Print results
            newPostTimer.recordLap();
            newPostTimer.recordTime();
            var results = newPostTimer.stop();
            var timeTrialsStr = sessionStorage.getItem(sessionStorageTimeTrialsVar);
            if (timeTrialsStr === null) {
                sessionStorage.setItem(sessionStorageTimeTrialsVar, JSON.stringify([]));
                timeTrialsStr = sessionStorage.getItem(sessionStorageTimeTrialsVar);
            }
            var timeTrials = JSON.parse(timeTrialsStr);
            console.error('Finished trial ' + (timeTrials.length+1));
            timeTrials.push(results);
            sessionStorage.setItem(sessionStorageTimeTrialsVar, JSON.stringify(timeTrials));

            // Check if it worked
            if (!resp.success) {
                $('#message').text(failureMessage);
                return;
            }

            // Posted! Redirect to profile page
            $('#message').text(successMessage);
            window.location.href = constants.appBaseUrl + constants.urls.profile
              + constants.bsid;
        },

        // Execute if didn't get a response
        function() {
            // Show failure message
            $('#message').text(failureMessage);
        },

        newPostTimer);
    }
});

}

/*******************************************************************************
 * Scripts shared by profile and feed pages
 ******************************************************************************/

if (window.location.pathname.startsWith(constants.urls.profile) || window.location.pathname === constants.urls.feed) {


// Configure Masonry (tiling library for posts)
//   Ref: https://masonry.desandro.com/options.html (docs)
//        https://codepen.io/desandro/pen/QgMWzV/   (code sample)

var $posts = $('.posts-grid').masonry({
    itemSelector: '.post',
    columnWidth: '.posts-grid__col-sizer',
    gutter: '.posts-grid__gutter-sizer',
    percentPosition: true,
    stagger: 30,

    // Nicer reveal transition
    visibleStyle: { transform: 'translateY(0)', opacity: 1 },
    hiddenStyle: { transform: 'translateY(100px)', opacity: 0 }
});

var msnry = $posts.data('masonry');

/******************************************************************************/

// Some helper constants/functions for adding posts

var postsPerPage = 20;

var postHtmlTemplate = $('#post-template').html();  // defined in profile.html

/*
 * Simple micro templating. Returns the HTML string `html`, with all
 * occurrences of {{vars}} replaced by the vars in `vars`.
 *   Ref: Copied from one of the examples in the Infinite Scroll docs
 *        https://codepen.io/desandro/pen/LLjYgG/
 */
var microTemplate = function(html, vars) {
  // Replace {{tags}}
  return html.replace(/\{\{([\w\-_\.]+)\}\}/gi, function(match, key) {
    // Walk through objects to get value
    var value = vars;
    key.split('.').forEach(part => {
      value = value[part];
    });
    return value;
  });
};

/*
 * Helper function to convert a JSON timestamp to the format displayed on
 * the page.
 */
var formatTimestamp = function(timestamp) {
    return (new Date(timestamp)).toDateString();
};


/*
 * Appends posts to the page, given the JSON response from /get-posts for
 * the user `userBsid`. Calls the callback when done, in case any additional
 * actions need to be taken after the posts are added.
 */
var appendPosts = function(json, userBsid, callback) {
    // Parse JSON and construct HTML for the new posts
    var newPostsHtmlStr = json.posts.map(postJson => {
        var vars = {
            photoSrc: postJson.photo.path,
            timestamp: formatTimestamp(postJson.timestamp),
            bsid: userBsid
        };
        return microTemplate(postHtmlTemplate, vars);
    }).join('');

    // Compile HTML
    var newPostsHtml = $(newPostsHtmlStr);

    // Append new posts
    newPostsHtml.imagesLoaded(function() {
        $posts.append(newPostsHtml);
        $posts.masonry('appended', newPostsHtml);

        // Callback
        callback();
    });
};


}  // end of shared scripts for profile and feed pages



/*******************************************************************************
 * Profile page-specific scripts
 ******************************************************************************/

if (window.location.pathname.startsWith(constants.urls.profile)) {


// Load more posts when user clicks "More" button

const count = postsPerPage;
var offset = 0;

// Makes request for more posts
var getNextPosts = function() {
    const defaultButtonText = 'More';
    const noMorePostsMessage = 'No more posts!';
    const failureMessage = 'Oops! Something went wrong. Click to try again.';

    // Disable button while loading
    $('#more-posts-button').prop('disabled', true);

    // Get posts
    var url = constants.userServerBaseUrl + '/api/get-posts?requester='
      + constants.bsid;
    var body = {count: count, offset: offset, timestamp: requests.makeTimestamp()};
    makeSignedRequest(url, body,

    // Execute when function is received
    function(resp) {
        var json = resp;

        // If no posts left...
        if (!json.success || json.posts.length == 0) {
            if (offset == 0) {
                // No posts were loaded yet. This must mean there are no posts
                // at all.
                $('#no-posts-message').show();
                return;
            } else {
                // Disable the button and show no more posts message
                $('#more-posts-button').prop('disabled', true);
                $('#more-posts-button').text(noMorePostsMessage);
                return;
            }
        }

        appendPosts(json, constants.bsid, function() {
            // Clear the message and re-enable the button
            $('#more-posts-button').prop('disabled', false);
            $('#more-posts-button').text(defaultButtonText);
            $('#more-posts-button').show();

            // Adjust offset for next round
            offset += count;
        });
    },

    // Execute if error/no response
    function() {
        $('#more-posts-button').prop('disabled', false);
        $('#more-posts-button').text(failureMessage);
        $('#more-posts-button').show();
    });
};


$('#more-posts-button').click(function() {
    getNextPosts();
});


// Get first round of posts
getNextPosts();


} // end of profile page scripts

/*******************************************************************************
 * Feed page scripts
 ******************************************************************************/

if (window.location.pathname === constants.urls.feed) {

// Some constants/helper functions

// Keeps track of stats for each user I'm following:
//   - bsid
//   - count: num posts to get in current page
//   - offset: index of next post to get
//   - ip: cached IP address of user-server
var followingStats = [];


/*
 * Returns a random integer in range [0, max).
 */
var randomInt = function(max) {
    return Math.floor(max * Math.random());
};


/*
 * Gets the user-server IP for a given bsid. Pass the reference to the
 * entire stats list and the index of the particular user whose IP we
 * want. If it's not cached in the stats, makes a request to the
 * directory for it and caches it in the stats; otherwise, just pulls
 * from the stats. Calls the callback with an object of the form:
 *   {success: true, ip: ip}        if request was successful
 *   {success: false}               if not
 */
var getIpOf = function(index, followingStats, callback) {
    // Check if IP address is cached first
    if (followingStats[index].ip !== '') {
        // console.log('Using cached value of IP for ' + followingStats[index].bsid);
        callback({success: true, ip: followingStats[index].ip});
        return;
    }

    // Not cached. Make request to directory instead.
    var url = constants.directoryBaseUrl + '/api/get/' + followingStats[index].bsid;
    $.ajax({
        type: 'GET',
        url: url,
        timeout: constants.requestTimeout,

        success: function(resp) {
            var json = resp;
            if (json.success) {
                // Got their IP. Cache it and return it to callback
                // console.log('Using IP from directory GET request for ' + followingStats[index].bsid);
                followingStats[index].ip = json.ip;
                callback({success: true, ip: json.ip});
            } else {
                // No entry for this user
                callback({success: false});
            }
        },

        error: function() {
            // Request failed
            callback({success: false});
        }
    });
};


/*
 * Procedure for getting more posts
 */
var getNextPosts = function() {

    // Disable the "More" button while posts load
    $('#more-posts-button').prop('disabled', true);

    // Update/reset counts and offsets for each following
    for (var i = 0; i < followingStats.length; i++) {
        followingStats[i].offset += followingStats[i].count;
        followingStats[i].count = 0;
    }

    // Select a random following postsPerPage times. Each time a
    // following is selected, mark them for another post.
    for (var i = 0; i < postsPerPage; i++) {
        var r = randomInt(followingStats.length);
        followingStats[r].count++;
    }

    // Get new posts and append them to the page
    for (var i = 0; i < followingStats.length; i++) {
        // Skip followings that weren't selected
        if (followingStats[i].count <= 0) {
            // console.log('Skipping ' + followingStats[i].bsid);
            continue;
        }

        // Get user-server IP for this user
        // (Execute this within its own function to save the current stats
        // before i changes, since getIpOf() will execute asynchronously)
        (function() {

        var stats = followingStats[i];
        var index = i;
        getIpOf(index, followingStats, function(result) {
            // Skip this user if we couldn't get their IP
            if (!result.success) {
                // console.log('Failed to get user-server IP for ' + stats.bsid);
                return;
            }

            // Make request to that user-server
            var ip = result.ip;
            var url = constants.makeUserServerBaseUrl(ip)
              + '/api/get-posts?requester=' + constants.bsid;
            var data = {count: stats.count, offset: stats.offset,
                timestamp: requests.makeTimestamp()};
            makeSignedRequest(url, data,

            // Execute if request was successful
            function(resp) {
                var json = resp;

                // Check that there are posts
                if (!json.success || json.posts.length == 0) {
                    // console.log('Got response, but not posts for ' + stats.bsid);
                    return; // skip this user
                }

                // Append the posts for this user and re-enable button
                // (It's ok to re-enable the button when any of the posts
                // have loaded; not necessarily when *all* have loaded.)
                appendPosts(json, stats.bsid, function() {
                    // console.log('Appended posts for ' + stats.bsid);
                    $('#more-posts-button').prop('disabled', false);
                    $('#more-posts-button').show();
                });
            },

            // Execute if request failed
            function() {
                // console.log('Failed to get posts from user-server for ' + stats.bsid);
            });
        });

        })();
    }
};


/******************************************************************************/

// Populate the page

// Get list of users I'm following
var url = constants.userServerBaseUrl + '/api/get-profile-info?requester='
  + constants.bsid;
var data = {timestamp: requests.makeTimestamp()};
makeSignedRequest(url, data,

// Execute if successful
function(resp) {

    var json = resp;

    if (json.following.length == 0) {
        // Not following anyone. No feed to load
        $('#no-posts-message').show();
        return;
    }

    // Initialize stats for each following
    json.following.forEach(followingBsid => {
        followingStats.push({
            bsid: followingBsid,
            count: 0,
            offset: 0,
            ip: '',
        });
    });


    // Load more posts when user clicks "More" button
    $('#more-posts-button').click(function() {
        getNextPosts();
    });


    // Get first round of posts
    getNextPosts();

},

// Execute if failed
function() {
    $('#no-posts-message').text("Oops! Couldn't load your feed. Try reloading the page.");
    $('#no-posts-message').show();
});


} // end of feed scripts


/******************************************************************************/

});

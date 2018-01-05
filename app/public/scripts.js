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

const baseUrl = window.location.protocol + '//' + window.location.host;
const directoryBaseUrl = 'http://localhost:4000';
const privateKeyFile = 'privateKey.json';

// Keys into sessionStorage for private key and user-server IP address
const sessionStoragePrivateKey = 'privateKey';
const sessionStorageIp = 'userServerIp';


/*******************************************************************************
 * Index/login page scripts
 ******************************************************************************/

if (window.location.pathname === '/') {


/*
 * Define what to do once user has signed in
 */
var handleSignedInUser = function() {
    console.log('User is signed in. Checking if they have a user-server...');

    // Check if this user has been setup with a user-server yet by checking
    // directory
    // TODO: Get bsid from blockstack.js somehow
    var bsid = 'alice.id';
    $.get(directoryBaseUrl + '/api/get/' + bsid, (data, status) => {
        var json = data;

        if (json.success) { // user has been set up
            console.log('User has a user-server. Redirecting to feed...');

            // Save IP in sessionStorage
            sessionStorage.setItem(sessionStorageIp, json.ip);

            // Get private key from storage, save in sessionStorage
            blockstack.getFile(privateKeyFile, false).then(contents => {
                var json = JSON.parse(contents);
                sessionStorage.setItem(sessionStoragePrivateKey, json.privateKey);

                // Redirect to feed
                window.location.href = baseUrl + '/feed';
                console.log('Redirected to feed');
            }).catch(err => {
                console.log('This should never happen: Failed to get '
                  + privateKeyFile + ' from Blockstack storage. Error: ' + err);
            });
        }

        else { // user has not been set up yet
            console.log('User does not have a user-server yet. Redirecting '
              + 'to initialization page...');

            // Redirect to initialization page
            window.location.href = baseUrl + '/initialization';
        }

    });
};


// Sign user in when they click the sign-in button
$('#signin-button').click(function() {

    if (blockstack.isUserSignedIn()) {
        handleSignedInUser();
    }

    else if (blockstack.isSignInPending()) {
        blockstack.handlePendingSignIn().then(userData => {
            window.location = window.location.origin;
        });
    }

    else {
        // Not signed in yet
        blockstack.redirectToSignIn();
    }
});


}


/*******************************************************************************
 * Initialization page scripts
 ******************************************************************************/

if (window.location.pathname === '/initialization') {


// Process info when "Go" button is pressed

$('#go-button').click(function() {
    var processingMessage = 'Creating your cloud storage. Please wait (this '
      + 'may take a little while)...';
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
        window.location.href = baseUrl;
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
    // TODO: Get bsid from blockstack.js somehow
    var bsid = 'alice.id';
    var reqBody = JSON.stringify({privateKey: privateKey});
    $.post('/create-user-server?requester=' + bsid, reqBody, (data, status) => {
        var json = data;

        if (!json.success) {
            // Request failed. Display failure message to user
            $('#message').text(failedMessage);
            console.log('/create-user-server request failed. Error message: '
              + json.msg);
            return;
        }


        // Success!
        $('#message').text(successMessage);

        // A few more things to do: store IP address and private key in browser
        // for reference from other pages
        sessionStorage.setItem(sessionStorageIp, json.ip);
        sessionStorage.setItem(sessionStoragePrivateKey, privateKey);


        // Store private key in Blockstack storage
        var content = JSON.stringify({
            privateKey: privateKey
        });
        blockstack.putFile(privateKeyFile, content, false)
        .then(() => {

            // Now we're done. Redirect to feed page
            console.log('Success! Redirecting to feed page');
            window.location.href = baseUrl + '/feed';


        }).catch(() => {
            $('message').text(failedMessage);
            console.log('Failed to put private key in Blockstack storage.');
        });

    });
});


}



/*******************************************************************************
 * Profile and Feed page scripts
 ******************************************************************************/

if (window.location.pathname.startsWith('/profile') || window.location.pathname === '/feed') {

// Some setup so the client is ready to make requests to either the user-server
// or the directory.

// Load user-server's IP address
const userServerIp = sessionStorage.getItem(sessionStorageIp);

// Load user's private key (for signatures)
const userPrivateKey = sessionStorage.getItem(sessionStoragePrivateKey);

// Load user's Blockstack ID
// TODO: Implement
const bsid = 'alice.id';

/*
 * Helper function for making signed requests to the user-server or the
 * directory. Makes a POST request to the url, with the body (JS object)
 * appended a timestamp, and then encoded/signed in the format accepted by
 * the servers. Returns a Promise for the response. Resolves if request
 * is successful; rejects with an error if the request fails.
 */
var makeSignedRequest = function(url, body) {
    // TODO: implement
    return new Promise((resolve, reject) => {
        reject();
    });
};


/******************************************************************************/

// Define behavior of navbar

// Feed button
$('#feed-button').click(function() {
    console.log('Going to feed page...');

    window.location.href = baseUrl + '/feed';
});


// Profile button
$('#profile-button').click(function() {
    console.log('Going to profile page...');

    window.location.href = baseUrl + '/profile/' + bsid;
});


// Sign out button
$('#signout-button').click(function() {
    console.log('Signing out...');

    // Sign out
    blockstack.signUserOut();

    // Redirect to login page
    window.location.href = baseUrl;
});


/******************************************************************************/

// Some helper constants/functions for infinite scroll

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

/******************************************************************************/

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

// Configure infinite scroll for posts
//   Ref: https://infinite-scroll.com/options.html#responsetype

var unsplashId = '9ad80b14098bcead9c7de952435e937cc3723ae61084ba8e729adb642daf0251';

$posts.infiniteScroll({
    // Define url to request for next set of photos
    // TODO: Uncomment this when you're ready for dynamic content
    // path: function() {
    //     var count = 20;
    //     var offset = this.loadCount * count;
    //     return userServerBaseUrl + '/get-feed/' + count + '/' + offset;
    // },
    path: 'https://api.unsplash.com/photos?page={{#}}&client_id=' + unsplashId,

    // Do not immediately append, since the response is JSON (not HTML)
    append: false,
    responseType: 'text',
    history: false,

    // Integrate with Masonry
    outlayer: msnry
});

$posts.on('load.infiniteScroll', function(event, response) {
    // Parse JSON and construct HTML for the new posts
    var newPostsJson = JSON.parse(response);

    // Make sure there are an even number of posts to add
    if (newPostsJson.length % 2 != 0) {
        newPostsJson.pop();
    }

    // Construct HTML for new posts
    newPosts = newPostsJson.map(json => {
        var vars = {
            photoSrc: json.urls.regular,
            caption: 'Sample caption',
            timestamp: new Date(json.created_at).toDateString()
        };
        return microTemplate(postHtmlTemplate, vars);
    }).join('');

    // Compile HTML
    var newPostsHtml = $(newPosts);

    // Append new posts
    newPostsHtml.imagesLoaded(function() {
        $posts.infiniteScroll('appendItems', newPostsHtml);
        $posts.masonry('appended', newPostsHtml);
    });
});

// Load initial page
$posts.infiniteScroll('loadNextPage');

/******************************************************************************/

} // end of Profile and Feed page scripts

});

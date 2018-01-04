/*
 * index.js
 * Author: Michael Friedman
 *
 * Scripts for the index (login) page.
 */

$(document).ready(function() {

/******************************************************************************/

// Constants

const baseUrl = window.location.protocol + '//' + window.location.host;
const directoryBaseUrl = 'http://localhost:4000';
const privateKeyFile = 'privateKey.json';

// Keys into sessionStorage for private key and user-server IP address
const sessionStoragePrivateKey = 'privateKey';
const sessionStorageIp = 'userServerIp';


/******************************************************************************/

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


/******************************************************************************/

});
